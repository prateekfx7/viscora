"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Flame,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateDemoData } from "@/lib/sim/generator";
import type { Alert, AlertSeverity } from "@/types";

const severityConfig: Record<
  AlertSeverity,
  { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: XCircle },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
  info: { color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", icon: Bell },
};

function AlertCard({
  alert,
  onAcknowledge,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${
        alert.acknowledged ? "opacity-50" : ""
      } transition-all hover:opacity-100`}
    >
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className={`text-[9px] uppercase ${config.color} border-current/30`}
          >
            {alert.severity}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px] text-muted-foreground border-border/50"
          >
            {alert.type.replace("_", " ")}
          </Badge>
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
            {new Date(alert.ts).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {alert.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Well: {alert.well_id}
        </p>
      </div>

      {!alert.acknowledged && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAcknowledge(alert.id)}
          className="text-xs text-muted-foreground hover:text-emerald-400 flex-shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const demoData = useMemo(() => generateDemoData(), []);
  const [alerts, setAlerts] = useState<Alert[]>(demoData.alerts);
  const [filter, setFilter] = useState<string>("all");

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (filter === "critical") result = result.filter((a) => a.severity === "critical");
    if (filter === "warning") result = result.filter((a) => a.severity === "warning");
    if (filter === "unacked") result = result.filter((a) => !a.acknowledged);
    return result.sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
    );
  }, [alerts, filter]);

  const critCount = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;
  const warnCount = alerts.filter((a) => a.severity === "warning" && !a.acknowledged).length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Alerts & Failure Risk
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time monitoring of rod floating, pump-off, high viscosity, and fatigue risks
          </p>
        </div>
        <Badge className="synthetic-badge">Synthetic</Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="clean-card rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{critCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Critical
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{warnCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Warnings
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {alerts.filter((a) => a.acknowledged).length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Acknowledged
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {demoData.failures.length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Failures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="clean-card rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Alert Feed
              <Badge variant="outline" className="text-[10px] ml-1 text-muted-foreground">
                {filteredAlerts.length}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={filter} onValueChange={(val) => setFilter(val || "all")}>
                <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all" className="text-xs">All Alerts</SelectItem>
                  <SelectItem value="critical" className="text-xs">Critical Only</SelectItem>
                  <SelectItem value="warning" className="text-xs">Warnings Only</SelectItem>
                  <SelectItem value="unacked" className="text-xs">Unacknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                />
              ))}
              {filteredAlerts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No alerts match the current filter.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
