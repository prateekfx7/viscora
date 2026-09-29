import { NextResponse } from "next/server";
import { optimizeCSS } from "@/lib/physics/optimizer";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      api_gravity?: number;
      num_samples?: number;
    };

    const { api_gravity = 18, num_samples = 300 } = body;

    const paretoFront = optimizeCSS(api_gravity, num_samples);

    return NextResponse.json({
      pareto_front: paretoFront,
      count: paretoFront.length,
      note: "Multi-objective optimization: maximize cumulative oil, minimize SOR and energy cost",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "CSS optimization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
