"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Compass,
  Copy,
  CreditCard,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@sage/ui";
import { sageRepo, type OrderItem } from "../../lib/data/sage-repo";

export default function GeneralTrackingPortalPage() {
  const [query, setQuery] = React.useState("");
  const [searchedId, setSearchedId] = React.useState<string | null>(null);
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
  const [hasSearched, setHasSearched] = React.useState(false);
  const [copiedEmbed, setCopiedEmbed] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    setSearchedId(query.trim());
    const res = sageRepo.getPublicTrackingOrder(query.trim());
    setData(res || null);
  };

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
      if (searchedId) {
        const updated = sageRepo.getPublicTrackingOrder(searchedId);
        setData(updated || null);
      }
      setIsPaying(false);
    }, 1200);
  };

  const embedCode = `<iframe
  src="https://sage-ops.com/track/${data?.order?.orderNumber || "ORD-9421"}"
  width="100%"
  height="540"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid #334155;"
  title="Sage Live Delivery Tracking"
></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-8 antialiased selection:bg-primary/20">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-md">
              S
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">
                SAGE TRACKING PORTAL
              </div>
              <div className="text-[11px] text-slate-400">
                Logistics Operations & Real-Time Tracking
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono"
            >
              Live Telemetry
            </Badge>
          </div>
        </div>

        {/* Search Hero Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              Track Your Delivery
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-400">
              Enter your tracking reference number (e.g. <span className="text-slate-200 font-mono font-medium">ORD-9421</span>, <span className="text-slate-200 font-mono font-medium">ORD-9422</span>) or phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. ORD-9421 or SG-102"
                  className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-11 text-sm font-mono"
                />
              </div>
              <Button type="submit" className="h-11 px-5 font-bold gap-1.5 shadow-md">
                <span>Track</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Previews */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-400">
              <span>Try Demo:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("ORD-9421");
                  const res = sageRepo.getPublicTrackingOrder("ORD-9421");
                  setSearchedId("ORD-9421");
                  setData(res || null);
                  setHasSearched(true);
                }}
                className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-cyan-400 hover:border-cyan-500/50"
              >
                ORD-9421 (In Transit • Unpaid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("ORD-9422");
                  const res = sageRepo.getPublicTrackingOrder("ORD-9422");
                  setSearchedId("ORD-9422");
                  setData(res || null);
                  setHasSearched(true);
                }}
                className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-emerald-400 hover:border-emerald-500/50"
              >
                ORD-9422 (Paystack Verified)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results View */}
        {hasSearched && data && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl space-y-4 p-4 sm:p-6 animate-in fade-in-50">
            {/* Top Status & Order Title */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  Shipment Tracking
                </div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {data.order.orderNumber}
                </div>
              </div>
              <Badge
                className={`font-bold text-xs ${
                  data.order.status === "IN_TRANSIT"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    : data.order.status === "DELIVERED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {data.order.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Courier & Telemetry */}
            {data.courier && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">
                    {data.courier.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {data.courier.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{data.courier.vehicleType}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">
                        {data.courier.batteryLevel}% Battery
                      </span>
                    </div>
                  </div>
                </div>

                <a href={`tel:${data.courier.phone}`}>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Courier
                  </Button>
                </a>
              </div>
            )}

            {/* Paystack Payment Status Card */}
            {data.order.paymentStatus === "PAID" ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-300">
                      Payment Confirmed (Paystack Verified)
                    </div>
                    <div className="text-[11px] text-emerald-400/80 mt-0.5">
                      ₦{(data.order.paymentAmount || 4500).toLocaleString()} • Ref: {data.order.paystackReference || "Direct"}
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
                    ₦{(data.order.paymentAmount || 4500).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  This delivery requires prepayment. You can pay securely now with Paystack:
                </p>
                <Button
                  size="sm"
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md"
                  onClick={handlePayWithPaystack}
                  disabled={isPaying}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {isPaying ? "Verifying with Paystack..." : `Pay ₦${(data.order.paymentAmount || 4500).toLocaleString()} via Paystack`}
                </Button>
              </div>
            )}

            {/* Addresses */}
            <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-xs">
              <div className="relative space-y-0.5">
                <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-slate-500" />
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  Pickup Location
                </div>
                <div className="text-slate-300 font-medium">
                  {data.order.pickupAddress}
                </div>
              </div>

              <div className="relative space-y-0.5 pt-2">
                <span className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400 animate-ping" />
                <span className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />
                <div className="text-[10px] uppercase font-semibold text-cyan-400">
                  Delivery Destination
                </div>
                <div className="text-white font-bold">
                  {data.order.deliveryAddress}
                </div>
              </div>
            </div>
          </Card>
        )}

        {hasSearched && !data && (
          <Card className="border-slate-800 bg-slate-900/60 text-center p-8 space-y-3">
            <Compass className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="font-bold text-white text-sm">
              No Delivery Found for &quot;{searchedId}&quot;
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please ensure your order number or phone number is correct.
            </p>
          </Card>
        )}

        {/* Website Embed Code Section for Operators & Merchants */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm font-bold text-white">
                  Embeddable Storefront Tracking Widget
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyEmbed}
                className="h-7 text-xs gap-1 border-slate-700 text-slate-300 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedEmbed ? "Copied!" : "Copy Embed Code"}
              </Button>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Logistics operators and e-commerce stores can embed this live tracking experience directly into Shopify, WooCommerce, or custom storefronts:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
              {embedCode}
            </pre>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>End-to-End Encrypted Telemetry • Sage Logistics Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
