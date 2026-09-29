"use client";

import { useMemo } from "react";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Shield,
  Droplets,
  Flame,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparisonChart } from "@/components/dashboard/Charts";
import { DEMO_WELLS, simulateCycle } from "@/lib/sim/generator";

interface MetricComparison {
  label: string;
  baseline: number;
  optimized: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  betterWhen: "higher" | "lower";
}

function MetricCard({ metric }: { metric: MetricComparison }) {
  const { label, baseline, optimized, unit, icon: Icon, betterWhen } = metric;

  const pctChange =
    baseline !== 0
      ? Math.round(((optimized - baseline) / Math.abs(baseline)) * 100)
      : 0;

  const isImproved =
    betterWhen === "higher" ? optimized > baseline : optimized < baseline;

  return (
    <Card className="clean-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-red-400 font-semibold mb-0.5">
              BASELINE
            </p>
            <p className="text-xl font-bold">
              {baseline}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {unit}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-semibold mb-0.5">
              THERMOTWIN
            </p>
            <p className="text-xl font-bold">
              {optimized}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {unit}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/20">
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isImproved ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isImproved ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(pctChange)}%{" "}
            {isImproved ? "improvement" : "degradation"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComparePage() {
  // Simulate same well in both modes
  const well = DEMO_WELLS[0];

  const baselineData = useMemo(
    () => simulateCycle(well, 1, "baseline", 1500, 2000, 10),
    [well]
  );

  const optimizedData = useMemo(
    () => simulateCycle(well, 2, "thermotwin", 1200, 2200, 12),
    [well]
  );

  // Metrics
  const metrics: MetricComparison[] = [
    {
      label: "Cumulative Oil",
      baseline: baselineData.cycle.cum_oil_bbl,
      optimized: optimizedData.cycle.cum_oil_bbl,
      unit: "bbl",
      icon: Droplets,
      betterWhen: "higher",
    },
    {
      label: "Steam-Oil Ratio",
      baseline: baselineData.cycle.sor,
      optimized: optimizedData.cycle.sor,
      unit: "",
      icon: Flame,
      betterWhen: "lower",
    },
    {
      label: "Rod Failures",
      baseline: baselineData.failures.length,
      optimized: optimizedData.failures.length,
      unit: "",
      icon: AlertTriangle,
      betterWhen: "lower",
    },
    {
      label: "Critical Alerts",
      baseline: baselineData.alerts.filter((a) => a.severity === "critical").length,
      optimized: optimizedData.alerts.filter((a) => a.severity === "critical").length,
      unit: "",
      icon: Shield,
      betterWhen: "lower",
    },
    {
      label: "Production Days",
      baseline: baselineData.telemetry.length,
      optimized: optimizedData.telemetry.length,
      unit: "days",
      icon: TrendingUp,
      betterWhen: "higher",
    },
    {
      label: "Steam Used",
      baseline: baselineData.cycle.steam_volume_bbl,
      optimized: optimizedData.cycle.steam_volume_bbl,
      unit: "bbl",
      icon: Zap,
      betterWhen: "lower",
    },
  ];

  // Chart data
  const baselineRates = baselineData.telemetry
    .filter((_, i) => i % 5 === 0)
    .map((t) => Math.round(t.oil_rate_bpd));
  const optimizedRates = optimizedData.telemetry
    .filter((_, i) => i % 5 === 0)
    .map((t) => Math.round(t.oil_rate_bpd));

  const maxLen = Math.max(baselineRates.length, optimizedRates.length);
  const dayLabels = Array.from({ length: maxLen }, (_, i) => `D${(i + 1) * 5}`);

  // Pad shorter array
  while (baselineRates.length < maxLen) baselineRates.push(0);
  while (optimizedRates.length < maxLen) optimizedRates.push(0);

  // Peak load comparison
  const baselinePeakLoads = baselineData.dynoCards
    .slice(0, 10)
    .map((d) => Math.round(Math.max(...d.load) * 10) / 10);
  const optimizedPeakLoads = optimizedData.dynoCards
    .slice(0, 10)
    .map((d) => Math.round(Math.max(...d.load) * 10) / 10);
  const dynoLabels = baselinePeakLoads.map((_, i) => `Card ${i + 1}`);

  while (optimizedPeakLoads.length < dynoLabels.length) optimizedPeakLoads.push(0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            Baseline vs ThermoTwin — {well.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Side-by-side comparison of manual reactive operations vs
            AI-optimized pre-scheduled control
          </p>
        </div>
        <Badge className="synthetic-badge">Synthetic</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-400" />
              Oil Production Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ComparisonChart
              baseline={baselineRates}
              optimized={optimizedRates}
              labels={dayLabels}
              title=""
            />
          </CardContent>
        </Card>

        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              Peak Rod Load Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ComparisonChart
              baseline={baselinePeakLoads}
              optimized={optimizedPeakLoads}
              labels={dynoLabels}
              title=""
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="clean-card rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
            Viscora AI Impact Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1 font-medium">
                Production Optimization
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Pre-scheduled SPM and asymmetric VFD profile extends productive
                cycle life. ThermoTwin produces for{" "}
                <span className="text-emerald-400 font-semibold">
                  {optimizedData.telemetry.length} days
                </span>{" "}
                vs baseline&apos;s {baselineData.telemetry.length} days (cut short by
                rod failure).
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">
                Failure Prevention
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Slower downstroke VFD eliminates rod floating. Rod fall velocity
                is kept above downstroke velocity at all viscosity levels,
                preventing{" "}
                <span className="text-red-400 font-semibold">
                  impact loading
                </span>{" "}
                and fatigue breaks.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">
                Steam Efficiency
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Dynamic economic cut-off ends production when marginal revenue
                drops below costs. Combined with optimized steam volume,
                ThermoTwin achieves SOR of{" "}
                <span className="text-amber-400 font-semibold">
                  {optimizedData.cycle.sor}
                </span>{" "}
                vs baseline&apos;s {baselineData.cycle.sor}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
