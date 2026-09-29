/**
 * srp.ts — Sucker Rod Pump dynamometer card generator + analysis
 *
 * Generates synthetic surface & downhole dyno cards (~100 points).
 * Card classes: full_pump, fluid_pound, gas_interference, pump_off, rod_floating, tagging.
 *
 * Rod floating check:
 *   - Minimum downstroke load < buoyant rod weight → floating
 *   - Rod fall velocity < downstroke velocity (viscosity dependent) → floating
 *
 * Goodman stress ratio for fatigue life estimation.
 */

import type { SRPParams, DynoPoint, DynoResult, DynoCardClass, RodSegment } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const G = 9.81; // m/s²
const POINTS_PER_CARD = 100;
const STEEL_DENSITY = 7850; // kg/m³
const ROD_ULTIMATE_STRENGTH_MPA = 690; // API Grade D rods
const ROD_ENDURANCE_LIMIT_MPA = 160; // Goodman endurance

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Total rod string weight in air (kN) */
function rodWeightInAir(rodString: RodSegment[]): number {
  let weight = 0;
  for (const seg of rodString) {
    weight += seg.weight_per_m_kg * seg.length_m * G;
  }
  return weight / 1000; // kN
}

/** Buoyant rod weight (kN) — reduced by fluid buoyancy */
function buoyantRodWeight(rodString: RodSegment[], fluidDensity: number): number {
  const airWeight = rodWeightInAir(rodString);
  const buoyancyFactor = 1 - fluidDensity / STEEL_DENSITY;
  return airWeight * buoyancyFactor;
}

/** Fluid load on plunger (kN) */
function fluidLoad(
  pumpDiameter_mm: number,
  fluidLevel_m: number,
  fluidDensity: number
): number {
  const D_m = pumpDiameter_mm / 1000;
  const area = (Math.PI / 4) * D_m * D_m;
  const pressure_pa = fluidDensity * G * fluidLevel_m;
  return (area * pressure_pa) / 1000; // kN
}

/** Rod fall velocity considering viscous drag (m/s) */
function rodFallVelocity(rodString: RodSegment[], viscosity_cp: number, fluidDensity: number): number {
  // Simplified: terminal velocity of rod string through viscous fluid
  // v_fall = (W_buoyant) / (drag_coefficient × viscosity × length)
  const W_buoyant = buoyantRodWeight(rodString, fluidDensity) * 1000; // N

  // Average rod diameter
  let totalLen = 0;
  let weightedDiam = 0;
  for (const seg of rodString) {
    totalLen += seg.length_m;
    weightedDiam += seg.diameter_mm * seg.length_m;
  }
  const avgDiam_m = (weightedDiam / totalLen) / 1000;

  // Viscous drag force per unit velocity: F_drag/v = C × μ × L / (annular_gap)
  const viscosity_pa_s = viscosity_cp / 1000;
  const tubing_id_m = 0.062; // 2-7/8" tubing ID
  const annular_gap = (tubing_id_m - avgDiam_m) / 2;

  if (annular_gap <= 0) return 0;

  const drag_coeff = (2 * Math.PI * viscosity_pa_s * totalLen) / Math.log(tubing_id_m / avgDiam_m);

  if (drag_coeff <= 0) return 0.5; // fallback

  const v_fall = W_buoyant / drag_coeff;
  return Math.min(v_fall, 2.0); // cap at 2 m/s
}

/** Downstroke velocity of polish rod (m/s) */
function downstrokeVelocity(spm: number, strokeLength_m: number, vfdDownstrokeHz: number): number {
  const baseHz = 50;
  const speedFactor = vfdDownstrokeHz / baseHz;
  // Average velocity during downstroke (sinusoidal approximation)
  // v_avg = 2 × S × N / 60
  const rpm = spm * speedFactor;
  return (2 * strokeLength_m * rpm) / 60;
}

// ─── Card Generation ─────────────────────────────────────────────────────────

/**
 * Generate a synthetic dynamometer card.
 */
