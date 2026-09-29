"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { TelemetryRow, DynoCard } from "@/types";

// ─── Common chart theme ──────────────────────────────────────────────────────

const chartTheme = {
  backgroundColor: "transparent",
  textStyle: { color: "#9ca3af", fontFamily: "var(--font-geist-sans)" },
  legend: { textStyle: { color: "#9ca3af" } },
  categoryAxis: {
    axisLine: { lineStyle: { color: "#333" } },
    splitLine: { lineStyle: { color: "#222" } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: "#333" } },
    splitLine: { lineStyle: { color: "#1a1a22" } },
  },
};

// ─── Temperature & Viscosity Chart ───────────────────────────────────────────

export function TempViscChart({ data }: { data: TelemetryRow[] }) {
  const option: EChartsOption = {
    ...chartTheme,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
    },
    grid: { top: 40, right: 60, bottom: 30, left: 50, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => `D${d.days_since_steam}`),
      axisLine: { lineStyle: { color: "#333" } },
      axisLabel: { color: "#666", fontSize: 10 },
    },
    yAxis: [
      {
        type: "value",
        name: "Temp (°C)",
        nameTextStyle: { color: "#f59e0b", fontSize: 10 },
        axisLabel: { color: "#f59e0b", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1a1a22" } },
      },
      {
        type: "value",
        name: "Visc (cP)",
        nameTextStyle: { color: "#06b6d4", fontSize: 10 },
        axisLabel: { color: "#06b6d4", fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Sandface Temp",
        type: "line",
        data: data.map((d) => d.sandface_temp_c),
        smooth: true,
        lineStyle: { color: "#f59e0b", width: 2 },
        itemStyle: { color: "#f59e0b" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,158,11,0.2)" },
              { offset: 1, color: "rgba(245,158,11,0)" },
            ],
          },
        },
        symbol: "none",
      },
      {
        name: "Viscosity",
        type: "line",
        yAxisIndex: 1,
        data: data.map((d) => d.viscosity_cp),
        smooth: true,
        lineStyle: { color: "#06b6d4", width: 2 },
        itemStyle: { color: "#06b6d4" },
        symbol: "none",
      },
    ],
    legend: {
      top: 5,
      textStyle: { color: "#888", fontSize: 10 },
      data: ["Sandface Temp", "Viscosity"],
    },
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}

// ─── Oil Rate Chart ──────────────────────────────────────────────────────────

export function OilRateChart({ data }: { data: TelemetryRow[] }) {
  const option: EChartsOption = {
    ...chartTheme,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
    },
    grid: { top: 40, right: 20, bottom: 30, left: 50, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => `D${d.days_since_steam}`),
      axisLine: { lineStyle: { color: "#333" } },
      axisLabel: { color: "#666", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      name: "Oil Rate (bpd)",
      nameTextStyle: { color: "#10b981", fontSize: 10 },
      axisLabel: { color: "#10b981", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1a1a22" } },
    },
    series: [
      {
        name: "Oil Rate",
        type: "bar",
        data: data.map((d) => d.oil_rate_bpd),
        itemStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "#10b981" },
              { offset: 1, color: "#064e3b" },
            ],
          },
          borderRadius: [2, 2, 0, 0],
        },
        barMaxWidth: 12,
      },
    ],
    legend: {
      top: 5,
      textStyle: { color: "#888", fontSize: 10 },
    },
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}

// ─── Dynamometer Card Chart ──────────────────────────────────────────────────

