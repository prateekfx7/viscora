"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  Droplets,
  Calendar,
  TrendingUp,
  Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParetoChart, TempViscChart } from "@/components/dashboard/Charts";
import { optimizeCSS } from "@/lib/physics/optimizer";
import { sandFaceTemperature, DEFAULT_THERMAL_PARAMS } from "@/lib/physics/thermal";
import { dynamicViscosity } from "@/lib/physics/viscosity";
import type { TelemetryRow, ThermalParams } from "@/types";

export default function CSSPlannerPage() {
  // What-if parameters
  const [steamVolume, setSteamVolume] = useState(1500);
  const [injPressure, setInjPressure] = useState(2000);
  const [soakDays, setSoakDays] = useState(10);

  // Pareto front
  const paretoFront = useMemo(() => optimizeCSS(18, 300), []);

  // What-if cooling curve
  const whatIfCurve = useMemo(() => {
    const thermalParams: ThermalParams = {
      steam_volume_bbl: steamVolume,
      inj_pressure_kpa: injPressure,
      soak_days: soakDays,
      ...DEFAULT_THERMAL_PARAMS,
    };

    const data: TelemetryRow[] = [];
    for (let d = 1; d <= 120; d += 2) {
      const daysSinceSteam = soakDays + d;
      const temp = sandFaceTemperature(thermalParams, daysSinceSteam);
      const visc = dynamicViscosity({ api_gravity: 18, temperature_c: temp });

      data.push({
        id: `wif-${d}`,
        well_id: "what-if",
        ts: new Date().toISOString(),
        spm: 0,
        stroke_len_m: 0,
        vfd_hz: 0,
        motor_kw: 0,
        wellhead_temp_c: temp * 0.6 + 15,
        sandface_temp_c: Math.round(temp * 10) / 10,
        viscosity_cp: Math.round(visc),
        fillage_pct: 0,
        oil_rate_bpd: 0,
        days_since_steam: daysSinceSteam,
        mode: "thermotwin",
      });
    }
    return data;
  }, [steamVolume, injPressure, soakDays]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            CSS Cycle Planner
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-objective optimizer for steam volume, pressure, soak days &
            production cut-off
          </p>
        </div>
        <Badge className="synthetic-badge">Synthetic</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* What-if Controls */}
        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              What-If Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">
                  Steam Volume
                </Label>
                <span className="text-xs font-mono text-amber-400">
                  {steamVolume} bbl
                </span>
              </div>
              <Slider
                value={[steamVolume]}
                onValueChange={(v) => setSteamVolume(Array.isArray(v) ? v[0] : (v as number))}
                min={500}
                max={3000}
                step={100}
                className="[&_[role=slider]]:bg-amber-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">
                  Injection Pressure
                </Label>
                <span className="text-xs font-mono text-amber-400">
                  {injPressure} kPa
                </span>
              </div>
              <Slider
                value={[injPressure]}
                onValueChange={(v) => setInjPressure(Array.isArray(v) ? v[0] : (v as number))}
                min={1000}
                max={3500}
                step={100}
                className="[&_[role=slider]]:bg-orange-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">
                  Soak Days
                </Label>
                <span className="text-xs font-mono text-amber-400">
                  {soakDays} days
                </span>
              </div>
              <Slider
                value={[soakDays]}
                onValueChange={(v) => setSoakDays(Array.isArray(v) ? v[0] : (v as number))}
                min={5}
                max={21}
                step={1}
                className="[&_[role=slider]]:bg-cyan-500"
              />
            </div>

            {/* Quick info */}
            <div className="pt-4 border-t border-border/30 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Peak Temp
                </span>
                <span className="font-semibold text-amber-400">
                  {Math.round(whatIfCurve[0]?.sandface_temp_c ?? 0)}°C
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> Initial Visc
                </span>
                <span className="font-semibold text-cyan-400">
                  {whatIfCurve[0]?.viscosity_cp ?? 0} cP
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Final Visc
                </span>
                <span className="font-semibold text-cyan-400">
                  {whatIfCurve[whatIfCurve.length - 1]?.viscosity_cp ?? 0} cP
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cooling Curve */}
        <Card className="clean-card rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Predicted Temperature & Viscosity Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <TempViscChart data={whatIfCurve} />
          </CardContent>
        </Card>
      </div>

      {/* Pareto Front */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Pareto Front — Oil vs SOR vs Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ParetoChart data={paretoFront} />
          </CardContent>
        </Card>

        {/* Pareto Table */}
        <Card className="clean-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Top Pareto Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-[10px]">Steam (bbl)</TableHead>
                    <TableHead className="text-[10px]">Pres (kPa)</TableHead>
                    <TableHead className="text-[10px]">Soak (d)</TableHead>
                    <TableHead className="text-[10px]">Oil (bbl)</TableHead>
                    <TableHead className="text-[10px]">SOR</TableHead>
                    <TableHead className="text-[10px]">Cost ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paretoFront.slice(0, 12).map((point, i) => (
                    <TableRow
                      key={i}
                      className="border-border/20 hover:bg-muted/30"
                    >
                      <TableCell className="text-xs font-mono">
                        {point.steam_volume_bbl}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {point.inj_pressure_kpa}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {point.soak_days}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-emerald-400">
                        {point.cum_oil_bbl}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-amber-400">
                        {point.sor}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        ${point.energy_cost_usd}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
