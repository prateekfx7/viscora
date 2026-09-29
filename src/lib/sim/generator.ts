/**
 * generator.ts — Physics-based synthetic data generator
 *
 * Simulates full CSS cycles:
 *   injection → soak → production (temperature decay → viscosity rise → inflow drop)
 *
 * Two modes:
 *   "baseline" — manual, reactive: rod floating, rod failure ~day 40
 *   "thermotwin" — pre-scheduled setpoints, failure avoided, optimized cut-off
 */

import type {
  Well,
  CSSCycle,
  TelemetryRow,
  DynoCard,
  Alert,
  Failure,
  ThermalParams,
  InflowParams,
  SRPParams,
  WellMode,
  VFDSchedulePoint,
} from "@/types";
import { dynamicViscosity, crudeDensity } from "@/lib/physics/viscosity";
import { sandFaceTemperature, DEFAULT_THERMAL_PARAMS } from "@/lib/physics/thermal";
import { oilInflowRate, DEFAULT_INFLOW_PARAMS, pumpDisplacement } from "@/lib/physics/inflow";
import { generateDynoCard, motorPower, DEFAULT_ROD_STRING } from "@/lib/physics/srp";
import { generatePreSchedule, shouldCutOff } from "@/lib/physics/optimizer";

// ─── Well Definitions ────────────────────────────────────────────────────────

export const DEMO_WELLS: Well[] = [
  {
    id: "well-001",
    name: "BGW-101",
    api_gravity: 17.5,
    depth_m: 420,
    pump_depth_m: 380,
    rod_string: DEFAULT_ROD_STRING,
    lat: 27.855,
    lng: 71.325,
    status: "producing",
  },
  {
    id: "well-002",
    name: "BGW-102",
    api_gravity: 18.2,
    depth_m: 400,
    pump_depth_m: 360,
    rod_string: DEFAULT_ROD_STRING,
    lat: 27.858,
    lng: 71.330,
    status: "producing",
  },
  {
    id: "well-003",
    name: "BGW-103",
    api_gravity: 18.8,
    depth_m: 435,
    pump_depth_m: 395,
    rod_string: DEFAULT_ROD_STRING,
    lat: 27.852,
    lng: 71.328,
    status: "soaking",
  },
  {
    id: "well-004",
    name: "BGW-104",
    api_gravity: 17.0,
    depth_m: 410,
    pump_depth_m: 370,
    rod_string: DEFAULT_ROD_STRING,
    lat: 27.860,
    lng: 71.322,
    status: "injecting",
  },
  {
    id: "well-005",
    name: "BGW-105",
    api_gravity: 19.0,
    depth_m: 390,
    pump_depth_m: 350,
    rod_string: DEFAULT_ROD_STRING,
    lat: 27.856,
    lng: 71.335,
    status: "producing",
  },
];

// ─── Simulation ──────────────────────────────────────────────────────────────

interface SimulationResult {
  telemetry: TelemetryRow[];
  dynoCards: DynoCard[];
  alerts: Alert[];
  failures: Failure[];
  cycle: CSSCycle;
}

let idCounter = 0;
function genId(prefix: string): string {
  idCounter++;
  return `${prefix}-${idCounter.toString().padStart(6, "0")}`;
}

/**
 * Simulate one full CSS cycle for a well.
 */
