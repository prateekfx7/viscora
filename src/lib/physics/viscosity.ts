/**
 * viscosity.ts — Walther/ASTM D341 viscosity-temperature correlation
 *
 * Fitted for Baghewala heavy crude (17–19 °API):
 *   ~47 °C reservoir → ~8,000–12,000 cP (cold, very thick)
 *   ~150 °C (steam)  → ~10–30 cP (hot, flowable)
 *
 * Walther equation:  log10(log10(ν + 0.7)) = A - B * log10(T_K)
 * Then dynamic viscosity μ = ν * ρ
 */

import type { ViscosityParams } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Walther coefficients fitted for ~18 °API heavy crude */
const WALTHER_A = 10.5;
const WALTHER_B = 3.68;

/** Dead oil density at 15 °C for given API (kg/m³) */
function apiToDensity(api: number): number {
  return 141.5 / (api / 1000 + 131.5) * 1000;
  // Simplified: ρ = 141500 / (API + 131.5)
}

function apiToDensityCorrect(api: number): number {
  // Standard: SG = 141.5 / (131.5 + API)
  const sg = 141.5 / (131.5 + api);
  return sg * 1000; // kg/m³
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute kinematic viscosity (cSt) using Walther/ASTM equation
 */
export function kinematicViscosity(temperature_c: number): number {
  const T_K = temperature_c + 273.15;
  const logT = Math.log10(T_K);
  const inner = WALTHER_A - WALTHER_B * logT;
  // log10(log10(ν + 0.7)) = inner
  const nuPlus07 = Math.pow(10, Math.pow(10, inner));
  const nu = Math.max(nuPlus07 - 0.7, 0.5); // floor at 0.5 cSt
  return nu;
}

/**
 * Compute dynamic viscosity (cP = mPa·s) for Baghewala heavy crude.
 *
 * μ (cP) = ν (cSt) × ρ (g/cm³)
 *   since 1 cSt × 1 g/cm³ = 1 cP
 */
export function dynamicViscosity(params: ViscosityParams): number {
  const { api_gravity, temperature_c, asphaltene_factor = 1.0 } = params;

  const nu_cst = kinematicViscosity(temperature_c);
  const rho_kg_m3 = apiToDensityCorrect(api_gravity);
  const rho_g_cm3 = rho_kg_m3 / 1000;

  // μ = ν × ρ (in cSt × g/cm³ = cP)
  const mu = nu_cst * rho_g_cm3 * asphaltene_factor;

  return Math.round(mu * 100) / 100; // 2 decimal places
}

/**
 * Density of crude at a given temperature (simplified linear correction).
 * β ≈ 0.00065 /°C for heavy crude.
 */
export function crudeDensity(api_gravity: number, temperature_c: number): number {
  const rho15 = apiToDensityCorrect(api_gravity);
  const beta = 0.00065; // thermal expansion coefficient
  return rho15 * (1 - beta * (temperature_c - 15));
}

/**
 * Quick lookup: viscosity at reference conditions
 */
export function referenceViscosity(api_gravity: number): number {
  return dynamicViscosity({ api_gravity, temperature_c: 47 });
}