export function DynoCardChart({ card }: { card: DynoCard }) {
  const classColors: Record<string, string> = {
    full_pump: "#10b981",
    fluid_pound: "#f59e0b",
    gas_interference: "#8b5cf6",
    pump_off: "#ef4444",
    rod_floating: "#f43f5e",
    tagging: "#06b6d4",
  };

  const color = classColors[card.card_class] || "#888";

  const surfaceData = card.position.map((pos, i) => [pos, card.load[i]]);
  const downholeData = card.position.map((pos, i) => [pos, card.downhole_load[i]]);

  const option: EChartsOption = {
    ...chartTheme,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = params as { data: number[] };
        return `Pos: ${p.data[0].toFixed(3)} m<br/>Load: ${p.data[1].toFixed(1)} kN`;
      },
    },
    grid: { top: 40, right: 20, bottom: 30, left: 50, containLabel: true },
    xAxis: {
      type: "value",
      name: "Position (m)",
      nameTextStyle: { color: "#888", fontSize: 10 },
      axisLabel: { color: "#666", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1a1a22" } },
    },
    yAxis: {
      type: "value",
      name: "Load (kN)",
      nameTextStyle: { color: "#888", fontSize: 10 },
      axisLabel: { color: "#666", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1a1a22" } },
    },
    series: [
      {
        name: "Surface Card",
        type: "line",
        data: surfaceData,
        smooth: true,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        symbol: "none",
        areaStyle: {
          color: `${color}15`,
        },
      },
      {
        name: "Downhole Card",
        type: "line",
        data: downholeData,
        smooth: true,
        lineStyle: { color: "#666", width: 1, type: "dashed" },
        itemStyle: { color: "#666" },
        symbol: "none",
      },
    ],
    legend: {
      top: 5,
      textStyle: { color: "#888", fontSize: 10 },
    },
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}

// ─── Motor Power & Fillage Chart ─────────────────────────────────────────────

export function PowerFillageChart({ data }: { data: TelemetryRow[] }) {
  const option: EChartsOption = {
    ...chartTheme,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
    },
    grid: { top: 40, right: 60, bottom: 30, left: 50, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => `D${d.days_since_steam}`),
      axisLine: { lineStyle: { color: "#333" } },
      axisLabel: { color: "#666", fontSize: 10 },
    },
    yAxis: [
      {
        type: "value",
        name: "kW",
        nameTextStyle: { color: "#a855f7", fontSize: 10 },
        axisLabel: { color: "#a855f7", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1a1a22" } },
      },
      {
        type: "value",
        name: "Fillage %",
        min: 0,
        max: 100,
        nameTextStyle: { color: "#ec4899", fontSize: 10 },
        axisLabel: { color: "#ec4899", fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Motor Power",
        type: "line",
        data: data.map((d) => d.motor_kw),
        smooth: true,
        lineStyle: { color: "#a855f7", width: 2 },
        itemStyle: { color: "#a855f7" },
        symbol: "none",
      },
      {
        name: "Fillage",
        type: "line",
        yAxisIndex: 1,
        data: data.map((d) => d.fillage_pct),
        smooth: true,
        lineStyle: { color: "#ec4899", width: 2 },
        itemStyle: { color: "#ec4899" },
        symbol: "none",
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(236,72,153,0.1)" },
              { offset: 1, color: "rgba(236,72,153,0)" },
            ],
          },
        },
      },
    ],
    legend: {
      top: 5,
      textStyle: { color: "#888", fontSize: 10 },
    },
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}

// ─── Pareto Front Chart ──────────────────────────────────────────────────────

export function ParetoChart({
  data,
}: {
  data: Array<{ cum_oil_bbl: number; sor: number; energy_cost_usd: number }>;
}) {
  const option: EChartsOption = {
    ...chartTheme,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = params as { data: number[] };
        return `Oil: ${p.data[0]} bbl<br/>SOR: ${p.data[1]}<br/>Cost: $${p.data[2]}`;
      },
    },
    grid: { top: 40, right: 20, bottom: 40, left: 60, containLabel: true },
    xAxis: {
      type: "value",
      name: "Cumulative Oil (bbl)",
      nameTextStyle: { color: "#10b981", fontSize: 10 },
      nameLocation: "middle",
      nameGap: 25,
      axisLabel: { color: "#666", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1a1a22" } },
    },
    yAxis: {
      type: "value",
      name: "SOR",
      nameTextStyle: { color: "#f59e0b", fontSize: 10 },
      axisLabel: { color: "#666", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1a1a22" } },
    },
    series: [
      {
        name: "Pareto Front",
        type: "scatter",
        data: data.map((d) => [d.cum_oil_bbl, d.sor, d.energy_cost_usd]),
        symbolSize: (val: number[]) => {
          return Math.max(6, 20 - val[2] / 1000);
        },
        itemStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#f59e0b" },
              { offset: 1, color: "#06b6d4" },
            ],
          },
          borderColor: "#fff",
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: "rgba(245,158,11,0.3)",
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}

// ─── Comparison Bar Chart ────────────────────────────────────────────────────

export function ComparisonChart({
  baseline,
  optimized,
  labels,
  title,
}: {
  baseline: number[];
  optimized: number[];
  labels: string[];
  title: string;
}) {
  const option: EChartsOption = {
    ...chartTheme,
    title: {
      text: title,
      textStyle: { color: "#e5e5e5", fontSize: 13, fontWeight: 600 },
      left: "center",
      top: 5,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20,20,30,0.95)",
      borderColor: "#333",
      textStyle: { color: "#e5e5e5", fontSize: 11 },
    },
    grid: { top: 50, right: 20, bottom: 30, left: 50, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "#333" } },
      axisLabel: { color: "#666", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#1a1a22" } },
      axisLabel: { color: "#666", fontSize: 10 },
    },
    series: [
      {
        name: "Baseline",
        type: "bar",
        data: baseline,
        itemStyle: {
          color: "#ef4444",
          borderRadius: [3, 3, 0, 0],
        },
        barGap: "20%",
        barMaxWidth: 30,
      },
      {
        name: "ThermoTwin",
        type: "bar",
        data: optimized,
        itemStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "#f59e0b" },
              { offset: 1, color: "#d97706" },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        barMaxWidth: 30,
      },
    ],
    legend: {
      top: 5,
      right: 10,
      textStyle: { color: "#888", fontSize: 10 },
    },
  };

  return <ReactECharts option={option} style={{ height: "100%" }} />;
}
