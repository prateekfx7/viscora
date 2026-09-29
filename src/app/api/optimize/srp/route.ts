import { NextResponse } from "next/server";
import { optimizeSRP } from "@/lib/physics/optimizer";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      viscosity_cp?: number;
      api_gravity?: number;
      pump_depth_m?: number;
    };

    const {
      viscosity_cp = 500,
      api_gravity = 18,
      pump_depth_m = 400,
    } = body;

    const result = optimizeSRP(viscosity_cp, api_gravity, pump_depth_m);

    return NextResponse.json({
      optimization: result,
      note: "Asymmetric VFD profile: slower downstroke prevents rod floating, faster upstroke maximizes displacement",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SRP optimization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
