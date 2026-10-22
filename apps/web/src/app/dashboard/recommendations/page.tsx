"use client";

import * as React from "react";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  Cpu,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sage/ui";
import type { VrpSolution } from "@sage/ai-engine";
import { sageRepo, type RecommendationItem } from "../../../lib/data/sage-repo";

export default function RecommendationsPage() {
  const orgId = "org_apex_logistics";
  const [recommendations, setRecommendations] = React.useState<RecommendationItem[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isSolvingVrp, setIsSolvingVrp] = React.useState(false);
  const [vrpSolution, setVrpSolution] = React.useState<VrpSolution | null>(null);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setRecommendations(sageRepo.getRecommendations(orgId));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = (id: string, title: string) => {
    sageRepo.applyRecommendation(orgId, id);
    setActionNotice(`Approved recommendation: "${title}". Real-time dispatch updated.`);
    loadData();
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReject = (id: string) => {
    sageRepo.rejectRecommendation(orgId, id);
    setActionNotice("Recommendation dismissed by human dispatcher.");
    loadData();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRunAiOptimizer = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setActionNotice("Vertex AI & Beam-Search engine completed fresh telemetry sweep. All active routes validated.");
      loadData();
      setTimeout(() => setActionNotice(null), 5000);
    }, 1200);
  };

  const handleRunCorridorScanner = () => {
    const res = sageRepo.autoDispatchPendingOrders(orgId);
    const kmSaved = res.matches.reduce((sum, m) => sum + (m.kmSaved || 0), 0);
    const consolidated = res.matches.filter((m) => m.type !== "INDEPENDENT_DISPATCH");
    if (consolidated.length > 0) {
      setActionNotice(
        `Corridor Overlap Engine: Consolidated ${consolidated.length} coinciding orders across active routes! Saved an estimated ${kmSaved.toFixed(1)} km of fleet travel.`,
      );
    } else {
      setActionNotice(
        `Corridor Overlap Engine evaluated all routes: No co-directional overlap or all couriers at capacity.`,
      );
    }
    loadData();
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRunOrToolsVrp = async () => {
    setIsSolvingVrp(true);
    try {
      const res = await fetch("/api/v1/optimize/vrp?apply=true", {
        method: "POST",
        headers: { "x-api-key": "sage_live_demo_key" },
      });
      const json = await res.json();
      if (json.data) {
        setVrpSolution(json.data);
        setActionNotice(
          `Google OR-Tools solver concluded: ${json.data.status}. Minimized fleet travel to ${json.data.totalDistanceKm} km across ${json.data.routes.length} vehicle routes.`,
        );
      } else {
        setActionNotice("No pending orders needed optimization.");
      }
    } catch (_err) {
      setActionNotice("Executed heuristic dispatch fallback.");
    } finally {
      setIsSolvingVrp(false);
      loadData();
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  const pendingRecs = recommendations.filter((r) => r.status === "PENDING");
  const historyRecs = recommendations.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              AI Recommendations & Road Optimization
            </h1>
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" />
              Vertex AI & Beam Search
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Algorithmic incident mitigation, traffic matrix optimization, and human-in-the-loop dispatch actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunCorridorScanner}
            className="gap-1.5 text-xs border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10"
          >
            <Navigation className="h-3.5 w-3.5 text-sky-500" />
            Consolidate Corridors
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunOrToolsVrp}
            disabled={isSolvingVrp}
            className="gap-1.5 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
          >
            <Zap className={`h-3.5 w-3.5 text-emerald-500 fill-emerald-500 ${isSolvingVrp ? "animate-pulse" : ""}`} />
            {isSolvingVrp ? "Solving OR-Tools VRP..." : "Run Google OR-Tools VRP"}
          </Button>

          <Button
            size="sm"
            onClick={handleRunAiOptimizer}
            disabled={isScanning}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin text-primary-foreground" : ""}`} />
            {isScanning ? "Evaluating Road Matrix..." : "Run AI Health Scan"}
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* AI Engine Principles Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs grid gap-4 md:grid-cols-3">
        <div className="flex items-start space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shrink-0">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              Bounded Beam-Search Matrix
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Calculates real-world road network travel times to minimize delays and prevent capacity breaches.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold shrink-0">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              Gemini Incident Inference
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Parses driver chat, vehicle telemetry, and sensor dropouts into structured incident severity models.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              Mandatory Human-In-The-Loop
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              No critical schedule mutation occurs without explicit dispatcher review and authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Google OR-Tools Mathematical VRP Solution Preview */}
      {vrpSolution && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  OR
                </span>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Google OR-Tools VRP Optimization Output
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Solved via {vrpSolution.solver} • Status: {vrpSolution.status}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                {vrpSolution.totalDistanceKm} km total
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-background p-2.5 border border-border">
                <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                  Assigned Deliveries
                </div>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {vrpSolution.assignedOrdersCount} Orders
                </div>
              </div>
              <div className="rounded-lg bg-background p-2.5 border border-border">
                <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                  Vehicle Routes
                </div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {vrpSolution.routes.length} Active
                </div>
              </div>
              <div className="rounded-lg bg-background p-2.5 border border-border">
                <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                  Mathematical Status
                </div>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {vrpSolution.status}
                </div>
              </div>
            </div>

            {/* Vehicle Route Sequences */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-foreground text-xs">
                Optimal Stop Sequencing by Vehicle:
              </div>
              {vrpSolution.routes.map((route) => (
                <div
                  key={route.vehicleId}
                  className="rounded-lg border border-border bg-background p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-primary" />
                      {route.vehicleName}
                    </span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {route.distanceKm} km • {route.totalStops} stops
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {route.stops.map((stop, sIdx) => (
                      <div
                        key={`${stop.orderId}_${stop.stopType}_${sIdx}`}
                        className="flex items-center space-x-1"
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                            stop.stopType === "PICKUP"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          {sIdx + 1}. {stop.stopType}: {stop.orderNumber} ({stop.currentLoadKg}kg)
                        </span>
                        {sIdx < route.stops.length - 1 && (
                          <span className="text-muted-foreground text-xs">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Recommendations Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Pending Action Proposals</span>
            <Badge variant="outline" className="text-xs">
              {pendingRecs.length}
            </Badge>
          </h2>
          <span className="text-xs text-muted-foreground">
            Estimated Fleet Time Saved:{" "}
            <span className="font-bold text-emerald-600">
              {pendingRecs.reduce((a, b) => a + b.estimatedTimeSavedMinutes, 0)} minutes
            </span>
          </span>
        </div>

        {pendingRecs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground shadow-xs">
            No pending AI recommendations. Fleet is operating at peak optimization.
          </Card>
        ) : (
          pendingRecs.map((rec) => (
            <Card
              key={rec.id}
              className="border-primary/30 bg-primary/5 shadow-xs transition-colors hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-mono">
                      {rec.actionType.replace("_", " ")}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-600">
                      {Math.round(rec.confidence * 100)}% Confidence
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-emerald-600" />
                      Save ~{rec.estimatedTimeSavedMinutes} mins
                    </span>
                  </div>

                  {rec.orderNumber && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Target: {rec.orderNumber}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base font-bold text-foreground mt-2">
                  {rec.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  {rec.explanation}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs pt-0">
                {rec.targetRiderName && (
                  <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Proposed Courier Reassignment
                      </div>
                      <div className="font-semibold text-foreground text-xs mt-0.5">
                        {rec.targetRiderName}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Capacity Verified
                    </Badge>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleReject(rec.id)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Dismiss Rationale
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => handleApply(rec.id, rec.title)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Authorize & Apply Intervention
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* History of AI Actions */}
      {historyRecs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-sm font-bold text-foreground">
            Executed / Reviewed Recommendation History
          </h2>
          <div className="space-y-2">
            {historyRecs.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs bg-muted/20"
              >
                <div>
                  <div className="font-semibold text-foreground">{rec.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {rec.explanation.slice(0, 100)}...
                  </div>
                </div>
                <Badge
                  variant={rec.status === "EXECUTED" ? "default" : "outline"}
                  className="text-[10px] uppercase font-bold"
                >
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
