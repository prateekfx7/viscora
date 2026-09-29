"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import {
  Thermometer,
  Droplets,
  Gauge,
  Activity,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TempViscChart, OilRateChart, DynoCardChart, PowerFillageChart } from "@/components/dashboard/Charts";
import { DEMO_WELLS, simulateCycle } from "@/lib/sim/generator";
import type { WellMode } from "@/types";

// Dynamically import 3D component with SSR disabled
const WellTwin3D = dynamic(() => import("@/components/twin/WellTwin3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a12] rounded-xl">
      <div className="text-amber-500 text-sm animate-pulse">Loading 3D Model...</div>
    </div>
  ),
});

// ─── Mini KPI ────────────────────────────────────────────────────────────────

function MiniKPI({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-sm font-bold">
          {value}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Well Twin Page ──────────────────────────────────────────────────────────

export default function WellTwinPage() {
  const params = useParams();
  const wellId = params.id as string;
  const [mode, setMode] = useState<WellMode>("thermotwin");

  // Find well
  const well = useMemo(
    () => DEMO_WELLS.find((w) => w.id === wellId) || DEMO_WELLS[0],
    [wellId]
  );

  // Simulate cycle data
  const simData = useMemo(
    () =>
      simulateCycle(
        well,
        mode === "baseline" ? 1 : 2,
        mode,
        mode === "baseline" ? 1500 : 1200,
        mode === "baseline" ? 2000 : 2200,
        mode === "baseline" ? 10 : 12
      ),
    [well, mode]
  );

  // Latest telemetry for 3D visualization
  const latestTelemetry =
    simData.telemetry[Math.floor(simData.telemetry.length * 0.4)] ||
    simData.telemetry[0];

  // Latest dyno card
  const latestDyno = simData.dynoCards[simData.dynoCards.length - 1];

  // Sample telemetry for charts (every 2nd point for readability)
  const chartData = simData.telemetry.filter((_, i) => i % 2 === 0);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl clean-card">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            {well.name} — Downhole to Surface Twin
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Baghewala Formation • {well.api_gravity}° API • {well.depth_m}m depth • Pump at {well.pump_depth_m}m
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="synthetic-badge">Synthetic RTU</Badge>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as WellMode)}
          >
            <TabsList className="bg-muted/60 h-8 p-0.5 rounded-lg border border-border/60">
              <TabsTrigger value="baseline" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Conventional Baseline
              </TabsTrigger>
              <TabsTrigger value="thermotwin" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs font-semibold">
                Viscora Twin
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Hero Grid: 3D + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Well Model */}
        <div className="lg:col-span-2 h-[400px] lg:h-[450px] rounded-2xl overflow-hidden clean-card border border-border/80 relative">
          <WellTwin3D
            temperature={latestTelemetry?.sandface_temp_c ?? 120}
            viscosity={latestTelemetry?.viscosity_cp ?? 200}
            spm={latestTelemetry?.spm ?? 5}
            fluidLevel={0.6}
          />
        </div>

        {/* Live KPIs */}
        <div className="space-y-3">
          <Card className="clean-card rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MiniKPI
                icon={Thermometer}
                label="Sandface Temp"
                value={latestTelemetry?.sandface_temp_c ?? 0}
                unit="°C"
                color="text-amber-400"
              />
              <MiniKPI
                icon={Droplets}
                label="Viscosity"
                value={latestTelemetry?.viscosity_cp ?? 0}
                unit="cP"
                color="text-cyan-400"
              />
              <MiniKPI
                icon={Activity}
                label="Oil Rate"
                value={latestTelemetry?.oil_rate_bpd ?? 0}
                unit="bpd"
                color="text-emerald-400"
              />
              <MiniKPI
                icon={Gauge}
                label="SPM"
                value={latestTelemetry?.spm ?? 0}
                unit="spm"
                color="text-purple-400"
              />
              <MiniKPI
                icon={Zap}
                label="Motor Power"
                value={latestTelemetry?.motor_kw ?? 0}
                unit="kW"
                color="text-yellow-400"
              />
              <MiniKPI
                icon={Activity}
                label="Fillage"
                value={latestTelemetry?.fillage_pct ?? 0}
                unit="%"
                color="text-pink-400"
              />
            </CardContent>
          </Card>

          {/* Alerts Summary */}
          <Card className="clean-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold">Alerts</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] border-red-500/30 text-red-400"
                >
                  {simData.alerts.length}
                </Badge>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-auto">
                {simData.alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="text-[10px] text-muted-foreground flex items-start gap-1.5"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="line-clamp-2">{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cycle Info */}
          <Card className="clean-card rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold mb-2">Cycle Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Cum Oil:</span>{" "}
                  <span className="font-semibold">
                    {simData.cycle.cum_oil_bbl} bbl
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">SOR:</span>{" "}
                  <span className="font-semibold">{simData.cycle.sor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Steam:</span>{" "}
                  <span className="font-semibold">
                    {simData.cycle.steam_volume_bbl} bbl
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Failures:</span>{" "}
                  <span
                    className={`font-semibold ${
                      simData.failures.length > 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {simData.failures.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Temperature & Viscosity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <TempViscChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Oil Production Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <OilRateChart data={chartData} />
          </CardContent>
        </Card>

        {latestDyno && (
          <Card className="clean-card rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Dynamometer Card
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    latestDyno.card_class === "full_pump"
                      ? "text-emerald-400 border-emerald-500/30"
                      : latestDyno.card_class === "rod_floating"
                        ? "text-red-400 border-red-500/30"
                        : "text-amber-400 border-amber-500/30"
                  }`}
                >
                  {latestDyno.card_class.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-64">
              <DynoCardChart card={latestDyno} />
            </CardContent>
          </Card>
        )}

        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Motor Power & Fillage
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <PowerFillageChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