export function generateDynoCard(params: SRPParams): DynoResult {
  const {
    spm,
    stroke_length_m,
    rod_string,
    pump_depth_m,
    pump_diameter_mm,
    fluid_level_m,
    fluid_density_kg_m3,
    viscosity_cp,
    vfd_upstroke_hz,
    vfd_downstroke_hz,
  } = params;

  const W_rod = buoyantRodWeight(rod_string, fluid_density_kg_m3);
  const W_fluid = fluidLoad(pump_diameter_mm, fluid_level_m, fluid_density_kg_m3);

  // Dynamic loads (acceleration effects)
  const speedFactor = (vfd_upstroke_hz + vfd_downstroke_hz) / 100;
  const dynamicFactor = 0.3 * speedFactor * spm * stroke_length_m;

  // Viscous friction load (kN) — increases with viscosity
  const frictionLoad = Math.min(viscosity_cp / 5000, 2.0); // 0 to 2 kN

  // Check rod floating
  const v_fall = rodFallVelocity(rod_string, viscosity_cp, fluid_density_kg_m3);
  const v_down = downstrokeVelocity(spm, stroke_length_m, vfd_downstroke_hz);
  const isFloating = v_fall < v_down * 0.9;

  // Determine fillage
  let fillage = computeFillage(fluid_level_m, pump_depth_m, viscosity_cp, spm);

  // Determine card class
  const cardClass = classifyCard(fillage, isFloating, viscosity_cp, fluid_level_m, pump_depth_m);

  // Adjust fillage based on class
  if (cardClass === "pump_off") fillage = Math.min(fillage, 50);
  if (cardClass === "fluid_pound") fillage = Math.min(fillage, 65);

  // Peak and min loads
  const peakLoad = W_rod + W_fluid + dynamicFactor + frictionLoad;
  const minLoad = Math.max(W_rod - dynamicFactor - frictionLoad * 0.5, isFloating ? -0.5 : 0.2);

  // Generate card points
  const surfaceCard = generateSurfaceCardPoints(
    stroke_length_m,
    peakLoad,
    minLoad,
    W_rod,
    W_fluid,
    fillage,
    cardClass,
    frictionLoad
  );

  const downholeCard = generateDownholeCardPoints(
    stroke_length_m,
    W_fluid,
    fillage,
    cardClass
  );

  // Goodman stress ratio
  const stressRatio = computeGoodmanRatio(peakLoad, minLoad, rod_string);

  // Net stroke (effective plunger travel)
  const netStroke = stroke_length_m * (fillage / 100);

  return {
    surface_card: surfaceCard,
    downhole_card: downholeCard,
    card_class: cardClass,
    fillage_pct: Math.round(fillage * 10) / 10,
    peak_load_kn: Math.round(peakLoad * 100) / 100,
    min_load_kn: Math.round(minLoad * 100) / 100,
    stress_ratio: Math.round(stressRatio * 1000) / 1000,
    rod_floating: isFloating,
    net_stroke_m: Math.round(netStroke * 1000) / 1000,
  };
}

function computeFillage(
  fluidLevel_m: number,
  pumpDepth_m: number,
  viscosity_cp: number,
  spm: number
): number {
  // Fillage depends on how fast fluid can flow into pump
  // Higher viscosity → slower fill → lower fillage at same SPM
  const submergence = pumpDepth_m - fluidLevel_m;
  const submergenceRatio = Math.max(submergence / pumpDepth_m, 0);

  // Viscosity penalty: high viscosity reduces fillage
  const viscPenalty = Math.min(viscosity_cp / 20000, 0.4); // up to 40% penalty

  // SPM penalty: higher SPM → less time to fill
  const spmPenalty = Math.max((spm - 4) * 0.03, 0); // penalty above 4 SPM

  const fillage = (submergenceRatio * 100) * (1 - viscPenalty) * (1 - spmPenalty);
  return Math.max(Math.min(fillage, 100), 10);
}

function classifyCard(
  fillage: number,
  isFloating: boolean,
  viscosity_cp: number,
  fluidLevel_m: number,
  pumpDepth_m: number
): DynoCardClass {
  // Priority order for classification
  if (isFloating) return "rod_floating";

  // Tagging: pump hits bottom (fluid level very close to pump)
  if (fluidLevel_m >= pumpDepth_m * 0.95) return "tagging";

  // Pump off: very low fillage
  if (fillage < 40) return "pump_off";

  // Fluid pound: moderate fillage
  if (fillage < 70) return "fluid_pound";

  // Gas interference: high viscosity can trap gas
  if (viscosity_cp > 5000 && fillage < 80) return "gas_interference";

  return "full_pump";
}

