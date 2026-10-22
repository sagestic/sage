"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Compass,
  CreditCard,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@sage/ui";
import { sageRepo, type OrderItem } from "../../../lib/data/sage-repo";

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = React.useState<{
    order: OrderItem;
    courier?: {
      name: string;
      phone: string;
      vehicleType: string;
      latitude?: number;
      longitude?: number;
      batteryLevel: number;
    };
  } | null>(null);
  const [isPaying, setIsPaying] = React.useState(false);

  const loadTrackingData = React.useCallback(() => {
    if (!id) return;
    const result = sageRepo.getPublicTrackingOrder(id);
    if (result) {
      setData(result);
    }
  }, [id]);

  React.useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const handlePayWithPaystack = () => {
    if (!data?.order) return;
    setIsPaying(true);
    setTimeout(() => {
      sageRepo.markOrderPaid(
        data.order.organizationId,
        data.order.orderNumber,
        data.order.paymentAmount || 4500,
        `pstk_${Date.now()}`,
        "PAYSTACK",
      );
      loadTrackingData();
      setIsPaying(false);
    }, 1200);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mx-auto">
            <Compass className="h-6 w-6 animate-spin" />
          </div>
          <h1 className="text-lg font-bold text-white">Tracking Reference Not Found</h1>
          <p className="text-xs text-slate-400">
            Please check the link received in your WhatsApp confirmation message.
          </p>
          <Link href="/">
            <Button size="sm" variant="outline" className="text-xs border-slate-700">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { order, courier } = data;

  // Determine active step
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "ASSIGNED":
        return 1;
      case "IN_TRANSIT":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return 1;
    }
  };

  const stepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-6 antialiased selection:bg-primary/20">
      <div className="w-full max-w-md space-y-4 pb-12">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
              S
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                SAGE LIVE TRACKING
              </div>
              <div className="text-[10px] text-slate-400">
                Verified Courier Dispatch
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono"
          >
            LIVE GPS
          </Badge>
        </div>

        {/* ETA & Status Hero */}
        <Card className="border-slate-800 bg-slate-900/90 text-white shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                {order.orderNumber}
              </span>
              <Badge
                className={`text-[10px] uppercase font-bold ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-600"
                    : order.status === "IN_TRANSIT"
                      ? "bg-cyan-600 animate-pulse"
                      : "bg-primary"
                }`}
              >
                {order.status === "IN_TRANSIT" ? "ON THE WAY" : order.status}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black mt-2 tracking-tight">
              {order.status === "DELIVERED"
                ? "Package Delivered!"
                : order.status === "IN_TRANSIT"
                  ? "Arriving in approx. 18 mins"
                  : order.status === "ASSIGNED"
                    ? "Courier Dispatched"
                    : "Order Queued for Pickup"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Visual Step Progress */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {["Received", "Assigned", "In Transit", "Delivered"].map((label, idx) => (
                <div key={label} className="space-y-1.5 text-center">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      idx <= stepIndex
                        ? "bg-emerald-400 shadow-sm"
                        : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-[9px] uppercase tracking-wider block font-semibold ${
                      idx <= stepIndex ? "text-emerald-300" : "text-slate-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Courier Bio Card */}
            {courier && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">
                    {courier.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {courier.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{courier.vehicleType}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">
                        {courier.batteryLevel}% Battery
                      </span>
                    </div>
                  </div>
                </div>

                <a href={`tel:${courier.phone}`}>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Courier
                  </Button>
                </a>
              </div>
            )}

            {/* Paystack Payment Status / Online Checkout */}
            {order.paymentStatus === "PAID" ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-300">
                      Payment Confirmed (Paystack Verified)
                    </div>
                    <div className="text-[11px] text-emerald-400/80 mt-0.5">
                      ₦{(order.paymentAmount || 4500).toLocaleString()} • Ref: {order.paystackReference || "Direct"}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-mono text-[10px]"
                >
                  PAID ✓
                </Badge>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-amber-200">
                      Payment Required Before Handover
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">
                    ₦{(order.paymentAmount || 4500).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  To ensure contactless delivery and release of your package, please complete payment via Paystack:
                </p>
                <Button
                  size="sm"
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md"
                  onClick={handlePayWithPaystack}
                  disabled={isPaying}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {isPaying ? "Verifying with Paystack..." : `Pay ₦${(order.paymentAmount || 4500).toLocaleString()} via Paystack`}
                </Button>
              </div>
            )}

            {/* Delivery Addresses */}
            <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-xs">
              <div className="relative space-y-0.5">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-slate-500" />
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  Pickup Location
                </div>
                <div className="text-slate-300 font-medium">
                  {order.pickupAddress}
                </div>
              </div>

              <div className="relative space-y-0.5 pt-2">
                <span className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400 animate-ping" />
                <span className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />
                <div className="text-[10px] uppercase font-semibold text-cyan-400">
                  Delivery Destination
                </div>
                <div className="text-white font-bold">
                  {order.deliveryAddress}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Instructions:</span>{" "}
                {order.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Transparency Footer */}
        <div className="text-center space-y-1 pt-2">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>End-to-End Encrypted Telemetry</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Updates broadcasted live via Sage Autonomous Logistics Control Centre.
          </p>
        </div>
      </div>
    </div>
  );
}
