"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Battery,
  CheckCircle2,
  Clock,
  Compass,
  Navigation,
  Package,
  Phone,
  Send,
} from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  Textarea,
} from "@sage/ui";
import {
  sageRepo,
  type OrderItem,
  type RiderItem,
} from "../../lib/data/sage-repo";

export default function RiderPwaPage() {
  const orgId = "org_apex_logistics";
  const [rider, setRider] = React.useState<RiderItem | null>(null);
  const [activeOrder, setActiveOrder] = React.useState<OrderItem | null>(null);
  const [stepState, setStepState] = React.useState<"OFFERED" | "PICKED_UP" | "DELIVERED">("PICKED_UP");
  const [incidentModalOpen, setIncidentModalOpen] = React.useState(false);
  const [incidentCategory, setIncidentCategory] = React.useState("TRAFFIC_DELAY");
  const [incidentDescription, setIncidentDescription] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Register service worker on mount
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Sage Rider Service Worker Registered"))
        .catch((err) => console.log("SW register error:", err));
    }
  }, []);

  const loadData = React.useCallback(() => {
    const riders = sageRepo.getRiders(orgId);
    // Find Marcus Thorne or first rider
    const current = riders.find((r) => r.name.includes("Marcus")) || riders[0];
    setRider(current);

    const orders = sageRepo.getOrders(orgId);
    // Find in-transit or assigned order
    const order =
      orders.find((o) => o.assignedRiderId === current?.id && o.status !== "DELIVERED") ||
      orders[0];
    setActiveOrder(order || null);
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = (newStatus: "AVAILABLE" | "BUSY" | "ON_BREAK" | "OFFLINE") => {
    if (!rider) return;
    sageRepo.updateRiderStatus(orgId, rider.id, newStatus);
    setToastMessage(`Status updated to ${newStatus}`);
    loadData();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStepAdvance = () => {
    if (!activeOrder) return;
    if (stepState === "OFFERED") {
      setStepState("PICKED_UP");
      sageRepo.updateOrderStatus(orgId, activeOrder.id, "IN_TRANSIT");
      setToastMessage("Package collected from depot! Heading to recipient.");
    } else if (stepState === "PICKED_UP") {
      setStepState("DELIVERED");
      sageRepo.updateOrderStatus(orgId, activeOrder.id, "DELIVERED");
      setToastMessage("Order delivered successfully! Good work.");
    }
    loadData();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider || !activeOrder) return;

    sageRepo.createIncident(orgId, {
      title: `Rider Reported: ${incidentCategory.replace("_", " ")}`,
      description: incidentDescription || "Rider reported issue via mobile PWA app.",
      severity: "HIGH",
      category: incidentCategory,
      orderId: activeOrder.id,
      riderProfileId: rider.id,
    });

    setIncidentModalOpen(false);
    setIncidentDescription("");
    setToastMessage("Incident transmitted to Operations Dispatcher. Backup notified.");
    loadData();
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-6 font-sans antialiased">
      {/* Mobile viewport constraint container */}
      <div className="w-full max-w-md space-y-4">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold tracking-tight text-white">
              SAGE RIDER PWA
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-slate-700 text-slate-300"
          >
            PWA 1.0
          </Badge>
        </div>

        {toastMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/80 p-3 text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Rider Status & Shift Card */}
        {rider && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">
                  {rider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">
                    {rider.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{rider.vehicleType}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {rider.batteryLevel}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <Badge
                  variant={
                    rider.status === "AVAILABLE"
                      ? "default"
                      : rider.status === "BUSY"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-[10px] uppercase font-bold px-2 py-0.5"
                >
                  {rider.status}
                </Badge>
              </div>
            </div>

            {/* Shift Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleStatusChange("AVAILABLE")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  rider.status === "AVAILABLE"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("ON_BREAK")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  rider.status === "ON_BREAK"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                On Break
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("OFFLINE")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  rider.status === "OFFLINE"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                End Shift
              </button>
            </div>
          </div>
        )}

        {/* Active Delivery Card */}
        {activeOrder ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary font-mono text-xs font-bold"
                >
                  {activeOrder.orderNumber}
                </Badge>
                <Badge
                  variant={activeOrder.priority === "RUSH" ? "destructive" : "secondary"}
                  className="text-[10px] uppercase font-bold"
                >
                  {activeOrder.priority}
                </Badge>
              </div>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ETA: 18m
              </span>
            </div>

            {/* Customer Details */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div>
                <div className="text-xs text-slate-400">Recipient</div>
                <div className="font-bold text-sm text-white mt-0.5">
                  {activeOrder.customerName}
                </div>
              </div>
              <a href={`tel:${activeOrder.customerPhone}`}>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-slate-700 text-slate-200">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call
                </Button>
              </a>
            </div>

            {/* Delivery Route Stops */}
            <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
              {/* Pickup */}
              <div className="relative space-y-0.5">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-slate-400" />
                <div className="text-[10px] font-semibold uppercase text-slate-400">
                  1. Pickup Depot
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {activeOrder.pickupAddress}
                </div>
              </div>

              {/* Destination */}
              <div className="relative space-y-0.5 pt-2">
                <span className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400 animate-pulse" />
                <div className="text-[10px] font-semibold uppercase text-cyan-400">
                  2. Dropoff Destination
                </div>
                <div className="text-xs font-bold text-white">
                  {activeOrder.deliveryAddress}
                </div>
              </div>
            </div>

            {activeOrder.notes && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Instructions:</span>{" "}
                {activeOrder.notes}
              </div>
            )}

            {/* External Navigation Link */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                activeOrder.deliveryAddress,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className="w-full text-xs h-9 gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <Navigation className="h-4 w-4 text-cyan-400" />
                Open GPS Navigation (Turn-by-Turn)
              </Button>
            </a>

            {/* Primary Step Action Button */}
            <Button
              className="w-full h-12 text-sm font-bold shadow-lg"
              onClick={handleStepAdvance}
            >
              {stepState === "OFFERED" && "Accept Order & Start Pickup"}
              {stepState === "PICKED_UP" && "Confirm Delivery Completed (Handover)"}
              {stepState === "DELIVERED" && "Completed • Ready for Next Job"}
            </Button>

            {/* Incident / Problem Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5"
              onClick={() => setIncidentModalOpen(true)}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Report Vehicle Issue / Delay to Dispatcher
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-3">
            <Package className="h-10 w-10 text-slate-600 mx-auto" />
            <div className="font-bold text-sm text-white">No Assigned Orders</div>
            <p className="text-xs text-slate-400">
              You are on standby. New delivery orders will appear here automatically when assigned.
            </p>
          </div>
        )}

        {/* GPS Sensor Telemetry Bar */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>GPS: 51.5074° N, 0.1278° W</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold">28 km/h</span>
        </div>
      </div>

      {/* Modal: Report Incident from Rider App */}
      <Dialog open={incidentModalOpen} onOpenChange={setIncidentModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <form onSubmit={handleReportIncident}>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Report Delivery Impediment
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Immediately flags your position to dispatchers and triggers AI re-routing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <Label htmlFor="riderIncCat" className="text-slate-300">
                  Issue Type
                </Label>
                <Select
                  id="riderIncCat"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                >
                  <option value="VEHICLE_BREAKDOWN">Mechanical / Flat Tire Breakdown</option>
                  <option value="TRAFFIC_DELAY">Heavy Road Gridlock / Police Block</option>
                  <option value="CUSTOMER_UNAVAILABLE">Recipient Not Answering Door</option>
                  <option value="ADDRESS_NOT_FOUND">Incorrect Address / Missing Unit #</option>
                  <option value="WEATHER_ALERT">Extreme Weather Hazard</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="riderIncNotes" className="text-slate-300">
                  Brief Note for Dispatch
                </Label>
                <Textarea
                  id="riderIncNotes"
                  placeholder="e.g. Engine cut out near bridge. Need breakdown recovery."
                  className="mt-1 h-20 bg-slate-950 border-slate-800 text-white"
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-800 text-slate-300"
                onClick={() => setIncidentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Send Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