function generateSurfaceCardPoints(
  strokeLength: number,
  peakLoad: number,
  minLoad: number,
  rodWeight: number,
  fluidLoad: number,
  fillage: number,
  cardClass: DynoCardClass,
  friction: number
): DynoPoint[] {
  const points: DynoPoint[] = [];
  const n = POINTS_PER_CARD;

  for (let i = 0; i < n; i++) {
    const t = i / n; // 0 to 1
    const angle = t * 2 * Math.PI;

    // Position: sinusoidal (0 to stroke_length)
    const position = (strokeLength / 2) * (1 - Math.cos(angle));

    let load: number;

    if (t < 0.5) {
      // Upstroke
      const upT = t * 2; // 0 to 1 within upstroke

      switch (cardClass) {
        case "full_pump": {
          // Classic parallelogram: load rises sharply, stays flat, then drops
          if (upT < 0.1) {
            load = minLoad + (peakLoad - minLoad) * (upT / 0.1);
          } else if (upT < 0.9) {
            load = peakLoad - friction * Math.sin(upT * Math.PI);
          } else {
            load = peakLoad - (peakLoad - rodWeight) * ((upT - 0.9) / 0.1);
          }
          break;
        }
        case "fluid_pound": {
          if (upT < 0.1) {
            load = minLoad + (peakLoad - minLoad) * (upT / 0.1);
          } else if (upT < fillage / 100) {
            load = peakLoad - friction * 0.5 * Math.sin(upT * Math.PI);
          } else {
            // Sharp drop — fluid pound
            const dropT = (upT - fillage / 100) / (1 - fillage / 100);
            load = peakLoad - (peakLoad - rodWeight) * dropT * dropT;
          }
          break;
        }
        case "pump_off": {
          if (upT < 0.1) {
            load = minLoad + (peakLoad * 0.7 - minLoad) * (upT / 0.1);
          } else {
            // Early peak then drops
            load = peakLoad * 0.7 * (1 - 0.5 * upT);
          }
          break;
        }
        case "gas_interference": {
          if (upT < 0.15) {
            load = minLoad + (peakLoad - minLoad) * (upT / 0.15);
          } else {
            // Wavy load — gas compressing
            load = peakLoad - 0.3 * peakLoad * Math.sin(3 * upT * Math.PI);
          }
          break;
        }
        case "rod_floating": {
          if (upT < 0.1) {
            load = minLoad + (peakLoad - minLoad) * (upT / 0.1);
          } else {
            load = peakLoad + 0.1 * peakLoad * Math.sin(2 * upT * Math.PI);
          }
          break;
        }
        case "tagging": {
          if (upT < 0.1) {
            load = minLoad + (peakLoad - minLoad) * (upT / 0.1);
          } else if (upT < 0.85) {
            load = peakLoad;
          } else {
            // Impact spike at end of upstroke
            load = peakLoad * 1.3;
          }
          break;
        }
        default:
          load = rodWeight + fluidLoad;
      }
    } else {
      // Downstroke
      const downT = (t - 0.5) * 2; // 0 to 1 within downstroke

      switch (cardClass) {
        case "full_pump": {
          if (downT < 0.1) {
            load = rodWeight + (minLoad - rodWeight) * (downT / 0.1) + friction * 0.5;
          } else if (downT < 0.9) {
            load = minLoad + friction * Math.sin(downT * Math.PI) * 0.5;
          } else {
            load = minLoad + (rodWeight - minLoad) * ((downT - 0.9) / 0.1) * 0.5;
          }
          break;
        }
        case "rod_floating": {
          // Very low or negative loads — rod can't follow
          if (downT < 0.1) {
            load = rodWeight * 0.8;
          } else if (downT < 0.5) {
            load = minLoad * 0.5 + 0.2 * Math.sin(downT * 4 * Math.PI);
          } else {
            // Impact loading when rod catches up
            const impactT = (downT - 0.5) / 0.5;
            load = minLoad * 0.3 + peakLoad * 0.4 * impactT * impactT;
          }
          break;
        }
        default: {
          if (downT < 0.1) {
            load = rodWeight * 0.9;
          } else if (downT < 0.9) {
            load = minLoad + friction * 0.3 * Math.sin(downT * Math.PI);
          } else {
            load = minLoad + (peakLoad - minLoad) * 0.1;
          }
        }
      }
    }

    points.push({
      position: Math.round(position * 10000) / 10000,
      load: Math.round(load * 100) / 100,
    });
  }

  return points;
}

