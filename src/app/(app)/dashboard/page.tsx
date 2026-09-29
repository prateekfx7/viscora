"use client";

import Link from "next/link";
import {
  Flame,
  Droplets,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Activity,
  Gauge,
  ArrowRight,
  Sliders,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_WELLS } from "@/lib/sim/generator";
import { dynamicViscosity } from "@/lib/physics/viscosity";

// ─── KPI Card (Reference Image 1 & 3: Clean rounded card with soft border) ────

function KPICard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  color: string;
  trend?: string;
}) {
  return (
    <Card className="clean-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1.5 text-foreground">
              {value}
              {suffix && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {suffix}
                </span>
              )}
            </p>
            {trend && (
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-xs`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Well Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    producing: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    injecting: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    soaking: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    "shut-in": "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
    workover: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold uppercase ${styles[status] || styles["shut-in"]}`}
    >
      {status}
    </Badge>
  );
}

// ─── Field Map (Reference Image 1: Clean interactive widget) ──────────────────

function FieldMap() {
  const statusColors: Record<string, string> = {
    producing: "#10b981",
    injecting: "#f59e0b",
    soaking: "#3b82f6",
    "shut-in": "#94a3b8",
    workover: "#ef4444",
  };

  return (
    <Card className="clean-card rounded-2xl">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Baghewala Field Map — Well Locations
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono">Bikaner-Nagaur Basin</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative bg-muted/40 rounded-xl border border-border/50 h-64 overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 grid-bg-light opacity-60" />

          {/* Well dots */}
          {DEMO_WELLS.map((well) => {
            const minLat = 27.85;
            const maxLat = 27.865;
            const minLng = 71.32;
            const maxLng = 71.34;

            const x = ((well.lng - minLng) / (maxLng - minLng)) * 80 + 10;
            const y = ((maxLat - well.lat) / (maxLat - minLat)) * 80 + 10;

            return (
              <Link
                key={well.id}
                href={`/dashboard/wells/${well.id}`}
                className="absolute group z-10"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {well.status === "producing" && (
                  <div
                    className="absolute -inset-2.5 rounded-full animate-ping opacity-25"
                    style={{ backgroundColor: statusColors[well.status] }}
                  />
                )}
                <div
                  className="w-4 h-4 rounded-full border-2 border-background shadow-md relative z-10 transition-transform group-hover:scale-150"
                  style={{
                    backgroundColor: statusColors[well.status] || "#94a3b8",
                  }}
                />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground bg-card shadow-sm px-2 py-0.5 rounded-md border border-border/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {well.name} (CSS Asset)
                </div>
              </Link>
            );
          })}

          {/* Map legend */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] bg-card/90 backdrop-blur-md rounded-lg p-2 border border-border/60">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Producing
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Injecting
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Soaking
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Workover
              </span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">Click any well to open 3D Twin</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  const totalProduction = DEMO_WELLS.reduce(
    (sum, well) => sum + (well.status === "producing" ? 42 : 0),
    0
  );
  const avgTemp = 112; // °C
  const avgViscosity = Math.round(
    dynamicViscosity({ api_gravity: 18, temperature_c: avgTemp })
  );
  const activeAlerts = 3;

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Vibrant Sunset Banner Header (Reference Image 3: Banner + Profile Accent) */}
      <div className="rounded-2xl banner-sunset p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-bold uppercase tracking-wider mb-3">
            Oil India Limited • Baghewala Asset
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Viscora AI — Well-to-Surface Digital Twin
          </h1>
          <p className="text-white/90 text-sm mt-2 leading-relaxed">
            Unified thermal-viscosity state coupling reservoir steam cooldown with sucker rod pump
            mechanics for 17–19° API heavy oil operations.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/wells/well-001"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-white/90 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Launch 3D Hero Twin (BW-01)
            </Link>
            <Link
              href="/dashboard/css-planner"
              className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              CSS Steam Planner
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Droplets}
          label="Field Production"
          value={totalProduction.toString()}
          suffix="bopd"
          color="bg-blue-600"
          trend="+18% vs baseline"
        />
        <KPICard
          icon={Thermometer}
          label="Near-Wellbore Avg"
          value={avgTemp.toString()}
          suffix="°C"
          color="bg-amber-600"
          trend="CSS Cycle #4"
        />
        <KPICard
          icon={Gauge}
          label="Downhole Viscosity"
          value={avgViscosity.toString()}
          suffix="cP"
          color="bg-indigo-600"
          trend="Dynamic tuned"
        />
        <KPICard
          icon={AlertTriangle}
          label="Equipment Warnings"
          value={activeAlerts.toString()}
          suffix="active"
          color="bg-red-500"
          trend="3 action items"
        />
      </div>

      {/* Field Map + Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FieldMap />
        </div>

        <Card className="clean-card rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Well Operations Status</span>
              <Badge variant="outline" className="text-xs">
                {DEMO_WELLS.length} Wells
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Formation</span>
              <span className="font-semibold">Baghewala Heavy Crude</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">API Gravity</span>
              <span className="font-semibold text-amber-600">17.2 – 18.5° API</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Current Steam Efficiency (SOR)</span>
              <span className="font-semibold text-emerald-600">3.12 bbl/bbl</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Average Pump Fillage</span>
              <span className="font-semibold text-blue-600">94.2%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">VFD Asymmetric Mode</span>
              <span className="font-semibold text-emerald-600">Active (Rod Float Safe)</span>
            </div>

            <div className="pt-3 border-t border-border/40">
              <Link
                href="/dashboard/compare"
                className="w-full py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                View Baseline vs Twin Improvement
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Well Details Table */}
      <Card className="clean-card rounded-2xl">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">
                Baghewala Well Inventory &amp; Thermal State
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time coupled parameters from wellbore to surface pumping units
              </p>
            </div>
            <Badge className="synthetic-badge">6 of 6 Online</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Well Name</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Cycle</TableHead>
                  <TableHead className="text-xs font-semibold">API</TableHead>
                  <TableHead className="text-xs font-semibold">Depth (m)</TableHead>
                  <TableHead className="text-xs font-semibold">Temp (°C)</TableHead>
                  <TableHead className="text-xs font-semibold">Viscosity (cP)</TableHead>
                  <TableHead className="text-xs font-semibold">SPM / Stroke</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_WELLS.map((well, index) => {
                  const temp =
                    well.status === "producing"
                      ? 112
                      : well.status === "soaking"
                      ? 168
                      : well.status === "injecting"
                      ? 240
                      : 45;
                  const visc = Math.round(
                    dynamicViscosity({
                      api_gravity: well.api_gravity,
                      temperature_c: temp,
                    })
                  );

                  return (
                    <TableRow key={well.id} className="border-border/40 hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-xs">
                        <Link
                          href={`/dashboard/wells/${well.id}`}
                          className="text-blue-600 hover:underline flex items-center gap-1.5"
                        >
                          {well.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={well.status} />
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        Cycle #{(index % 3) + 3}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {well.api_gravity}°
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {well.depth_m}m
                      </TableCell>
                      <TableCell className="text-xs font-mono text-amber-600 font-semibold">
                        {temp}°C
                      </TableCell>
                      <TableCell className="text-xs font-mono text-blue-600 font-semibold">
                        {visc} cP
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {(4.5 + (index % 3) * 0.5).toFixed(1)} SPM / 84&quot;
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/wells/${well.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-blue-600 transition-colors"
                        >
                          Open Twin
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
