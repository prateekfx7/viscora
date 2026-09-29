"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViscoraLogo } from "@/components/brand/ViscoraLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const isPlaceholder =
        !supabaseUrl ||
        supabaseUrl.includes("placeholder") ||
        supabaseUrl.includes("example.com");

      if (isPlaceholder) {
        // Automatically enter demo mode with simulated credentials
        document.cookie =
          "thermotwin_demo=true; path=/; max-age=604800; SameSite=Lax";
        window.location.href = "/dashboard";
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      window.location.href = "/dashboard";
    } catch {
      // Fallback to demo mode for offline demonstration
      document.cookie =
        "thermotwin_demo=true; path=/; max-age=604800; SameSite=Lax";
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setDemoLoading(true);
    document.cookie =
      "thermotwin_demo=true; path=/; max-age=604800; SameSite=Lax";
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground antialiased">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Left Pane: Clean White Login Form (Reference Image 2) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 z-20 bg-card">
        {/* Top Logo */}
        <div className="flex items-center gap-2.5">
          <ViscoraLogo href="/" />
        </div>

        {/* Center Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Login to your account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Welcome back, please enter your engineering credentials
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@oilindia.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-border/70 focus:border-blue-600 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-muted/30 border-border/70 focus:border-blue-600 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border/70 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continue
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* Alternative One-Click Demo Mode Button (Reference Image 2) */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              disabled={demoLoading}
              className="w-full h-11 rounded-xl border-border/70 hover:bg-muted/50 text-foreground font-medium flex items-center justify-center gap-2"
            >
              {demoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              )}
              Enter Demo Mode (One-Click)
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              className="w-full h-11 rounded-xl border-border/70 hover:bg-muted/50 text-muted-foreground font-medium text-xs flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              OIL Single Sign-On (SSO)
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Not registered yet?{" "}
            <button
              onClick={handleDemoAccess}
              className="text-blue-600 font-semibold hover:underline"
            >
              Register as Petroleum Engineer
            </button>
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground text-center">
          Oil India Limited • Baghewala Heavy Oil Field Digital Operations
        </div>
      </div>

      {/* Right Pane: Soft Sky Blue Gradient with Clean Image Showcase (Reference Image 2) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-sky-100/60 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border-l border-border/50 overflow-hidden">
        {/* Ambient Blur Orb */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Streamline <br />
            <span className="text-blue-600">Your Well Operations.</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The modern digital twin for heavy crude CSS &amp; SRP wells.
            Built for thermal accuracy, rod protection, and maximum recovery.
          </p>
        </div>

        {/* Clean Image Showcase Frame */}
        <div className="relative w-full max-w-md z-10">
          <div className="clean-card rounded-3xl p-3 bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl overflow-hidden group">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted/30">
              <Image
                src="/images/well-twin-showcase.jpg"
                alt="Viscora Digital Twin Sucker Rod Pump Operations"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <div className="text-xs font-bold tracking-wide">Baghewala Wellpad BW-01</div>
                  <div className="text-[10px] text-white/80 font-mono">114.8°C Near-Wellbore • 94.2% Fillage</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                  ● Live Twin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots (Reference Image 2) */}
        <div className="flex items-center gap-1.5 mt-8">
          <div className="w-6 h-1.5 rounded-full bg-blue-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}