function generateDownholeCardPoints(
  strokeLength: number,
  fluidLoadVal: number,
  fillage: number,
  cardClass: DynoCardClass
): DynoPoint[] {
  const points: DynoPoint[] = [];
  const n = POINTS_PER_CARD;

  for (let i = 0; i < n; i++) {
    const t = i / n;
    const angle = t * 2 * Math.PI;
    const position = (strokeLength / 2) * (1 - Math.cos(angle));

    let load: number;

    if (t < 0.5) {
      // Upstroke — TV open, SV closed
      const fillPoint = fillage / 100;
      const upT = t * 2;

      if (upT < fillPoint) {
        load = fluidLoadVal;
      } else {
        // Beyond fill point — pump off or fluid pound
        if (cardClass === "fluid_pound") {
          load = fluidLoadVal * (1 - (upT - fillPoint) / (1 - fillPoint));
        } else {
          load = fluidLoadVal * 0.3;
        }
      }
    } else {
      // Downstroke — TV closed, SV open
      load = 0;
    }

    points.push({
      position: Math.round(position * 10000) / 10000,
      load: Math.round(load * 100) / 100,
    });
  }

  return points;
}

/**
 * Goodman stress ratio: ratio of actual alternating stress to allowable.
 * Values > 1.0 indicate high fatigue risk.
 */
function computeGoodmanRatio(
  peakLoad_kn: number,
  minLoad_kn: number,
  rodString: RodSegment[]
): number {
  // Use smallest rod diameter (weakest point)
  let minArea = Infinity;
  for (const seg of rodString) {
    const d_m = seg.diameter_mm / 1000;
    const area = (Math.PI / 4) * d_m * d_m;
    if (area < minArea) minArea = area;
  }

  if (minArea === Infinity || minArea <= 0) return 0;

  const peakStress = (peakLoad_kn * 1000) / minArea / 1e6; // MPa
  const minStress = (minLoad_kn * 1000) / minArea / 1e6; // MPa

  const meanStress = (peakStress + minStress) / 2;
  const altStress = (peakStress - minStress) / 2;

  // Goodman: σ_a / S_e + σ_m / S_u = 1 at failure
  // Stress ratio = σ_a / (S_e × (1 - σ_m / S_u))
  const allowableAlt = ROD_ENDURANCE_LIMIT_MPA * (1 - meanStress / ROD_ULTIMATE_STRENGTH_MPA);

  if (allowableAlt <= 0) return 2.0; // over-stressed

  return altStress / allowableAlt;
}

/**
 * Compute motor power (kW) for SRP operation.
 */
export function motorPower(
  peakLoad_kn: number,
  strokeLength_m: number,
  spm: number,
  efficiency: number = 0.85
): number {
  // P = F × v / η
  // Average velocity: v = 2 × S × N / 60
  const avgVelocity = (2 * strokeLength_m * spm) / 60;
  const avgLoad = peakLoad_kn * 0.7; // avg ≈ 70% of peak
  const power_kw = (avgLoad * 1000 * avgVelocity) / (1000 * efficiency);
  return Math.round(power_kw * 100) / 100;
}

/**
 * Default rod string for a Baghewala well (~400m pump depth).
 */
export const DEFAULT_ROD_STRING: RodSegment[] = [
  { length_m: 200, diameter_mm: 22, material: "Grade D", weight_per_m_kg: 2.9 },
  { length_m: 150, diameter_mm: 19, material: "Grade D", weight_per_m_kg: 2.2 },
  { length_m: 50, diameter_mm: 16, material: "Grade D", weight_per_m_kg: 1.6 },
];
