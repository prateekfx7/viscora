"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  Activity,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Gauge,
  Thermometer,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViscoraLogo } from "@/components/brand/ViscoraLogo";
import { ROICalculator } from "@/components/marketing/ROICalculator";
import { ThermalArchitecture } from "@/components/marketing/ThermalArchitecture";
import { Footer } from "@/components/marketing/Footer";

const navItems = [
  { label: "Twin Engine", href: "#twin-engine", id: "twin-engine" },
  { label: "Capabilities", href: "#capabilities", id: "capabilities" },
  { label: "Thermal Physics", href: "#thermal-physics", id: "thermal-physics" },
  { label: "ROI Calculator", href: "#roi-calculator", id: "roi-calculator" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (i ?? 0) * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -76;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative flex flex-col">
      {/* Ambient background glow from Clora reference */}
      <div className="absolute inset-0 ambient-glow pointer-events-none overflow-hidden" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ViscoraLogo href="/" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => scrollTo(e, item.id)}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1.5 hidden sm:inline-flex"
            >
              Launch Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => scrollTo(e, item.id)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-medium py-2 text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard?demo=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  Launch Platform
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-6 max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center"
          >
            {/* Pill Tag */}
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                AI-Powered Well-to-Surface Digital Twin
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.12]"
            >
              One Tool To Predict Viscosity, Optimize Steam &amp; Protect Rods
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Viscora AI couples reservoir cooling dynamics with sucker rod pump mechanics
              for 17–19° API heavy oil wells. Eliminate pump-off, prevent rod float, and cut
              Steam-Oil Ratio (SOR) across the Baghewala Field.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
            >
              <Link
                href="/dashboard?demo=true"
                className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2"
              >
                Start for Free (Demo)
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/wells/well-001"
                className="px-6 py-3 rounded-xl bg-card border border-border/80 text-foreground font-semibold text-sm hover:bg-muted/60 transition-colors shadow-xs flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                Explore 3D Well Twin
              </Link>
            </motion.div>

            {/* Engineer avatars label */}
            <motion.div variants={fadeUp} custom={4} className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-blue-500 text-[10px] text-white font-bold flex items-center justify-center">
                  AS
                </div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-amber-500 text-[10px] text-white font-bold flex items-center justify-center">
                  RK
                </div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center">
                  PM
                </div>
              </div>
              <span>Calibrated for Oil India Limited heavy crude wells</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Floating High-Fidelity Product Preview (Reference Image 1) */}
        <section id="twin-engine" className="px-4 sm:px-6 max-w-6xl mx-auto pb-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-2xl clean-card floating-shadow overflow-hidden bg-card border border-border/80"
          >
            {/* Window Topbar */}
            <div className="h-11 border-b border-border/60 bg-muted/30 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  viscora://baghewala/well-001/realtime-twin
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Twin Synced
                </span>
                <Link
                  href="/dashboard"
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  Open Live
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup Body */}
            <div className="p-6 space-y-6">
              {/* Row 1: KPI Mini Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Active Wells</span>
                    <span className="text-emerald-600 font-semibold">+16% eff</span>
                  </div>
                  <div className="text-2xl font-bold">6 Wells</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Baghewala Formation</div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Near-Wellbore Temp</span>
                    <span className="text-blue-600 font-semibold">CSS Cycle #4</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">114.8 °C</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Viscosity: 348 cP</div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Pump Fillage</span>
                    <span className="text-emerald-600 font-semibold">Target &gt;90%</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">94.2%</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Zero Fluid Pound</div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Steam-Oil Ratio (SOR)</span>
                    <span className="text-amber-600 font-semibold">-22% cost</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">3.12 bbl/bbl</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Optimized Thermal Soak</div>
                </div>
              </div>

              {/* Row 2: Visual Twin + Telemetry Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-5 rounded-xl bg-muted/30 border border-border/40 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold">Coupled Well-to-Surface Thermal Telemetry</h4>
                      <p className="text-xs text-muted-foreground">Temperature decay vs. Dynamic downhole viscosity curve</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Simulated 180 Days
                    </Badge>
                  </div>

                  {/* Visual Chart representation */}
                  <div className="h-44 w-full flex items-end gap-1.5 pt-4 px-2">
                    {[
                      { temp: 160, visc: 85, h1: "80%", h2: "15%" },
                      { temp: 152, visc: 110, h1: "75%", h2: "20%" },
                      { temp: 145, visc: 145, h1: "70%", h2: "26%" },
                      { temp: 138, visc: 185, h1: "65%", h2: "32%" },
                      { temp: 130, visc: 230, h1: "60%", h2: "38%" },
                      { temp: 122, visc: 290, h1: "54%", h2: "45%" },
                      { temp: 115, visc: 360, h1: "48%", h2: "53%" },
                      { temp: 108, visc: 450, h1: "42%", h2: "62%" },
                      { temp: 100, visc: 580, h1: "36%", h2: "72%" },
                      { temp: 92, visc: 740, h1: "30%", h2: "83%" },
                      { temp: 85, visc: 960, h1: "24%", h2: "92%" },
                      { temp: 78, visc: 1250, h1: "18%", h2: "100%" },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                          <div
                            style={{ height: bar.h1 }}
                            className="w-1/2 bg-amber-500/80 rounded-t-sm transition-all group-hover:bg-amber-400"
                            title={`Temp: ${bar.temp}°C`}
                          />
                          <div
                            style={{ height: bar.h2 }}
                            className="w-1/2 bg-blue-600/80 rounded-t-sm transition-all group-hover:bg-blue-500"
                            title={`Viscosity: ${bar.visc} cP`}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">D{i * 15}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40 mt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                        Near-Wellbore Temp (°C)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                        Crude Viscosity (cP)
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-foreground">Next Steam Cycle: Day 165</span>
                  </div>
                </div>

                {/* Dyno Card mini preview */}
                <div className="p-5 rounded-xl bg-muted/30 border border-border/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">Dyno-Card Health</h4>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Full Liquid Fill
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Surface vs. Downhole pump card load</p>

                    {/* SVG Dyno card shape */}
                    <div className="h-32 w-full rounded-lg bg-background border border-border/60 p-2 flex items-center justify-center relative">
                      <svg viewBox="0 0 100 60" className="w-full h-full stroke-blue-600 fill-blue-500/10 stroke-2">
                        <path
                          d="M 15 45 L 85 45 Q 92 45 90 20 L 25 15 Q 12 18 15 45 Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground">
                        PPRL: 18.4 klbs
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fluid Pound Index</span>
                      <span className="font-medium text-emerald-600">0.02 (Safe)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rod Float Risk</span>
                      <span className="font-medium text-emerald-600">Low (VFD tuned)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Field & Trust Banner */}
        <section className="py-10 border-y border-border/40 bg-muted/20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Engineered For Complex Heavy Oil Fields &amp; Extreme Thermal Cycles
            </p>
            <div className="flex flex-wrap items-center justify-around gap-6 opacity-75 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                <Flame className="w-4 h-4 text-orange-500" />
                Oil India Limited (Baghewala)
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                <Gauge className="w-4 h-4 text-blue-500" />
                Bikaner-Nagaur Basin
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                <Cpu className="w-4 h-4 text-emerald-500" />
                Cyclic Steam Stimulation
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                <Activity className="w-4 h-4 text-indigo-500" />
                Sucker Rod Pump Digital Twin
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features (Reference Image 1 Bottom Half) */}
        <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 block">
              — CAPABILITIES —
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Latest Advanced Technologies To Ensure Maximum Production
            </h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base">
              Bridge the operational gap between CSS steam soak schedules and SRP mechanical tuning
              with a single, unified thermal-hydraulic twin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: 3D Twin */}
            <div className="clean-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Procedural 3D Well Twin</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interactive real-time 3D visualization of wellbore heat transfer, walking beam
                  unit kinematics, dynamic fluid level, and thermal reservoir glow.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  href="/dashboard/wells/well-001"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Explore 3D Viewer
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: Smart Early Warnings */}
            <div className="clean-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Predictive Failure Protection</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Early alerts for rod floating, fluid pound, gearbox overload, and severe thermal
                  contraction before costly workover events occur.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  href="/dashboard/alerts"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  View Alert Feed
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 3: CSS & VFD Optimization */}
            <div className="clean-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Multi-Objective CSS Planner</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pareto frontier algorithm balancing steam injection tons, soak period, and
                  automated asymmetric VFD stroke adjustments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  href="/dashboard/css-planner"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Run What-If Planner
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Thermal Architecture Deep Dive */}
        <section id="thermal-physics" className="py-20 px-6 max-w-6xl mx-auto border-t border-border/40 scroll-mt-24">
          <ThermalArchitecture />
        </section>

        {/* Interactive ROI Calculator Section */}
        <section id="roi-calculator" className="py-20 px-6 max-w-6xl mx-auto border-t border-border/40 scroll-mt-24">
          <ROICalculator />
        </section>

        {/* Enterprise CTA Banner */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="rounded-3xl banner-sunset p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[11px] font-bold uppercase tracking-wider">
                Oil India Limited Asset Deployment
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Bridge The Gap Between Steam Soak &amp; Surface Pumping
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Stop tuning CSS steam cycles and sucker rod pumps in silos. Experience the
                only digital twin that models near-wellbore temperature falloff to prevent rod float and cut SOR.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/dashboard?demo=true"
                  className="px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                >
                  Explore Field Twin (One-Click Demo)
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/30 text-white font-semibold text-sm transition-colors"
                >
                  Engineer Portal Login
                </Link>
              </div>
              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-white/80">
                <span className="flex items-center gap-1.5">✓ OPC-UA SCADA Ready</span>
                <span className="flex items-center gap-1.5">✓ Sub-Second Inference</span>
                <span className="flex items-center gap-1.5">✓ 99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rich Multi-Column Enterprise Footer */}
      <Footer />
    </div>
  );
}
