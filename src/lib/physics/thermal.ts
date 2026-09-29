/**
 * thermal.ts — Reduced-order Marx-Langenheim heated-zone model
 *
 * During injection: heated radius grows as steam is injected.
 * After injection (soak + production): exponential cooling of sandface.
 *
 * Sandface temperature drives everything:
 *   T_sandface → viscosity → inflow → pump behaviour
 */

import type { ThermalParams } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const STEAM_TEMP_AT_1000KPA = 180; // °C (saturated steam ~1 MPa)
const STEAM_TEMP_AT_3000KPA = 235; // °C (saturated steam ~3 MPa)
const LATENT_HEAT_KJ_KG = 2015; // approx latent heat of steam
const WATER_DENSITY = 1000; // kg/m³
const BBL_TO_M3 = 0.159; // 1 bbl ≈ 0.159 m³
const ROCK_HEAT_CAPACITY = 2200; // kJ/(m³·°C) volumetric

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Saturated steam temperature as a function of injection pressure.
 * Simple linear interpolation between known points.
 */
export function steamTemperature(pressure_kpa: number): number {
  // Antoine-like simplified correlation for saturated steam
  if (pressure_kpa <= 100) return 100;
  if (pressure_kpa >= 5000) return 264;

  // log-linear fit: T ≈ 100 + 55 * ln(P_kpa / 100)
  return 100 + 55 * Math.log(pressure_kpa / 100);
}

/**
 * Marx-Langenheim heated zone radius (m) at end of injection.
 *
 * Q_steam = m_steam × L (total heat injected)
 * V_heated = Q_steam / (ρ_rock × c_rock × ΔT)
 * r_heated = sqrt(V_heated / (π × h))
 */
export function heatedRadius(params: {
  steam_volume_bbl: number;
  inj_pressure_kpa: number;
  reservoir_temp_c: number;
  formation_thickness_m: number;
}): number {
  const { steam_volume_bbl, inj_pressure_kpa, reservoir_temp_c, formation_thickness_m } = params;

  const T_steam = steamTemperature(inj_pressure_kpa);
  const deltaT = T_steam - reservoir_temp_c;

  // Mass of steam (kg) — CWE (cold water equivalent)
  const m_steam = steam_volume_bbl * BBL_TO_M3 * WATER_DENSITY;

  // Total heat injected (kJ)
  const Q_total = m_steam * LATENT_HEAT_KJ_KG;

  // Volume heated (m³)
  const V_heated = Q_total / (ROCK_HEAT_CAPACITY * deltaT);

  // Cylindrical heated zone: V = π × r² × h
  const r = Math.sqrt(V_heated / (Math.PI * formation_thickness_m));

  return Math.max(r, 0.5); // minimum 0.5 m
}

// ─── Main API ────────────────────────────────────────────────────────────────

/**
 * Compute sandface temperature at a given number of days since steam injection ended.
 *
 * During soak (days ≤ soak_days): temperature stays near peak (slight cooling).
 * After soak (production): exponential decay toward reservoir temperature.
 *
 * T(t) = T_reservoir + (T_peak - T_reservoir) × exp(-t / τ)
 *
 * τ (time constant) depends on heated radius and thermal diffusivity:
 *   τ = r_h² / (4 × α)
 */
export function sandFaceTemperature(
  params: ThermalParams,
  days_since_steam: number
): number {
  const {
    steam_volume_bbl,
    inj_pressure_kpa,
    soak_days,
    reservoir_temp_c,
    formation_thickness_m,
    thermal_diffusivity_m2_per_day,
  } = params;

  const T_steam = steamTemperature(inj_pressure_kpa);

  // Peak temperature at sandface (some heat loss during injection)
  const efficiency = 0.7; // 70% thermal efficiency
  const T_peak = reservoir_temp_c + (T_steam - reservoir_temp_c) * efficiency;

  // Heated radius
  const r_h = heatedRadius({
    steam_volume_bbl,
    inj_pressure_kpa,
    reservoir_temp_c,
    formation_thickness_m,
  });

  // Time constant (days)
  const tau = (r_h * r_h) / (4 * thermal_diffusivity_m2_per_day);

  if (days_since_steam <= 0) {
    // Still injecting
    return T_peak;
  }

  if (days_since_steam <= soak_days) {
    // During soak — slow cooling, conduction only
    const soak_tau = tau * 3; // slower during soak (no flow)
    return reservoir_temp_c + (T_peak - reservoir_temp_c) * Math.exp(-days_since_steam / soak_tau);
  }

  // Production phase — exponential cooling
  const production_days = days_since_steam - soak_days;

  // Temperature at end of soak
  const T_end_soak =
    reservoir_temp_c + (T_peak - reservoir_temp_c) * Math.exp(-soak_days / (tau * 3));

  // Exponential cooling during production (faster due to fluid flow)
  const production_tau = tau * 0.8; // faster cooling during production
  const T = reservoir_temp_c + (T_end_soak - reservoir_temp_c) * Math.exp(-production_days / production_tau);

  return Math.max(T, reservoir_temp_c);
}

/**
 * Generate a full cooling curve over a CSS cycle.
 * Returns array of { day, temperature_c } for plotting.
 */
export function coolingCurve(
  params: ThermalParams,
  total_days: number,
  step_days: number = 1
): Array<{ day: number; temperature_c: number }> {
  const points: Array<{ day: number; temperature_c: number }> = [];

  for (let d = 0; d <= total_days; d += step_days) {
    points.push({
      day: d,
      temperature_c: Math.round(sandFaceTemperature(params, d) * 10) / 10,
    });
  }

  return points;
}

/**
 * Default thermal parameters for Baghewala field.
 */
export const DEFAULT_THERMAL_PARAMS: Omit<ThermalParams, "steam_volume_bbl" | "inj_pressure_kpa" | "soak_days"> = {
  reservoir_temp_c: 47,
  formation_thickness_m: 12,
  thermal_diffusivity_m2_per_day: 0.05, // m²/day, typical sandstone
};
