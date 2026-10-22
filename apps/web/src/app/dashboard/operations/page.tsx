"use client";

import * as React from "react";
import Link from "next/link";
import {
  Battery,
  CheckCircle2,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
} from "@sage/ui";
import { OperationsMap } from "../../../components/maps/operations-map";
import {
  sageRepo,
  type IncidentItem,
  type OrderItem,
  type RiderItem,
} from "../../../lib/data/sage-repo";

export default function LiveOperationsPage() {
  const orgId = "org_apex_logistics";
  const [riders, setRiders] = React.useState<RiderItem[]>([]);
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [incidents, setIncidents] = React.useState<IncidentItem[]>([]);
  const [selectedRider, setSelectedRider] = React.useState<RiderItem | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderItem | null>(null);
  const [reassignRiderId, setReassignRiderId] = React.useState<string>("");
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    const r = sageRepo.getRiders(orgId);
    const o = sageRepo.getOrders(orgId);
    const inc = sageRepo.getIncidents(orgId);
    setRiders(r);
    setOrders(o);
    setIncidents(inc);

    // Default selection
    if (!selectedRider && r.length > 0) setSelectedRider(r[0]);
    if (!selectedOrder && o.length > 0) setSelectedOrder(o[0]);
  }, [orgId, selectedRider, selectedOrder]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualAssign = () => {
    if (!selectedOrder || !reassignRiderId) return;
    sageRepo.reassignRider(
      orgId,
      selectedOrder.id,
      reassignRiderId,
      "Dispatcher manual reassignment / corridor coordination",
    );
    const rider = riders.find((r) => r.id === reassignRiderId);
    setActionNotice(
      `Reassigned ${selectedOrder.orderNumber} to ${rider?.name || "courier"}. Live itinerary updated.`,
    );
    loadData();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAutoDispatch = () => {
    const res = sageRepo.autoDispatchPendingOrders(orgId);
    if (res.assignedCount === 0) {
      setActionNotice("No pending orders or no available couriers with capacity.");
    } else {
      const kmSaved = res.matches.reduce((sum, m) => sum + (m.kmSaved || 0), 0);
      const consolidatedCount = res.matches.filter(
        (m) => m.type !== "INDEPENDENT_DISPATCH",
      ).length;
      setActionNotice(
        `Autonomous Dispatch: Assigned ${res.assignedCount} orders across fleet. ${consolidatedCount} consolidated on coinciding corridors, saving ~${kmSaved.toFixed(1)} km!`,
      );
    }
    loadData();
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Live Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Live Operations Command
            </h1>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Telemetry Active</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time geospatial radar, fleet telemetry, and manual dispatch interventions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleAutoDispatch}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 fill-white" /> Auto-Dispatch Fleet
          </Button>
          <Link href="/dashboard/recommendations">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Run AI Optimizer
            </Button>
          </Link>
          <Link href="/rider">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              Open Rider View
            </Button>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Big Interactive Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <OperationsMap
            riders={riders}
            orders={orders}
            incidents={incidents}
            selectedRiderId={selectedRider?.id}
            selectedOrderId={selectedOrder?.id}
            onSelectRider={(r) => setSelectedRider(r)}
            onSelectOrder={(o) => setSelectedOrder(o)}
            height="620px"
          />

          {/* Quick Fleet Carousel below map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {riders.slice(0, 4).map((rider) => (
              <button
                key={rider.id}
                type="button"
                onClick={() => setSelectedRider(rider)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRider?.id === rider.id
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge
                    variant={
                      rider.status === "AVAILABLE"
                        ? "default"
                        : rider.status === "BUSY"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-[9px] py-0 uppercase"
                  >
                    {rider.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Battery className="h-3 w-3 text-emerald-500" />
                    {rider.batteryLevel}%
                  </span>
                </div>
                <div className="font-semibold text-xs text-foreground truncate">
                  {rider.name}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {rider.vehicleType} • {rider.activeOrderCount} drops
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Dispatch Control Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Order Inspector */}
          {selectedOrder && (
            <Card className="shadow-xs border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedOrder.orderNumber}
                  </Badge>
                  <Badge
                    variant={
                      selectedOrder.status === "DELIVERED"
                        ? "default"
                        : selectedOrder.status === "IN_TRANSIT"
                          ? "secondary"
                          : selectedOrder.status === "FAILED"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-1">
                  {selectedOrder.customerName}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedOrder.customerPhone} • Priority: {selectedOrder.priority}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs pt-0">
                <div className="space-y-1 rounded-lg border border-border/70 p-2.5 bg-muted/20">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Pickup Location
                  </div>
                  <div className="font-medium text-foreground line-clamp-1">
                    {selectedOrder.pickupAddress}
                  </div>
                </div>

                <div className="space-y-1 rounded-lg border border-border/70 p-2.5 bg-muted/20">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Dropoff Destination
                  </div>
                  <div className="font-medium text-foreground line-clamp-1">
                    {selectedOrder.deliveryAddress}
                  </div>
                </div>

                <div className="flex justify-between py-1 text-xs border-b border-border/60">
                  <span className="text-muted-foreground">Assigned Courier:</span>
                  <span className="font-semibold text-foreground">
                    {selectedOrder.assignedRiderName || "None (Unassigned)"}
                  </span>
                </div>

                {selectedOrder.consolidationType === "DIRECT_CONSOLIDATION" && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>⚡ Coinciding Corridor Consolidation</span>
                      {selectedOrder.estimatedKmSaved && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px]">
                          Saved {selectedOrder.estimatedKmSaved} km
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-1 text-muted-foreground leading-relaxed">
                      {selectedOrder.consolidationNotes}
                    </div>
                  </div>
                )}

                {selectedOrder.consolidationType === "INTERCEPTION_RELAY" && (
                  <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 text-xs text-sky-700 dark:text-sky-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>🔄 Interception Relay Active</span>
                      {selectedOrder.estimatedKmSaved && (
                        <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[10px]">
                          Saved {selectedOrder.estimatedKmSaved} km
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-1 text-muted-foreground leading-relaxed">
                      {selectedOrder.consolidationNotes}
                    </div>
                  </div>
                )}

                {/* Dispatch Intervention */}
                <div className="pt-2 space-y-2">
                  <label className="text-[11px] font-semibold text-foreground">
                    Assign / Reassign Rider:
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={reassignRiderId}
                      onChange={(e) => setReassignRiderId(e.target.value)}
                      className="text-xs h-9"
                    >
                      <option value="">Choose available courier...</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.vehicleType} • {r.status})
                        </option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      onClick={handleManualAssign}
                      disabled={!reassignRiderId}
                      className="text-xs h-9 shrink-0"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Rider Telemetry */}
          {selectedRider && (
            <Card className="shadow-xs border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar name={selectedRider.name} className="h-10 w-10 text-sm font-bold" />
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {selectedRider.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedRider.vehicleType} • {selectedRider.phone}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 text-xs pt-0">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Battery Level
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      {selectedRider.batteryLevel}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Today Drops
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {selectedRider.completedTodayCount}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Current Status</span>
                  <Badge
                    variant={selectedRider.status === "AVAILABLE" ? "default" : "secondary"}
                    className="text-[10px] py-0 uppercase"
                  >
                    {selectedRider.status}
                  </Badge>
                </div>

                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">GPS Location</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {selectedRider.currentLatitude.toFixed(4)}, {selectedRider.currentLongitude.toFixed(4)}
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <a href={`tel:${selectedRider.phone}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                      <Phone className="h-3.5 w-3.5" /> Call Rider
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      sageRepo.updateRiderStatus(
                        orgId,
                        selectedRider.id,
                        selectedRider.status === "AVAILABLE" ? "ON_BREAK" : "AVAILABLE",
                      );
                      loadData();
                    }}
                  >
                    Toggle Break
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
