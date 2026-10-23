"use client";

import * as React from "react";
import Link from "next/link";
import {
  
  ArrowLeft,
  Battery,
  CheckCircle2,
  Clock,
  
  CreditCard,
  ListOrdered,
  
  Navigation,
  Package,
  Phone,
  Send,
  
  User,
  Zap,
} from "lucide-react";
import {
  
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
import InterstateTasks from "./interstate-tasks";

export default function RiderPwaPage() {
  const orgId = "org_apex_logistics";
  const [activeTab, setActiveTab] = React.useState<"active" | "deliveries" | "interstate" | "profile">("active");
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
    const current = riders.find((r) => r.name.includes("Marcus")) || riders[0];
    setRider(current);

    const orders = sageRepo.getOrders(orgId);
    const riderJobs = orders.filter(
      (o) => o.assignedRiderId === current?.id,
    );
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-4 pb-28 font-sans antialiased">
      {/* Mobile viewport constraint container */}
      <div className="w-full max-w-md space-y-5">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              RIDER APP
            </span>
          </div>
          <div className="h-8 w-8" /> {/* Spacer */}
        </div>

        {/* Courier Cash Float Bar (COD Wallet) */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div>
            <div className="text-xs text-zinc-500 font-medium">Cash Float (COD)</div>
            <div className="font-mono text-xl font-semibold tracking-tight text-zinc-100 mt-1">
              ₦{(rider?.cashFloatBalance || 0).toLocaleString()}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {toastMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: ACTIVE DELIVERY DETAILS & NAVIGATION */}
        {/* ============================================================== */}
        {activeTab === "active" && (
          <div className="space-y-4 animate-in fade-in">
            {activeOrder ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-1 shadow-sm">
                <div className="bg-zinc-950 rounded-2xl p-5 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Current Task</div>
                      <div className="font-mono text-lg font-medium text-zinc-100">
                        {activeOrder.orderNumber}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-900 text-xs font-medium text-zinc-300">
                        <Clock className="h-3 w-3 mr-1.5 text-zinc-500" />
                        18m ETA
                      </span>
                      {activeOrder.priority === "RUSH" && (
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">High Priority</span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Stop Sequence */}
                  {assignedOrders.length > 1 && (
                    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3">
                      <div className="text-xs font-medium text-zinc-500 flex justify-between items-center">
                        <span>Route Sequence</span>
                        <span className="text-emerald-500 font-mono text-[10px]">Optimized</span>
                      </div>
                      <div className="space-y-2">
                        {assignedOrders.map((ord, idx) => (
                          <div
                            key={ord.id}
                            onClick={() => setActiveOrder(ord)}
                            className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                              activeOrder.id === ord.id
                                ? "bg-zinc-800 text-zinc-100"
                                : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-950 text-[10px] font-medium mr-3 shrink-0">
                              {idx + 1}
                            </div>
                            <span className="text-sm truncate pr-2 flex-1">{ord.deliveryAddress}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consolidations & Relays */}
                  {activeOrder.consolidationType === "DIRECT_CONSOLIDATION" && (
                    <div className="rounded-2xl bg-indigo-500/10 p-4 border border-indigo-500/20">
                      <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm mb-2">
                        <Zap className="h-4 w-4" />
                        Corridor Consolidation
                      </div>
                      <p className="text-xs text-indigo-300/80 leading-relaxed">
                        Delivering alongside order {activeOrder.consolidatedWithOrderId} to the same sector.
                      </p>
                    </div>
                  )}

                  {activeOrder.consolidationType === "INTERCEPTION_RELAY" && (
                    <div className="rounded-2xl bg-cyan-500/10 p-4 border border-cyan-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm">
                        <Navigation className="h-4 w-4" />
                        Interception Relay
                      </div>
                      <p className="text-xs text-cyan-300/80 leading-relaxed">
                        Meet {activeOrder.handoverFromRiderName} at {activeOrder.rendezvousPoint?.name} to receive parcel.
                      </p>
                      {activeOrder.handoverFromRiderId && (
                        <Button
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0 h-10 text-sm"
                          onClick={handleConfirmHandover}
                        >
                          Confirm Receipt
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Recipient info */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Customer</div>
                      <div className="font-medium text-sm text-zinc-100">
                        {activeOrder.customerName}
                      </div>
                    </div>
                    <a href={`tel:${activeOrder.customerPhone}`}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                    </a>
                  </div>

                  {/* Payment */}
                  {activeOrder.paymentStatus === "PAID" ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-emerald-400">Payment Verified</div>
                        <div className="text-xs text-emerald-500/80 mt-0.5">Clear to release package</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-amber-500 font-medium text-sm">
                          <CreditCard className="h-4 w-4" />
                          Collect Cash
                        </div>
                        <div className="font-mono text-lg font-semibold text-amber-400">
                          ₦{(activeOrder.paymentAmount || 4500).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-xs text-amber-500/80">Do not release without payment.</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-10 text-xs border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                          onClick={() => {
                            window.open(`https://wa.me/${activeOrder.customerPhone.replace(/\D/g, "")}`, "_blank");
                          }}
                        >
                          <Send className="h-3.5 w-3.5 mr-2" /> Paystack
                        </Button>
                        <Button
                          className="flex-1 h-10 text-xs bg-amber-600 hover:bg-amber-500 text-white border-0"
                          onClick={() => {
                            sageRepo.recordCodCollection(
                              orgId,
                              activeOrder.id,
                              activeOrder.paymentAmount || 4500,
                              rider?.id,
                            );
                            setToastMessage("Cash collected!");
                            loadData();
                          }}
                        >
                          Confirm Cash
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Stops */}
                  <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                    <div className="relative">
                      <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-500 ring-4 ring-zinc-950" />
                      <div className="text-xs font-medium text-zinc-500 mb-1">Pickup</div>
                      <div className="text-sm font-medium text-zinc-300 leading-snug">{activeOrder.pickupAddress}</div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-zinc-950 animate-pulse" />
                      <div className="text-xs font-medium text-cyan-500 mb-1">Destination</div>
                      <div className="text-sm font-medium text-zinc-100 leading-snug">{activeOrder.deliveryAddress}</div>
                    </div>
                  </div>

                  {activeOrder.notes && (
                    <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-sm text-zinc-400 leading-relaxed">
                      <span className="font-medium text-zinc-300">Notes:</span> {activeOrder.notes}
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeOrder.deliveryAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full h-12 rounded-xl text-sm border-zinc-800 hover:bg-zinc-800/50 text-zinc-300 font-medium">
                      <Navigation className="h-4 w-4 mr-2 text-zinc-400" />
                      Open Navigation
                    </Button>
                  </a>

                  <Button
                    className="w-full h-14 rounded-xl text-base font-medium shadow-xl shadow-white/5 bg-white text-zinc-950 hover:bg-zinc-200"
                    onClick={handleStepAdvance}
                  >
                    {stepState === "OFFERED" && "Start Pickup"}
                    {stepState === "PICKED_UP" && "Complete Delivery"}
                    {stepState === "DELIVERED" && "Finish Task"}
                  </Button>

                  <button
                    className="w-full py-3 text-sm text-rose-500 font-medium text-center hover:text-rose-400 transition-colors"
                    onClick={() => setIncidentModalOpen(true)}
                  >
                    Report Issue to Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center rounded-3xl border border-zinc-800 bg-zinc-900/50 mt-10">
                <div className="h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
                  <Package className="h-8 w-8 text-zinc-500" />
                </div>
                <div className="font-medium text-lg text-zinc-100">Standby Mode</div>
                <p className="text-sm text-zinc-500 max-w-[250px]">
                  You will be automatically assigned new deliveries when they become available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY DELIVERIES */}
        {/* ============================================================== */}
        {activeTab === "deliveries" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-medium text-zinc-100 px-2">Assigned ({assignedOrders.length})</h2>
            <div className="space-y-3">
              {assignedOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setActiveOrder(ord);
                    setActiveTab("active");
                  }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-sm font-medium text-zinc-100">{ord.orderNumber}</span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{ord.status.replace("_", " ")}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-zinc-300">{ord.customerName}</div>
                    <div className="text-zinc-500 truncate">{ord.deliveryAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INTERSTATE */}
        {/* ============================================================== */}
        {activeTab === "interstate" && rider && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-medium text-zinc-100 px-2">Park Tasks</h2>
            <InterstateTasks
              orgId={orgId}
              riderId={rider.id}
              onDone={(msg) => {
                setToastMessage(msg);
                loadData();
                setTimeout(() => setToastMessage(null), 4000);
              }}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PROFILE */}
        {/* ============================================================== */}
        {activeTab === "profile" && rider && (
          <div className="space-y-5 animate-in fade-in">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 font-semibold text-2xl mb-4">
                {rider.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-xl font-medium text-zinc-100">{rider.name}</div>
              <div className="text-sm text-zinc-500 mt-1">{rider.vehicleType} • {rider.employeeId}</div>
            </div>

            <div className="space-y-3 px-2">
              <div className="text-sm font-medium text-zinc-400">Shift Status</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange("AVAILABLE")}
                  className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                    rider.status === "AVAILABLE" ? "bg-white text-zinc-900" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange("ON_BREAK")}
                  className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                    rider.status === "ON_BREAK" ? "bg-amber-500 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Break
                </button>
                <button
                  onClick={() => handleStatusChange("OFFLINE")}
                  className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                    rider.status === "OFFLINE" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="text-xs text-zinc-500 mb-2">Completed</div>
                <div className="text-2xl font-medium text-zinc-100">{rider.completedTodayCount}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="text-xs text-zinc-500 mb-2">Device</div>
                <div className="text-2xl font-medium text-emerald-400 flex items-center gap-1.5">
                  <Battery className="h-5 w-5" /> {rider.batteryLevel}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
          {[
            { id: "active", icon: Navigation, label: "Job" },
            { id: "deliveries", icon: ListOrdered, label: "List" },
            { id: "interstate", icon: Package, label: "Tasks" },
            { id: "profile", icon: User, label: "Profile" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "active" | "deliveries" | "interstate" | "profile")}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-colors ${
                activeTab === tab.id ? "text-zinc-100" : "text-zinc-600"
              }`}
            >
              <div className={`p-1.5 rounded-full mb-1 ${activeTab === tab.id ? "bg-zinc-900" : ""}`}>
                <tab.icon className="h-6 w-6" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal: Report Incident */}
      <Dialog open={incidentModalOpen} onOpenChange={setIncidentModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 p-6 rounded-3xl">
          <form onSubmit={handleReportIncident} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">Report Issue</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Notify dispatch immediately of delays.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Issue Type</Label>
                <Select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                  className="w-full bg-zinc-950 border-zinc-800 text-sm h-12 rounded-xl"
                >
                  <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                  <option value="TRAFFIC_DELAY">Heavy Traffic / Roadblock</option>
                  <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable</option>
                  <option value="ADDRESS_NOT_FOUND">Cannot Find Address</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Details</Label>
                <Textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Provide brief context..."
                  className="w-full bg-zinc-950 border-zinc-800 text-sm min-h-[100px] rounded-xl resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIncidentModalOpen(false)}
                className="flex-1 h-12 rounded-xl border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border-0">
                Send Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}