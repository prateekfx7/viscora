/**
 * optimizer.ts — SRP + CSS optimization + pre-scheduling
 *
 * (a) SRP optimizer: SPM, stroke length, asymmetric VFD → maximize rate, minimize kWh/bbl
 * (b) CSS optimizer: steam volume, injection pressure, soak days, cut-off → Pareto front
 * (c) Dynamic cut-off: end when marginal oil revenue < marginal lift + energy cost
 * (d) Pre-scheduling: predict cooling curve → schedule SPM/VFD across cycle
 */

import type {
  SRPOptimizationResult,
  CSSOptimizationPoint,
  VFDSchedulePoint,
  RodSegment,
  SRPParams,
  ThermalParams,
  InflowParams,
} from "@/types";
import { dynamicViscosity } from "./viscosity";
import { sandFaceTemperature, DEFAULT_THERMAL_PARAMS } from "./thermal";
import { oilInflowRate, DEFAULT_INFLOW_PARAMS, pumpDisplacement } from "./inflow";
import { generateDynoCard, motorPower, DEFAULT_ROD_STRING } from "./srp";

// ─── Constants ───────────────────────────────────────────────────────────────

const OIL_PRICE_USD_BBL = 75;
const ELECTRICITY_COST_USD_KWH = 0.08;
const STEAM_COST_USD_BBL = 12; // cost to generate 1 bbl CWE steam
const HOURS_PER_DAY = 24;

// ─── SRP Optimizer ───────────────────────────────────────────────────────────

interface SRPSearchSpace {
  spmRange: [number, number];
  strokeRange: [number, number]; // meters
  vfdUpRange: [number, number]; // Hz
  vfdDownRange: [number, number]; // Hz
}

const DEFAULT_SRP_SEARCH: SRPSearchSpace = {
  spmRange: [2, 8],
  strokeRange: [1.2, 3.0],
  vfdUpRange: [40, 60],
  vfdDownRange: [25, 45],
};

/**
 * SRP optimizer: grid search + refinement for best SPM, stroke, VFD profile.
 * Asymmetric VFD: slower downstroke (prevents floating), faster upstroke (more displacement).
 */
export function optimizeSRP(
  viscosity_cp: number,
  api_gravity: number,
  pumpDepth_m: number = 400,
  pumpDiameter_mm: number = 44,
  fluidLevel_m: number = 250,
  rodString: RodSegment[] = DEFAULT_ROD_STRING,
  search: SRPSearchSpace = DEFAULT_SRP_SEARCH
): SRPOptimizationResult {
  const fluidDensity = 950; // kg/m³ heavy crude

  let bestResult: SRPOptimizationResult | null = null;
  let bestScore = -Infinity;

  const spmSteps = 7;
  const strokeSteps = 5;
  const vfdUpSteps = 3;
  const vfdDownSteps = 4;

  for (let si = 0; si <= spmSteps; si++) {
    const spm = search.spmRange[0] + (search.spmRange[1] - search.spmRange[0]) * (si / spmSteps);

    for (let sti = 0; sti <= strokeSteps; sti++) {
      const stroke = search.strokeRange[0] + (search.strokeRange[1] - search.strokeRange[0]) * (sti / strokeSteps);

      for (let ui = 0; ui <= vfdUpSteps; ui++) {
        const vfdUp = search.vfdUpRange[0] + (search.vfdUpRange[1] - search.vfdUpRange[0]) * (ui / vfdUpSteps);

        for (let di = 0; di <= vfdDownSteps; di++) {
          const vfdDown = search.vfdDownRange[0] + (search.vfdDownRange[1] - search.vfdDownRange[0]) * (di / vfdDownSteps);

          const srpParams: SRPParams = {
            spm,
            stroke_length_m: stroke,
            rod_string: rodString,
            pump_depth_m: pumpDepth_m,
            pump_diameter_mm: pumpDiameter_mm,
            fluid_level_m: fluidLevel_m,
            fluid_density_kg_m3: fluidDensity,
            viscosity_cp,
            vfd_upstroke_hz: vfdUp,
            vfd_downstroke_hz: vfdDown,
          };

          const dyno = generateDynoCard(srpParams);

          // Constraints
          if (dyno.rod_floating) continue;
          if (dyno.stress_ratio > 0.9) continue;
          if (dyno.fillage_pct < 80 || dyno.fillage_pct > 95) continue;

          // Peak rod load limit (safety factor)
          if (dyno.peak_load_kn > 80) continue; // ~80 kN limit for conventional units

          // Predicted rate
          const displacement = pumpDisplacement(pumpDiameter_mm, stroke, spm);
          const rate = displacement * (dyno.fillage_pct / 100) * 0.85; // volumetric efficiency

          // Power consumption
          const power = motorPower(dyno.peak_load_kn, stroke, spm);
          const kwhPerBbl = rate > 0 ? (power * HOURS_PER_DAY) / rate : 999;

          // Objective: maximize rate, minimize kWh/bbl
          // Score = rate - penalty * kWh/bbl
          const score = rate - 2 * kwhPerBbl;

          if (score > bestScore) {
            bestScore = score;
            bestResult = {
              spm: Math.round(spm * 10) / 10,
              stroke_length_m: Math.round(stroke * 100) / 100,
              vfd_upstroke_hz: Math.round(vfdUp),
              vfd_downstroke_hz: Math.round(vfdDown),
              predicted_rate_bpd: Math.round(rate * 10) / 10,
              kwh_per_bbl: Math.round(kwhPerBbl * 10) / 10,
              fillage_pct: dyno.fillage_pct,
              stress_ratio: dyno.stress_ratio,
              rod_floating: false,
            };
          }
        }
      }
    }
  }

  // Fallback if no feasible solution
  if (!bestResult) {
    return {
      spm: 4,
      stroke_length_m: 2.0,
      vfd_upstroke_hz: 50,
      vfd_downstroke_hz: 35,
      predicted_rate_bpd: 10,
      kwh_per_bbl: 30,
      fillage_pct: 85,
      stress_ratio: 0.7,
      rod_floating: false,
    };
  }

  return bestResult;
}

