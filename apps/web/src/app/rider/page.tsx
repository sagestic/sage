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
  CreditCard,
  ListOrdered,
  MapPin,
  Navigation,
  Package,
  Phone,
  Send,
  ShieldAlert,
  User,
  Zap,
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
  const [activeTab, setActiveTab] = React.useState<"active" | "deliveries" | "profile">("active");
  const [rider, setRider] = React.useState<RiderItem | null>(null);
  const [assignedOrders, setAssignedOrders] = React.useState<OrderItem[]>([]);
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
    // Focus on Marcus Thorne (primary demo rider) or first rider
    const current = riders.find((r) => r.name.includes("Marcus")) || riders[0];
    setRider(current);

    const orders = sageRepo.getOrders(orgId);
    // Find all orders assigned to Marcus or first in-transit
    const riderJobs = orders.filter(
      (o) => o.assignedRiderId === current?.id,
    );
    // If none assigned explicitly in mock, provide top in-transit & pending orders
    const relevantJobs = riderJobs.length > 0 ? riderJobs : orders.slice(0, 3);
    setAssignedOrders(relevantJobs);

    const activeJob =
      relevantJobs.find((o) => o.status === "IN_TRANSIT" || o.status === "ASSIGNED") ||
      relevantJobs[0];
    setActiveOrder(activeJob || null);
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

  const handleConfirmHandover = () => {
    if (!rider || !activeOrder || !activeOrder.handoverFromRiderId) return;
    sageRepo.recordHandover(
      orgId,
      activeOrder.id,
      activeOrder.handoverFromRiderId,
      rider.id,
      activeOrder.rendezvousPoint?.name || "Transit Rendezvous Point",
      "Confirmed physical receipt via Rider PWA",
    );
    setToastMessage(
      `Accepted parcel handover from ${activeOrder.handoverFromRiderName || "courier"}. Heading to final recipient!`,
    );
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 pb-24 sm:p-6 font-sans antialiased">
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

        {/* ============================================================== */}
        {/* TAB 1: ACTIVE DELIVERY DETAILS & NAVIGATION */}
        {/* ============================================================== */}
        {activeTab === "active" && (
          <div className="space-y-4 animate-in fade-in-50">
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

                {/* Multi-Stop Itinerary Sequence */}
                {assignedOrders.length > 1 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Sequenced Route ({assignedOrders.length} Drops)</span>
                      <Badge variant="outline" className="text-[9px] font-mono border-slate-700 text-emerald-400">
                        OR-Tools Optimized
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {assignedOrders.map((ord, idx) => (
                        <div
                          key={ord.id}
                          onClick={() => setActiveOrder(ord)}
                          className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            activeOrder.id === ord.id
                              ? "bg-primary/20 border border-primary/40 text-white font-medium"
                              : "bg-slate-900/80 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate max-w-[200px]">
                            {idx + 1}. Drop: {ord.deliveryAddress}
                          </span>
                          <span className="font-mono text-[10px] shrink-0">
                            {ord.orderNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corridor Consolidation & Interception Highlights */}
                {activeOrder.consolidationType === "DIRECT_CONSOLIDATION" && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/70 p-3 text-xs text-emerald-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <Zap className="h-4 w-4" />
                      <span>Coinciding Corridor Consolidation</span>
                      {activeOrder.estimatedKmSaved && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-mono">
                          Saved ~{activeOrder.estimatedKmSaved} km
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 leading-relaxed">
                      You are delivering this package alongside order {activeOrder.consolidatedWithOrderId} to the same destination sector.
                    </div>
                  </div>
                )}

                {activeOrder.consolidationType === "INTERCEPTION_RELAY" && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/70 p-3 text-xs text-sky-200 space-y-2.5">
                    <div className="font-bold flex items-center justify-between text-sky-400">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="h-4 w-4" />
                        <span>Corridor Interception Relay</span>
                      </div>
                      {activeOrder.estimatedKmSaved && (
                        <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-300 font-mono">
                          Saved ~{activeOrder.estimatedKmSaved} km
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sky-200/80 leading-relaxed">
                      Rendezvous with courier <strong className="text-white">{activeOrder.handoverFromRiderName || "partner courier"}</strong> at <strong className="text-sky-300">{activeOrder.rendezvousPoint?.name || "Transit Rendezvous Point"}</strong> to receive parcel into topbox.
                    </div>
                    {activeOrder.handoverFromRiderId && (
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white font-bold gap-1.5"
                        onClick={handleConfirmHandover}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm Parcel Handover Received
                      </Button>
                    )}
                  </div>
                )}

                {/* Recipient Details & Quick Call */}
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

                {/* Delivery Payment Check & Paystack Collection */}
                {activeOrder.paymentStatus === "PAID" ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-3 text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-emerald-300">Payment Verified (Paystack)</span>
                        <div className="text-[10px] text-emerald-400/80">
                          ₦{(activeOrder.paymentAmount || 4500).toLocaleString()} • Ref: {activeOrder.paystackReference || "Verified"}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                      CLEAR TO RELEASE ✓
                    </Badge>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-amber-400" />
                        <span className="font-bold text-amber-300">Collect Payment Before Release</span>
                      </div>
                      <span className="font-bold font-mono text-white text-sm">
                        ₦{(activeOrder.paymentAmount || 4500).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-200/80">
                      Do not release package without payment verification.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 border-slate-700 text-slate-200 gap-1 hover:bg-slate-800"
                        onClick={() => {
                          const url = `https://wa.me/${activeOrder.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hello ${activeOrder.customerName}, your courier is arriving soon. Please complete payment of ₦${activeOrder.paymentAmount || 4500} via Paystack: https://checkout.paystack.com/simulate_${activeOrder.orderNumber}`,
                          )}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <Send className="h-3 w-3 text-emerald-400" /> Send Paystack via WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-8 bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                        onClick={() => {
                          sageRepo.markOrderPaid(
                            orgId,
                            activeOrder.id,
                            activeOrder.paymentAmount || 4500,
                            `cash_${Date.now()}`,
                            "CASH",
                          );
                          setToastMessage("Cash collected & verified! Package cleared for release.");
                          loadData();
                        }}
                      >
                        Confirm Cash Collected
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pickup and Drop-off Stops */}
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

                {/* External Turn-by-Turn Navigation Link */}
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
                    className="w-full text-xs h-10 gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    <Navigation className="h-4 w-4 text-cyan-400" />
                    Open Turn-by-Turn GPS (Google Maps)
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
                  You are currently on standby. New delivery orders will appear here automatically when assigned.
                </p>
              </div>
            )}

            {/* Foreground GPS Telemetry & Disclosure Bar */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  <span>GPS: 51.5074° N, 0.1278° W</span>
                </div>
                <span className="text-emerald-400 font-mono font-semibold">28 km/h</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-slate-400 shrink-0" />
                Active foreground updates only while Sage app is visible on screen.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY DELIVERIES (ORDER QUEUE) */}
        {/* ============================================================== */}
        {activeTab === "deliveries" && (
          <div className="space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-white">
                Assigned Delivery Queue ({assignedOrders.length})
              </h2>
              <span className="text-xs text-slate-400">Today</span>
            </div>

            {assignedOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  setActiveOrder(ord);
                  setActiveTab("active");
                }}
                className={`rounded-xl border p-4 space-y-2 cursor-pointer transition-all ${
                  activeOrder?.id === ord.id
                    ? "border-primary/60 bg-slate-900 shadow-md"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {ord.orderNumber}
                    </span>
                    <Badge
                      variant={ord.status === "DELIVERED" ? "outline" : "default"}
                      className="text-[9px] uppercase font-bold py-0"
                    >
                      {ord.status}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono border-slate-700 text-slate-300"
                  >
                    {ord.priority}
                  </Badge>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-300 font-semibold truncate">
                    {ord.customerName} • {ord.customerPhone}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>{ord.deliveryAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Created: {new Date(ord.createdAt).toLocaleTimeString()}</span>
                  <span className="text-primary font-medium">Tap for Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROFILE & AVAILABILITY */}
        {/* ============================================================== */}
        {activeTab === "profile" && rider && (
          <div className="space-y-4 animate-in fade-in-50">
            {/* Courier Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-md">
                  {rider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-base text-white">
                    {rider.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{rider.vehicleType}</span>
                    <span>•</span>
                    <span>{rider.employeeId || "Courier #901"}</span>
                  </div>
                </div>
              </div>

              {/* Shift Mode Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <Label className="text-xs text-slate-400">Shift Availability Mode</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("AVAILABLE")}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
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
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
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
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                      rider.status === "OFFLINE"
                        ? "bg-slate-700 text-white shadow-sm"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    End Shift
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry & Device Health */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Courier Performance & Device
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Completed Today</div>
                  <div className="text-lg font-black text-white mt-1">
                    {rider.completedTodayCount} Orders
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Battery Level</div>
                  <div className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1">
                    <Battery className="h-4 w-4" />
                    {rider.batteryLevel}%
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Telemetry Disclosure Notice (Section 4.C Compliance) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-xs text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-cyan-400" />
                Active Foreground GPS Policy
              </div>
              <p className="text-[11px] leading-relaxed">
                Sage Rider operates with user privacy and battery life preservation. Location telemetry is transmitted exclusively while the application is active in the foreground of your mobile browser. Background location tracking is not supported or promised.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors ${
              activeTab === "active"
                ? "bg-primary text-primary-foreground font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Navigation className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Active Job</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deliveries")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors relative ${
              activeTab === "deliveries"
                ? "bg-primary text-primary-foreground font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ListOrdered className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">My Deliveries</span>
            {assignedOrders.length > 0 && (
              <span className="absolute top-1.5 right-6 h-2 w-2 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Profile & Shift</span>
          </button>
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
