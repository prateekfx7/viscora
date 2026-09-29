"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Droplets,
  DollarSign,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export function ROICalculator() {
  const [wellCount, setWellCount] = useState(6);
  const [baselineSOR, setBaselineSOR] = useState(4.2);
  const [steamCostPerBbl, setSteamCostPerBbl] = useState(12);
  const [failureRate, setFailureRate] = useState(4); // failures per well per year

  // Heavy oil physics calculation approximations for Baghewala field:
  // Viscora AI optimizes soak time + asymmetric pumping to reduce SOR by ~25%
  const optimizedSOR = Number((baselineSOR * 0.74).toFixed(2));
  const sorDelta = Number((baselineSOR - optimizedSOR).toFixed(2));

  // Avg oil production per well ~ 45 bopd * 330 operating days = 14,850 bbl oil/year/well
  const annualOilPerWell = 14850;
  const totalAnnualOil = annualOilPerWell * wellCount;

  // Steam saved in bbl = totalAnnualOil * sorDelta
  const annualSteamSavedBbl = Math.round(totalAnnualOil * sorDelta);
  const annualSteamCostSavings = Math.round(annualSteamSavedBbl * steamCostPerBbl);

  // Failure reduction: Viscora AI prevents ~75% of rod floating & fluid pound events
  const failuresPrevented = Math.round(wellCount * failureRate * 0.75);
  const costPerWorkover = 12000; // $12,000 average per heavy crude pump workover + downtime
  const workoverSavings = failuresPrevented * costPerWorkover;

  const totalAnnualSavings = annualSteamCostSavings + workoverSavings;

  return (
    <div className="w-full clean-card rounded-3xl p-6 sm:p-10 bg-card border border-border/70 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Input Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase">
                Interactive Economics
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Baghewala Calibration</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              Estimate Your Field Recovery &amp; Steam Savings
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Adjust your operating parameters to forecast annual steam savings and workover reductions.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {/* Control 1: Active Wells */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Active CSS/SRP Wells</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                  {wellCount} Wells
                </span>
              </div>
              <Slider
                value={[wellCount]}
                onValueChange={(v) => setWellCount(Array.isArray(v) ? v[0] : (v as number))}
                min={1}
                max={24}
                step={1}
                className="[&_[role=slider]]:bg-blue-600"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 well</span>
                <span>12 wells</span>
                <span>24 wells</span>
              </div>
            </div>

            {/* Control 2: Baseline SOR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Baseline Steam-Oil Ratio (SOR)</span>
                <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                  {baselineSOR} bbl steam / bbl oil
                </span>
              </div>
              <Slider
                value={[baselineSOR]}
                onValueChange={(v) => setBaselineSOR(Number((Array.isArray(v) ? v[0] : (v as number)).toFixed(1)))}
                min={3.0}
                max={6.0}
                step={0.1}
                className="[&_[role=slider]]:bg-amber-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>3.0 (Low)</span>
                <span>4.5 (Typical Heavy Oil)</span>
                <span>6.0 (High Heat Loss)</span>
              </div>
            </div>

            {/* Control 3: Steam Generation Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Steam Generation Cost ($/bbl)</span>
                <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                  ${steamCostPerBbl} / bbl
                </span>
              </div>
              <Slider
                value={[steamCostPerBbl]}
                onValueChange={(v) => setSteamCostPerBbl(Array.isArray(v) ? v[0] : (v as number))}
                min={6}
                max={25}
                step={1}
                className="[&_[role=slider]]:bg-foreground"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$6/bbl</span>
                <span>$15/bbl</span>
                <span>$25/bbl</span>
              </div>
            </div>

            {/* Control 4: Rod Failure Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Annual Rod / Pump Failures</span>
                <span className="font-mono font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                  {failureRate} failures / well / yr
                </span>
              </div>
              <Slider
                value={[failureRate]}
                onValueChange={(v) => setFailureRate(Array.isArray(v) ? v[0] : (v as number))}
                min={1}
                max={8}
                step={1}
                className="[&_[role=slider]]:bg-red-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 failure</span>
                <span>4 failures (Severe float)</span>
                <span>8 failures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Calculated Value Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-100 mb-2">
              <span>PROJECTED ANNUAL VALUE</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                PAYBACK &lt; 45 DAYS
              </span>
            </div>

            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              ${(totalAnnualSavings / 1000).toFixed(0)}k
              <span className="text-sm font-normal text-blue-200 ml-1.5">/ year</span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Net savings across steam generation and avoided downhole workovers.
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="space-y-3 pt-3 border-t border-white/20 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-blue-100 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                SOR Improvement
              </span>
              <span className="font-mono font-bold text-white">
                {baselineSOR} → {optimizedSOR} (-26%)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-blue-100 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                Annual Steam Saved
              </span>
              <span className="font-mono font-bold text-emerald-300">
                ${(annualSteamCostSavings / 1000).toFixed(0)}k ({annualSteamSavedBbl.toLocaleString()} bbl)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-blue-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                Workovers Avoided
              </span>
              <span className="font-mono font-bold text-white">
                {failuresPrevented} events (${(workoverSavings / 1000).toFixed(0)}k)
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link
              href="/dashboard?demo=true"
              className="w-full py-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Verify On Your Field Data (Demo)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