// ─── CSS Optimizer (Pareto Front) ────────────────────────────────────────────

interface CSSSearchSpace {
  steamVolumeRange: [number, number]; // bbl CWE
  injPressureRange: [number, number]; // kPa
  soakDaysRange: [number, number];
  cutoffRange: [number, number]; // bpd
}

const DEFAULT_CSS_SEARCH: CSSSearchSpace = {
  steamVolumeRange: [500, 3000],
  injPressureRange: [1000, 3500],
  soakDaysRange: [5, 21],
  cutoffRange: [3, 15],
};

/**
 * CSS optimizer: random search + Pareto filter.
 * Objectives: maximize cumulative oil, minimize SOR, minimize energy cost.
 */
export function optimizeCSS(
  api_gravity: number = 18,
  numSamples: number = 500,
  search: CSSSearchSpace = DEFAULT_CSS_SEARCH
): CSSOptimizationPoint[] {
  const candidates: CSSOptimizationPoint[] = [];

  // Seeded random for reproducibility
  let seed = 42;
  const random = (): number => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < numSamples; i++) {
    const steamVolume = search.steamVolumeRange[0] +
      random() * (search.steamVolumeRange[1] - search.steamVolumeRange[0]);
    const injPressure = search.injPressureRange[0] +
      random() * (search.injPressureRange[1] - search.injPressureRange[0]);
    const soakDays = Math.round(search.soakDaysRange[0] +
      random() * (search.soakDaysRange[1] - search.soakDaysRange[0]));
    const cutoff = search.cutoffRange[0] +
      random() * (search.cutoffRange[1] - search.cutoffRange[0]);

    // Simulate cycle
    const result = simulateCSSCycle(
      api_gravity,
      steamVolume,
      injPressure,
      soakDays,
      cutoff
    );

    if (result) {
      candidates.push(result);
    }
  }

  // Pareto filter: maximize cum_oil, minimize SOR
  return paretoFilter(candidates);
}

