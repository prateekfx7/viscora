import { NextResponse } from "next/server";
import { simulateCycle, DEMO_WELLS } from "@/lib/sim/generator";
import type { WellMode } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      well_id?: string;
      mode?: WellMode;
      steam_volume?: number;
      inj_pressure?: number;
      soak_days?: number;
    };

    const {
      well_id = "well-001",
      mode = "thermotwin",
      steam_volume = 1500,
      inj_pressure = 2000,
      soak_days = 10,
    } = body;

    const well = DEMO_WELLS.find((w) => w.id === well_id) || DEMO_WELLS[0];

    const result = simulateCycle(
      well,
      1,
      mode,
      steam_volume,
      inj_pressure,
      soak_days
    );

    return NextResponse.json({
      cycle: result.cycle,
      telemetry_count: result.telemetry.length,
      dyno_cards_count: result.dynoCards.length,
      alerts_count: result.alerts.length,
      failures_count: result.failures.length,
      telemetry: result.telemetry.slice(0, 10), // sample
      note: "Synthetic data — real SCADA/RTU data would be ingested via telemetry API",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Simulation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