export function simulateCycle(
  well: Well,
  cycleNo: number,
  mode: WellMode,
  steamVolume: number = 1500,
  injPressure: number = 2000,
  soakDays: number = 10,
  startDate: Date = new Date()
): SimulationResult {
  const thermalParams: ThermalParams = {
    steam_volume_bbl: steamVolume,
    inj_pressure_kpa: injPressure,
    soak_days: soakDays,
    ...DEFAULT_THERMAL_PARAMS,
  };

  // Pre-schedule for thermotwin mode
  const preSchedule: VFDSchedulePoint[] =
    mode === "thermotwin"
      ? generatePreSchedule(well.api_gravity, thermalParams, 120)
      : [];

  const telemetry: TelemetryRow[] = [];
  const dynoCards: DynoCard[] = [];
  const alerts: Alert[] = [];
  const failures: Failure[] = [];

  // Baseline settings (manual, reactive)
  let currentSpm = mode === "baseline" ? 6 : 5;
  let currentStroke = 2.0;
  let currentVfdUp = 50;
  let currentVfdDown = mode === "baseline" ? 50 : 35; // baseline: symmetric
  let cumOil = 0;
  let hasRodFailure = false;
  const maxDays = mode === "baseline" ? 90 : 120;

  for (let day = 1; day <= maxDays; day++) {
    const daysSinceSteam = soakDays + day;
    const ts = new Date(startDate.getTime() + day * 86400000);

    // Thermal state
    const temp = sandFaceTemperature(thermalParams, daysSinceSteam);
    const visc = dynamicViscosity({
      api_gravity: well.api_gravity,
      temperature_c: temp,
    });
    const density = crudeDensity(well.api_gravity, temp);

    // ThermoTwin mode: apply pre-scheduled setpoints
    if (mode === "thermotwin" && preSchedule.length > 0) {
      const schedulePoint = getScheduleForDay(preSchedule, day);
      if (schedulePoint) {
        currentSpm = schedulePoint.spm;
        currentVfdUp = schedulePoint.vfd_upstroke_hz;
        currentVfdDown = schedulePoint.vfd_downstroke_hz;
      }
    }

    // Inflow
    const inflowParams: InflowParams = {
      ...DEFAULT_INFLOW_PARAMS,
      viscosity_cp: visc,
    };
    const fluidLevel = estimateFluidLevel(well.pump_depth_m, visc);
    const oilRate = oilInflowRate(inflowParams, 1500);

    // SRP dyno card
    const srpParams: SRPParams = {
      spm: currentSpm,
      stroke_length_m: currentStroke,
      rod_string: well.rod_string,
      pump_depth_m: well.pump_depth_m,
      pump_diameter_mm: 44,
      fluid_level_m: fluidLevel,
      fluid_density_kg_m3: density,
      viscosity_cp: visc,
      vfd_upstroke_hz: currentVfdUp,
      vfd_downstroke_hz: currentVfdDown,
    };

    const dyno = generateDynoCard(srpParams);
    const power = motorPower(dyno.peak_load_kn, currentStroke, currentSpm);
    const actualRate = Math.min(
      oilRate,
      pumpDisplacement(44, currentStroke, currentSpm) * (dyno.fillage_pct / 100) * 0.85
    );

    cumOil += actualRate;

    // Wellhead temperature (cooler than sandface)
    const wellheadTemp = temp * 0.6 + 15;

    // Telemetry row
    telemetry.push({
      id: genId("tel"),
      well_id: well.id,
      ts: ts.toISOString(),
      spm: currentSpm,
      stroke_len_m: currentStroke,
      vfd_hz: (currentVfdUp + currentVfdDown) / 2,
      motor_kw: power,
      wellhead_temp_c: Math.round(wellheadTemp * 10) / 10,
      sandface_temp_c: Math.round(temp * 10) / 10,
      viscosity_cp: Math.round(visc),
      fillage_pct: dyno.fillage_pct,
      oil_rate_bpd: Math.round(actualRate * 10) / 10,
      days_since_steam: daysSinceSteam,
      mode,
    });

    // Dyno card (every 3 days)
    if (day % 3 === 0) {
      dynoCards.push({
        id: genId("dyno"),
        well_id: well.id,
        ts: ts.toISOString(),
        position: dyno.surface_card.map((p) => p.position),
        load: dyno.surface_card.map((p) => p.load),
        downhole_load: dyno.downhole_card.map((p) => p.load),
        card_class: dyno.card_class,
      });
    }

    // Alerts
    if (dyno.rod_floating) {
      alerts.push({
        id: genId("alert"),
        well_id: well.id,
        ts: ts.toISOString(),
        type: "rod_floating",
        severity: "critical",
        message: `Rod floating detected. Viscosity: ${Math.round(visc)} cP, min load: ${dyno.min_load_kn.toFixed(1)} kN`,
        acknowledged: false,
      });
    }

    if (dyno.fillage_pct < 60) {
      alerts.push({
        id: genId("alert"),
        well_id: well.id,
        ts: ts.toISOString(),
        type: "low_fillage",
        severity: "warning",
        message: `Low fillage: ${dyno.fillage_pct.toFixed(0)}%. Consider reducing SPM.`,
        acknowledged: false,
      });
    }

    if (dyno.stress_ratio > 0.85) {
      alerts.push({
        id: genId("alert"),
        well_id: well.id,
        ts: ts.toISOString(),
        type: "high_load",
        severity: "warning",
        message: `High stress ratio: ${dyno.stress_ratio.toFixed(2)}. Fatigue risk elevated.`,
        acknowledged: false,
      });
    }

    if (visc > 3000 && day > 20) {
      alerts.push({
        id: genId("alert"),
        well_id: well.id,
        ts: ts.toISOString(),
        type: "high_viscosity",
        severity: "warning",
        message: `Viscosity rising: ${Math.round(visc)} cP at ${Math.round(temp)}°C`,
        acknowledged: false,
      });
    }

    // Baseline mode: rod failure around day 35-45
    if (mode === "baseline" && !hasRodFailure && day >= 35 && day <= 45) {
      if (dyno.rod_floating && dyno.stress_ratio > 0.75) {
        hasRodFailure = true;
        failures.push({
          id: genId("fail"),
          well_id: well.id,
          ts: ts.toISOString(),
          type: "rod_break",
          cycle_no: cycleNo,
          days_since_steam: daysSinceSteam,
        });
        alerts.push({
          id: genId("alert"),
          well_id: well.id,
          ts: ts.toISOString(),
          type: "rod_failure",
          severity: "critical",
          message: `ROD FAILURE at day ${day}. Impact loading from rod floating caused fatigue break.`,
          acknowledged: false,
        });
        break; // End production on rod failure
      }
    }

    // ThermoTwin mode: dynamic cut-off
    if (mode === "thermotwin" && day > 30) {
      if (shouldCutOff(actualRate, power)) {
        break;
      }
    }
  }

  const endDate = new Date(
    startDate.getTime() + telemetry.length * 86400000
  );

  const cycle: CSSCycle = {
    id: genId("cycle"),
    well_id: well.id,
    cycle_no: cycleNo,
    steam_volume_bbl: steamVolume,
    inj_pressure_kpa: injPressure,
    soak_days: soakDays,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    cum_oil_bbl: Math.round(cumOil),
    sor: Math.round((steamVolume / Math.max(cumOil, 1)) * 100) / 100,
  };

  return { telemetry, dynoCards, alerts, failures, cycle };
}