function simulateCSSCycle(
  api_gravity: number,
  steamVolume: number,
  injPressure: number,
  soakDays: number,
  cutoffBpd: number
): CSSOptimizationPoint | null {
  const thermalParams: ThermalParams = {
    steam_volume_bbl: steamVolume,
    inj_pressure_kpa: injPressure,
    soak_days: soakDays,
    ...DEFAULT_THERMAL_PARAMS,
  };

  let cumOil = 0;
  let totalDays = soakDays;
  const maxProductionDays = 180;

  for (let d = 1; d <= maxProductionDays; d++) {
    const daysSinceSteam = soakDays + d;
    const temp = sandFaceTemperature(thermalParams, daysSinceSteam);
    const visc = dynamicViscosity({ api_gravity, temperature_c: temp });

    const inflowParams: InflowParams = {
      ...DEFAULT_INFLOW_PARAMS,
      viscosity_cp: visc,
    };

    const rate = oilInflowRate(inflowParams, 1500); // ~1500 kPa BHP

    if (rate < cutoffBpd) break;

    cumOil += rate;
    totalDays++;
  }

  if (cumOil < 10) return null; // too little oil

  const sor = steamVolume / cumOil;
  const steamCost = steamVolume * STEAM_COST_USD_BBL;
  const liftCost = totalDays * 15 * ELECTRICITY_COST_USD_KWH * HOURS_PER_DAY; // ~15 kW avg
  const energyCost = steamCost + liftCost;

  return {
    steam_volume_bbl: Math.round(steamVolume),
    inj_pressure_kpa: Math.round(injPressure),
    soak_days: soakDays,
    production_cutoff_bpd: Math.round(cutoffBpd * 10) / 10,
    cum_oil_bbl: Math.round(cumOil),
    sor: Math.round(sor * 100) / 100,
    energy_cost_usd: Math.round(energyCost),
    cycle_duration_days: totalDays,
  };
}

function paretoFilter(points: CSSOptimizationPoint[]): CSSOptimizationPoint[] {
  // Pareto-optimal: maximize cum_oil, minimize SOR
  const pareto: CSSOptimizationPoint[] = [];

  for (const candidate of points) {
    let dominated = false;

    for (const other of points) {
      if (other === candidate) continue;

      // other dominates candidate if better or equal in ALL objectives and strictly better in at least one
      if (
        other.cum_oil_bbl >= candidate.cum_oil_bbl &&
        other.sor <= candidate.sor &&
        other.energy_cost_usd <= candidate.energy_cost_usd &&
        (other.cum_oil_bbl > candidate.cum_oil_bbl ||
          other.sor < candidate.sor ||
          other.energy_cost_usd < candidate.energy_cost_usd)
      ) {
        dominated = true;
        break;
      }
    }

    if (!dominated) {
      pareto.push(candidate);
    }
  }

  // Sort by cum_oil descending
  pareto.sort((a, b) => b.cum_oil_bbl - a.cum_oil_bbl);

  return pareto;
}

// ─── Dynamic Cut-off ─────────────────────────────────────────────────────────

/**
 * Determine if production should stop based on marginal economics.
 * Returns true if marginal revenue < marginal cost.
 */
export function shouldCutOff(
  oilRate_bpd: number,
  motorPower_kw: number,
  steamCostPerDay_usd: number = 0
): boolean {
  const dailyRevenue = oilRate_bpd * OIL_PRICE_USD_BBL;
  const dailyLiftCost = motorPower_kw * HOURS_PER_DAY * ELECTRICITY_COST_USD_KWH;
  const dailyCost = dailyLiftCost + steamCostPerDay_usd;

  return dailyRevenue < dailyCost * 1.2; // 20% margin
}

// ─── Pre-Scheduling ──────────────────────────────────────────────────────────

/**
 * Generate a VFD/SPM schedule across a CSS production cycle.
 * Uses predicted cooling curve to pre-plan setpoint changes:
 *   - Fast early (high SPM, normal VFD) when oil is hot
 *   - Gentler later (lower SPM, slower downstroke) as viscosity rises
 */
export function generatePreSchedule(
  api_gravity: number,
  thermalParams: ThermalParams,
  cycleDurationDays: number,
  scheduleIntervalDays: number = 7
): VFDSchedulePoint[] {
  const schedule: VFDSchedulePoint[] = [];

  for (let d = 0; d <= cycleDurationDays; d += scheduleIntervalDays) {
    const daysSinceSteam = thermalParams.soak_days + d;
    const temp = sandFaceTemperature(thermalParams, daysSinceSteam);
    const visc = dynamicViscosity({ api_gravity, temperature_c: temp });

    // Optimize SRP for current viscosity
    const srpResult = optimizeSRP(visc, api_gravity);

    schedule.push({
      day: d,
      spm: srpResult.spm,
      vfd_upstroke_hz: srpResult.vfd_upstroke_hz,
      vfd_downstroke_hz: srpResult.vfd_downstroke_hz,
    });
  }

  return schedule;
}
