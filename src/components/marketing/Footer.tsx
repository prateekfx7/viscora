"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Shield,
  Layers,
  Activity,
  Globe,
  Mail,
  ExternalLink,
} from "lucide-react";
import { ViscoraLogo } from "@/components/brand/ViscoraLogo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur-md relative z-10 text-foreground">
      {/* Newsletter & Field Updates Callout */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
          <div className="lg:col-span-6 space-y-2">
            <h4 className="text-lg font-bold tracking-tight">
              Subscribe to Heavy Oil Engineering Bulletins
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              Receive quarterly technical briefs on CSS soak falloff models, Baghewala field
              benchmarks, and VFD asymmetric pump automation.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Thank you! You are now subscribed to Viscora technical field releases.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md lg:ml-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="engineer@oilindia.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  Subscribe
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <ViscoraLogo href="/" />
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              AI-enabled Well-to-Surface Digital Twin platform for Cyclic Steam Stimulation (CSS)
              and Sucker Rod Pump (SRP) optimization across the Baghewala Heavy Oil Field.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                SCADA Uplink Operational
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">(99.98% Uptime)</span>
            </div>
          </div>

          {/* Column 1: Twin Engine */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Digital Twin
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/dashboard/wells/well-001" className="hover:text-foreground transition-colors">
                  3D Procedural Well Twin
                </Link>
              </li>
              <li>
                <Link href="/dashboard/css-planner" className="hover:text-foreground transition-colors">
                  CSS Pareto Optimizer
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wells/well-001" className="hover:text-foreground transition-colors">
                  Coupled Dyno Cards
                </Link>
              </li>
              <li>
                <Link href="/dashboard/alerts" className="hover:text-foreground transition-colors">
                  Rod Floating Alerts
                </Link>
              </li>
              <li>
                <Link href="/dashboard/compare" className="hover:text-foreground transition-colors">
                  Baseline vs Optimized
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Asset Solutions
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Baghewala 17–19° API
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  CSS Steam Conservation
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Sucker Rod Protection
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Fluid Pound Elimination
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Asymmetric VFD Control
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Science & Enterprise */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Engineering
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Walther ASTM D341 Formula
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  1D Gibbs Wave Equation
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Thermal Falloff Solver
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  OPC-UA / Modbus Gateway
                </span>
              </li>
              <li>
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  Engineer Portal Access
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Asset Recognition */}
      <div className="border-t border-border/40 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © 2026 Viscora AI. Developed for Oil India Limited — Baghewala Heavy Crude Operations.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">Bikaner-Nagaur Basin Asset</span>
            <span className="hover:text-foreground cursor-pointer">DGH E&amp;P Guidelines</span>
            <span className="hover:text-foreground cursor-pointer">Security &amp; Data Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
