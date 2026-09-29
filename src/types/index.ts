// ─── Well ────────────────────────────────────────────────────────────────────
export interface RodSegment {
  length_m: number;
  diameter_mm: number;
  material: string;
  weight_per_m_kg: number;
}

export interface Well {
  id: string;
  name: string;
  api_gravity: number;
  depth_m: number;
  pump_depth_m: number;
  rod_string: RodSegment[];
  lat: number;
  lng: number;
  status: "producing" | "injecting" | "soaking" | "shut-in" | "workover";
}

// ─── CSS Cycle ───────────────────────────────────────────────────────────────
export interface CSSCycle {
  id: string;
  well_id: string;
  cycle_no: number;
  steam_volume_bbl: number;
  inj_pressure_kpa: number;
  soak_days: number;
  start_date: string; // ISO date
  end_date: string | null;
  cum_oil_bbl: number;
  sor: number;
}

// ─── Telemetry ───────────────────────────────────────────────────────────────
export type WellMode = "baseline" | "thermotwin";

export interface TelemetryRow {
  id: string;
  well_id: string;
  ts: string; // ISO timestamp
  spm: number;
  stroke_len_m: number;
  vfd_hz: number;
  motor_kw: number;
  wellhead_temp_c: number;
  sandface_temp_c: number;
  viscosity_cp: number;
  fillage_pct: number;
  oil_rate_bpd: number;
  days_since_steam: number;
  mode: WellMode;
}

// ─── Dyno Card ───────────────────────────────────────────────────────────────
export type DynoCardClass =
  | "full_pump"
  | "fluid_pound"
  | "gas_interference"
  | "pump_off"
  | "rod_floating"
  | "tagging";

export interface DynoCard {
  id: string;
  well_id: string;
  ts: string;
  position: number[];
  load: number[];
  downhole_load: number[];
  card_class: DynoCardClass;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType =
  | "rod_floating"
  | "pump_off"
  | "high_viscosity"
  | "low_fillage"
  | "rod_failure"
  | "high_load"
  | "tagging"
  | "temperature_drop";

export interface Alert {
  id: string;
  well_id: string;
  ts: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
}

// ─── Failures ────────────────────────────────────────────────────────────────
export type FailureType = "rod_break" | "pump_failure" | "tubing_leak";

export interface Failure {
  id: string;
  well_id: string;
  ts: string;
  type: FailureType;
  cycle_no: number;
  days_since_steam: number;
}

// ─── Recommendations ────────────────────────────────────────────────────────
export type RecommendationKind =
  | "spm_change"
  | "vfd_profile"
  | "cycle_cutoff"
  | "steam_volume";

export type RecommendationStatus = "pending" | "approved" | "rejected";

export interface Recommendation {
  id: string;
  well_id: string;
  ts: string;
  kind: RecommendationKind;
  payload: Record<string, unknown>;
  status: RecommendationStatus;
}

// ─── Profiles ────────────────────────────────────────────────────────────────
export type UserRole = "engineer" | "viewer" | "admin";

export interface Profile {
  id: string; // references auth.users
  role: UserRole;
}

// ─── Physics Parameters ─────────────────────────────────────────────────────
export interface ViscosityParams {
  api_gravity: number;
  temperature_c: number;
  asphaltene_factor?: number; // multiplier, default 1.0
}

export interface ThermalParams {
  steam_volume_bbl: number;
  inj_pressure_kpa: number;
  soak_days: number;
  reservoir_temp_c: number; // ambient ~47 °C
  formation_thickness_m: number;
  thermal_diffusivity_m2_per_day: number;
}

export interface InflowParams {
  reservoir_pressure_kpa: number;
  bubble_point_kpa: number;
  productivity_index: number; // bpd/kPa
  viscosity_cp: number;
  reference_viscosity_cp: number; // at which PI was measured
}

export interface SRPParams {
  spm: number;
  stroke_length_m: number;
  rod_string: RodSegment[];
  pump_depth_m: number;
  pump_diameter_mm: number;
  fluid_level_m: number;
  fluid_density_kg_m3: number;
  viscosity_cp: number;
  vfd_upstroke_hz: number;
  vfd_downstroke_hz: number;
}

export interface DynoPoint {
  position: number;
  load: number;
}

export interface DynoResult {
  surface_card: DynoPoint[];
  downhole_card: DynoPoint[];
  card_class: DynoCardClass;
  fillage_pct: number;
  peak_load_kn: number;
  min_load_kn: number;
  stress_ratio: number; // Goodman
  rod_floating: boolean;
  net_stroke_m: number;
}

// ─── Optimizer ───────────────────────────────────────────────────────────────
export interface SRPOptimizationResult {
  spm: number;
  stroke_length_m: number;
  vfd_upstroke_hz: number;
  vfd_downstroke_hz: number;
  predicted_rate_bpd: number;
  kwh_per_bbl: number;
  fillage_pct: number;
  stress_ratio: number;
  rod_floating: boolean;
}

export interface CSSOptimizationPoint {
  steam_volume_bbl: number;
  inj_pressure_kpa: number;
  soak_days: number;
  production_cutoff_bpd: number;
  cum_oil_bbl: number;
  sor: number;
  energy_cost_usd: number;
  cycle_duration_days: number;
}

export interface VFDSchedulePoint {
  day: number;
  spm: number;
  vfd_upstroke_hz: number;
  vfd_downstroke_hz: number;
}

export interface PreSchedule {
  well_id: string;
  cycle_no: number;
  schedule: VFDSchedulePoint[];
}