function getScheduleForDay(
  schedule: VFDSchedulePoint[],
  day: number
): VFDSchedulePoint | undefined {
  let best: VFDSchedulePoint | undefined;
  for (const point of schedule) {
    if (point.day <= day) {
      best = point;
    }
  }
  return best;
}

function estimateFluidLevel(pumpDepth_m: number, viscosity_cp: number): number {
  // Higher viscosity → less inflow → higher fluid level (less submergence)
  const base = pumpDepth_m * 0.4; // 40% submergence at low viscosity
  const viscPenalty = Math.min(viscosity_cp / 15000, 0.4) * pumpDepth_m;
  return Math.min(base + viscPenalty, pumpDepth_m * 0.95);
}

/**
 * Generate full demo data for all wells: multiple cycles, both modes.
 */
export function generateDemoData(): {
  wells: Well[];
  cycles: CSSCycle[];
  telemetry: TelemetryRow[];
  dynoCards: DynoCard[];
  alerts: Alert[];
  failures: Failure[];
} {
  const allCycles: CSSCycle[] = [];
  const allTelemetry: TelemetryRow[] = [];
  const allDynoCards: DynoCard[] = [];
  const allAlerts: Alert[] = [];
  const allFailures: Failure[] = [];

  for (const well of DEMO_WELLS) {
    // Generate 2 cycles: one baseline, one thermotwin
    const baseDate = new Date("2024-01-15");

    // Cycle 1: baseline
    const c1 = simulateCycle(well, 1, "baseline", 1500, 2000, 10, baseDate);
    allCycles.push(c1.cycle);
    allTelemetry.push(...c1.telemetry);
    allDynoCards.push(...c1.dynoCards);
    allAlerts.push(...c1.alerts);
    allFailures.push(...c1.failures);

    // Cycle 2: thermotwin (after cycle 1 ends)
    const c2Start = new Date(
      baseDate.getTime() + (c1.telemetry.length + 15) * 86400000
    );
    const c2 = simulateCycle(well, 2, "thermotwin", 1200, 2200, 12, c2Start);
    allCycles.push(c2.cycle);
    allTelemetry.push(...c2.telemetry);
    allDynoCards.push(...c2.dynoCards);
    allAlerts.push(...c2.alerts);
    allFailures.push(...c2.failures);
  }

  return {
    wells: DEMO_WELLS,
    cycles: allCycles,
    telemetry: allTelemetry,
    dynoCards: allDynoCards,
    alerts: allAlerts,
    failures: allFailures,
  };
}
