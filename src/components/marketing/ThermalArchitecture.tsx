"use client";

import { useState } from "react";
import {
  Flame,
  Droplets,
  Activity,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Cpu,
  Layers,
  Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stages = [
  {
    step: "01",
    title: "Reservoir Steam Falloff Modeling",
    subtitle: "Thermal Decay Physics",
    icon: Flame,
    color: "text-amber-600 bg-amber-500/10",
    description:
      "Viscora tracks heat dissipation from the 180°C steam soak front into the 47°C cold reservoir matrix using transient radial thermal conduction and Walther ASTM D341 correlations.",
    formula: "log₁₀(log₁₀(ν + 0.7)) = A - B · log₁₀(T_K)",
    metric: "180°C → 47°C",
    metricLabel: "Near-Wellbore Temperature Decay",
  },
  {
    step: "02",
    title: "Downhole Viscosity & Inflow Dynamic Coupling",
    subtitle: "Fluid Rheology Engine",
    icon: Droplets,
    color: "text-blue-600 bg-blue-500/10",
    description:
      "As the well cools, Baghewala 17–19° API crude thickens exponentially from 25 cP to over 10,000 cP. Viscora couples dynamic viscosity into the reservoir Inflow Performance Relationship (IPR).",
    formula: "μ_dynamic = ν(T) · ρ_crude · f_asphaltene",
    metric: "25 cP → 12,000 cP",
    metricLabel: "Viscosity Surge Window",
  },
  {
    step: "03",
    title: "Gibbs Wave Dyno-Card Diagnosis",
    subtitle: "Mechanical Stress Analysis",
    icon: Activity,
    color: "text-purple-600 bg-purple-500/10",
    description:
      "Downhole pump cards are synthesized using the 1D damped wave equation (Gibbs equation). Viscora classifies liquid fillage, fluid pound, and rod compression loads in real-time.",
    formula: "∂²u/∂t² = a²(∂²u/∂x²) - c(∂u/∂t)",
    metric: "94.2% Fillage",
    metricLabel: "Surface-to-Pump Decomposition",
  },
  {
    step: "04",
    title: "Autonomous VFD Asymmetric Control",
    subtitle: "Closed-Loop Pump Protection",
    icon: Sliders,
    color: "text-emerald-600 bg-emerald-500/10",
    description:
      "When viscosity exceeds safety limits, Viscora commands the surface VFD to slow the downstroke (preventing rod floating) while optimizing upstroke speed to maintain maximum barrels per day.",
    formula: "v_downstroke ≤ v_terminal_float(μ, d_rod)",
    metric: "Zero Rod Float",
    metricLabel: "Asymmetric Stroke Governor",
  },
];

export function ThermalArchitecture() {
  const [activeStage, setActiveStage] = useState(0);
  const current = stages[activeStage];

  return (
    <div className="w-full space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
          — HOW VISCORA WORKS —
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          One Shared Thermal State. From Reservoir To Pumping Unit.
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Traditional operations treat steam injection and artificial lift as disconnected silos.
          Viscora AI couples them together through a continuous 4-stage physics pipeline.
        </p>
      </div>

      {/* 4-Stage Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stage, idx) => {
          const isActive = idx === activeStage;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStage(idx)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative ${
                isActive
                  ? "bg-card border-blue-600 shadow-md ring-1 ring-blue-600/30"
                  : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {stage.step}
                </span>
                <stage.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-muted-foreground"}`} />
              </div>
              <div className={`text-xs font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {stage.title}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {stage.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Showcase Card */}
      <div className="clean-card rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${current.color}`}>
                <current.icon className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-mono text-muted-foreground">Stage {current.step}</span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{current.title}</h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 font-mono text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Governing Equation:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{current.formula}</span>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-center text-center space-y-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {current.metricLabel}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {current.metric}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Calibrated with Baghewala formation parameters (1,050m depth, 17.5° API, 47°C initial temp).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
