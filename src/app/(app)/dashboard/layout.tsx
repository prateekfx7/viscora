"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Flame,
  LayoutDashboard,
  Droplets,
  Calendar,
  AlertTriangle,
  GitCompare,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  Cpu,
  CheckCircle2,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViscoraLogo } from "@/components/brand/ViscoraLogo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "General",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "6" },
      { href: "/dashboard/wells/well-001", label: "Well Twin (3D)", icon: Droplets, badge: "Live" },
      { href: "/dashboard/css-planner", label: "CSS Planner", icon: Calendar },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard/alerts", label: "Failure Alerts", icon: AlertTriangle, badge: "3", badgeColor: "bg-red-500/10 text-red-600" },
      { href: "/dashboard/compare", label: "Baseline Compare", icon: GitCompare },
    ],
  },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-sidebar-border flex items-center justify-between">
        <ViscoraLogo href="/dashboard" />
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to RTU" />
      </div>

      {/* Search Bar (Reference Image 3) */}
      <div className="px-4 pt-3.5 pb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search... ⌘K"
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-muted/50 border border-sidebar-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
            readOnly
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? "bg-white/20 text-white"
                              : item.badgeColor || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Well Selector */}
          <div className="space-y-1 pt-1">
            <div className="px-3 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Baghewala Wells
            </div>
            <div className="space-y-0.5">
              {[
                { id: "well-001", name: "BW-01 (Hero Twin)", temp: "114°C", status: "emerald" },
                { id: "well-002", name: "BW-02 (Soak Phase)", temp: "168°C", status: "amber" },
                { id: "well-003", name: "BW-03 (Cooling)", temp: "82°C", status: "red" },
              ].map((well) => (
                <Link
                  key={well.id}
                  href={`/dashboard/wells/${well.id}`}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors ${
                    pathname === `/dashboard/wells/${well.id}` ? "bg-muted text-foreground font-semibold" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      well.status === "emerald" ? "bg-emerald-500" : well.status === "amber" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span>{well.name}</span>
                  </div>
                  <span className="font-mono text-[10px]">{well.temp}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Apps / Sync Status (Reference Image 3) */}
          <div className="space-y-1 pt-1">
            <div className="px-3 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Telemetry Status
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-sidebar-border space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>SCADA RTU</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In sync
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>VFD Uplink</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile & Sign Out Footer (Reference Image 3) */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              AS
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                Dr. A. Sharma
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Chief Petroleum Eng.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              document.cookie = "thermotwin_demo=; path=/; max-age=0";
              window.location.href = "/login";
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("12:45 PM");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Reference Image 3: Search, Clock, Help, Theme, Profile) */}
        <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Search */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Baghewala Field</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold text-foreground">
                {pathname.includes("/wells")
                  ? "Well Digital Twin"
                  : pathname.includes("/css-planner")
                  ? "CSS Steam Planner"
                  : pathname.includes("/alerts")
                  ? "Failure Early Warnings"
                  : pathname.includes("/compare")
                  ? "Baseline vs Viscora Comparison"
                  : "Field Overview"}
              </span>
            </div>
          </div>

          {/* Right Header items (Clock, Alerts, Theme, Avatar) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock / Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-semibold text-foreground">{timeStr}</span>
              <span className="text-muted-foreground">• RTU Stream Active</span>
            </div>

            {/* Notification Bell */}
            <Link
              href="/dashboard/alerts"
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="3 Alerts pending"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </Link>

            {/* Theme Toggle (Light / Dark Mode) */}
            <ThemeToggle />

            {/* Quick Demo Pill */}
            <Badge className="synthetic-badge hidden sm:inline-flex">
              Demo Twin
            </Badge>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
