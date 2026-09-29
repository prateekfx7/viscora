/**
 * inflow.ts — Vogel/Darcy inflow performance relationship
 *
 * Accounts for viscosity-dependent productivity:
 *   PI_actual = PI_ref × (μ_ref / μ_actual)
 *
 * Uses Vogel's IPR below bubble point and Darcy above.
 * Low reservoir pressure typical of Baghewala (~3,000–5,000 kPa).
 */

import type { InflowParams } from "@/types";

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Oil inflow rate (bpd) at a given flowing bottom-hole pressure.
 *
 * Vogel's equation (below bubble point):
 *   q/q_max = 1 - 0.2*(Pwf/Pr) - 0.8*(Pwf/Pr)²
 *
 * Darcy (above bubble point):
 *   q = PI × (Pr - Pwf)
 *
 * Viscosity correction:
 *   PI_corrected = PI_ref × (μ_ref / μ_actual)
 */
export function oilInflowRate(
  params: InflowParams,
  flowing_bhp_kpa: number
): number {
  const {
    reservoir_pressure_kpa,
    bubble_point_kpa,
    productivity_index,
    viscosity_cp,
    reference_viscosity_cp,
  } = params;

  // Viscosity correction on PI
  const pi_corrected = productivity_index * (reference_viscosity_cp / viscosity_cp);

  const Pr = reservoir_pressure_kpa;
  const Pwf = Math.max(flowing_bhp_kpa, 0);

  if (Pr <= 0) return 0;

  if (Pwf >= Pr) return 0;

  if (Pr <= bubble_point_kpa) {
    // All below bubble point — use Vogel
    const q_max = pi_corrected * Pr / 1.8; // Vogel max rate
    const ratio = Pwf / Pr;
    const q = q_max * (1 - 0.2 * ratio - 0.8 * ratio * ratio);
    return Math.max(q, 0);
  }

  if (Pwf >= bubble_point_kpa) {
    // All above bubble point — Darcy linear
    return pi_corrected * (Pr - Pwf);
  }

  // Composite: Darcy above Pb, Vogel below
  const q_at_pb = pi_corrected * (Pr - bubble_point_kpa);
  const q_max_vogel = q_at_pb + (pi_corrected * bubble_point_kpa) / 1.8;
  const ratio = Pwf / bubble_point_kpa;
  const q_below = q_max_vogel * (1 - 0.2 * ratio - 0.8 * ratio * ratio);

  return Math.max(q_below, 0);
}

/**
 * Compute flowing BHP from fluid level above pump.
 *   Pwf = ρ × g × fluid_level + wellhead_pressure
 */
export function flowingBHP(
  fluid_level_m: number,
  fluid_density_kg_m3: number,
  wellhead_pressure_kpa: number = 200
): number {
  const g = 9.81; // m/s²
  const hydrostatic_kpa = (fluid_density_kg_m3 * g * fluid_level_m) / 1000;
  return wellhead_pressure_kpa + hydrostatic_kpa;
}

/**
 * Default inflow parameters for Baghewala wells.
 */
export const DEFAULT_INFLOW_PARAMS: Omit<InflowParams, "viscosity_cp"> = {
  reservoir_pressure_kpa: 4000, // ~40 bar, low pressure
  bubble_point_kpa: 2500,
  productivity_index: 0.15, // bpd/kPa — low for heavy oil
  reference_viscosity_cp: 15, // measured at hot conditions
};

/**
 * Estimate pump displacement (theoretical rate) from SRP parameters.
 *   Q_th = π/4 × D² × S × N × 1440 (convert to bpd)
 */
export function pumpDisplacement(
  pump_diameter_mm: number,
  stroke_length_m: number,
  spm: number
): number {
  const D_m = pump_diameter_mm / 1000;
  const area_m2 = (Math.PI / 4) * D_m * D_m;
  const volume_per_stroke_m3 = area_m2 * stroke_length_m;
  const m3_per_day = volume_per_stroke_m3 * spm * 1440; // 1440 min/day
  const bpd = m3_per_day / 0.159; // m³ to bbl
  return bpd;
}
