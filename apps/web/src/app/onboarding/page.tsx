"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  Check,
  Globe,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
} from "@sage/ui";
import type { VehicleType } from "@sage/site-schema";
import { sageRepo } from "../../lib/data/sage-repo";

const OPERATING_MODELS = [
  {
    id: "ECOMMERCE_COD",
    name: "E-Commerce & Cash on Delivery (COD)",
    badge: "Popular in Nigeria",
    icon: ShoppingBag,
    description:
      "For logistics fleets serving online merchants, Instagram vendors, and retail stores with physical cash or POS collection upon delivery, cash float tracking, and merchant remittances.",
    features: [
      "Separate Item Price & Delivery Fee",
      "Rider Cash Float Tracking & Remittance",
      "Paystack In-Chat Checkout Fallback",
      "Instant Merchant COD Settlement",
    ],
  },
  {
    id: "WHATSAPP_COMMERCE",
    name: "WhatsApp Social Commerce Fleet",
    badge: "High Growth",
    icon: MessageSquare,
    description:
      "For dispatch companies receiving orders via WhatsApp chat, unstructured landmark addresses, customer tracking inquiries, and automated Paystack payment links.",
    features: [
      "AI Landmark & Phone Number Extraction",
      "Automated Inbound WhatsApp Assistant",
      "Paystack Link Generation in Chat",
      "Customer Self-Service Tracking Bot",
    ],
  },
  {
    id: "ON_DEMAND_EXPRESS",
    name: "On-Demand Point-to-Point Express",
    badge: "Fast Dispatch",
    icon: Zap,
    description:
      "For rapid intra-city courier dispatches, urgent legal document errands, food/perishables, and real-time corridor consolidation.",
    features: [
      "Autonomous Nearest-Rider Auto-Dispatch",
      "Corridor Overlap & Interception Relay",
      "Google OR-Tools Route Optimization",
      "Turn-by-turn PWA Itinerary Sequence",
    ],
  },
  {
    id: "B2B_DISTRIBUTION",
    name: "B2B Scheduled Distribution & Freight",
    badge: "Enterprise",
    icon: Building2,
    description:
      "For structured corporate supply chains, wholesale daily van routes, recurring scheduled stops, bills of lading, and monthly invoicing.",
    features: [
      "Capacitated Vehicle Routing (CVRP)",
      "Daily Scheduled Multi-Stop Itineraries",
      "Shopify & WooCommerce B2B Webhooks",
      "Corporate Invoicing & Cryptographic Audits",
    ],
  },
];

export default function OnboardingWizardPage() {
  const router = useRouter();
  const orgId = "org_apex_logistics";

  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 4;

  // Form State
  const [selectedModel, setSelectedModel] = React.useState("ECOMMERCE_COD");
  const [acceptsCod, setAcceptsCod] = React.useState(true);
  const [acceptsPaystack, setAcceptsPaystack] = React.useState(true);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = React.useState("4500");
  const [city, setCity] = React.useState("Lagos");
  const [depotAddress, setDepotAddress] = React.useState("Mainland Logistics Hub, Ikeja, Lagos");

  // Ingestion channels
  const [channels, setChannels] = React.useState({
    whatsapp: true,
    trackingWidget: true,
    storefronts: true,
    restApi: true,
  });

  // First courier quick add
  const [courierName, setCourierName] = React.useState("Babatunde Lawal");
  const [courierPhone, setCourierPhone] = React.useState("+234 803 123 4567");
  const [courierVehicle, setCourierVehicle] = React.useState("MOTORCYCLE");

  const [isFinishing, setIsFinishing] = React.useState(false);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsFinishing(true);

    // Save customized operating profile in Sage
    sageRepo.saveOrganizationSettings(orgId, {
      operatingModel: selectedModel as "ECOMMERCE_COD" | "ON_DEMAND_EXPRESS" | "WHATSAPP_COMMERCE" | "B2B_DISTRIBUTION",
      defaultCity: city,
      defaultDepotAddress: depotAddress,
      defaultDeliveryFeeNgn: parseInt(defaultDeliveryFee) || 4500,
      acceptsCashOnDelivery: acceptsCod,
      acceptsOnlinePaystack: acceptsPaystack,
      activeIntakeChannels: Object.keys(channels).filter((k) => channels[k as keyof typeof channels]),
    });

    // Add first courier if provided
    if (courierName.trim()) {
      sageRepo.createRiderInvitation(orgId, {
        name: courierName.trim(),
        phone: courierPhone.trim(),
        role: "RIDER",
        vehicleType: courierVehicle as VehicleType,
        capacityScore: 90,
      });
    }

    setTimeout(() => {
      router.push("/dashboard?onboarded=true");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-8 antialiased selection:bg-primary/20">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-md">
              S
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">
                SAGE ONBOARDING WIZARD
              </div>
              <div className="text-[11px] text-slate-400">
                Tailor Operations, Payments & Intake Channels
              </div>
            </div>
          </Link>

          {/* Step Indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all ${
                    step === currentStep
                      ? "w-6 bg-primary"
                      : step < currentStep
                        ? "w-2 bg-emerald-500"
                        : "w-2 bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: OPERATING MODEL */}
        {currentStep === 1 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl space-y-4 p-5 sm:p-6 animate-in fade-in-50">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono">
                Step 1: Operational Model
              </Badge>
              <h2 className="text-xl font-bold text-white mt-1">
                How does your logistics business operate?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sage configures workflows, payment collection, and routing logic based on your specific daily reality.
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
              {OPERATING_MODELS.map((model) => {
                const IconComponent = model.icon;
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg ring-1 ring-primary/40"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-white">
                          <IconComponent className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            isSelected
                              ? "border-primary text-primary"
                              : "border-slate-800 text-slate-400"
                          }`}
                        >
                          {model.badge}
                        </Badge>
                      </div>
                      <div className="font-bold text-sm text-white">{model.name}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1">
                      {model.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-300">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* STEP 2: PAYMENTS & COD */}
        {currentStep === 2 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl space-y-5 p-5 sm:p-6 animate-in fade-in-50">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono">
                Step 2: Payments & Cash on Delivery (COD)
              </Badge>
              <h2 className="text-xl font-bold text-white mt-1">
                Configure Payment Collection & Remittance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable physical cash collection, online prepayment via Paystack, and standard delivery fees.
              </p>
            </div>

            <div className="space-y-4">
              {/* COD Option */}
              <div
                onClick={() => setAcceptsCod(!acceptsCod)}
                className={`rounded-xl border p-4 cursor-pointer transition-all flex items-center justify-between ${
                  acceptsCod
                    ? "border-emerald-500/40 bg-emerald-950/30"
                    : "border-slate-800 bg-slate-950/60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">
                      Accept Cash on Delivery (COD)
                    </span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">
                      Cash Float Active
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Couriers collect physical cash upon package handover. Sage automatically tallies rider cash floats and tracks pending merchant payouts.
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                    acceptsCod
                      ? "bg-emerald-500 border-emerald-400 text-slate-950"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {acceptsCod && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
              </div>

              {/* Paystack Option */}
              <div
                onClick={() => setAcceptsPaystack(!acceptsPaystack)}
                className={`rounded-xl border p-4 cursor-pointer transition-all flex items-center justify-between ${
                  acceptsPaystack
                    ? "border-primary/40 bg-primary/10"
                    : "border-slate-800 bg-slate-950/60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">
                      Paystack Online & WhatsApp Payment Links
                    </span>
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                      Instant Webhook Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Customers pay online via cards, bank transfer, or USSD directly from WhatsApp chat or tracking link. Clears couriers automatically.
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                    acceptsPaystack
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {acceptsPaystack && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
              </div>

              {/* Default Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="fee" className="text-xs text-slate-300">
                    Default Base Delivery Fee (₦)
                  </Label>
                  <Input
                    id="fee"
                    value={defaultDeliveryFee}
                    onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                    placeholder="4500"
                    className="mt-1 bg-slate-950 border-slate-800 text-white font-mono text-sm h-10"
                  />
                  <span className="text-[10px] text-slate-500">
                    Used for automatic fee calculation on WhatsApp bookings.
                  </span>
                </div>

                <div>
                  <Label htmlFor="city" className="text-xs text-slate-300">
                    Primary Operational City
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos"
                    className="mt-1 bg-slate-950 border-slate-800 text-white text-sm h-10"
                  />
                  <span className="text-[10px] text-slate-500">
                    Lagos, Abuja, Port Harcourt, Ibadan, London, etc.
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: DEPOT & INTAKE CHANNELS */}
        {currentStep === 3 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl space-y-5 p-5 sm:p-6 animate-in fade-in-50">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono">
                Step 3: Central Depot & Intake Channels
              </Badge>
              <h2 className="text-xl font-bold text-white mt-1">
                Where do orders come from?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your primary dispatch hub and select which order streams you want active.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="depot" className="text-xs text-slate-300">
                  Central Dispatch Depot Address
                </Label>
                <Input
                  id="depot"
                  value={depotAddress}
                  onChange={(e) => setDepotAddress(e.target.value)}
                  placeholder="Mainland Logistics Hub, Ikeja, Lagos"
                  className="mt-1 bg-slate-950 border-slate-800 text-white text-sm h-10"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {/* WhatsApp */}
                <div
                  onClick={() => setChannels((p) => ({ ...p, whatsapp: !p.whatsapp }))}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                    channels.whatsapp
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs text-white">WhatsApp Cloud API</div>
                      <div className="text-[10px] text-slate-400">Conversational booking & tracking</div>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${channels.whatsapp ? "bg-emerald-500 border-emerald-400" : "border-slate-700"}`} />
                </div>

                {/* Tracking Widget */}
                <div
                  onClick={() => setChannels((p) => ({ ...p, trackingWidget: !p.trackingWidget }))}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                    channels.trackingWidget
                      ? "border-cyan-500/40 bg-cyan-950/20"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Storefront Tracking Widget</div>
                      <div className="text-[10px] text-slate-400">Embeddable customer tracking</div>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${channels.trackingWidget ? "bg-cyan-500 border-cyan-400" : "border-slate-700"}`} />
                </div>

                {/* Storefronts */}
                <div
                  onClick={() => setChannels((p) => ({ ...p, storefronts: !p.storefronts }))}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                    channels.storefronts
                      ? "border-primary/40 bg-primary/10"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold text-xs text-white">Shopify & WooCommerce</div>
                      <div className="text-[10px] text-slate-400">Storefront e-commerce webhooks</div>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${channels.storefronts ? "bg-primary border-primary" : "border-slate-700"}`} />
                </div>

                {/* REST API */}
                <div
                  onClick={() => setChannels((p) => ({ ...p, restApi: !p.restApi }))}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                    channels.restApi
                      ? "border-amber-500/40 bg-amber-950/20"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Developer REST API v1</div>
                      <div className="text-[10px] text-slate-400">Custom app & ERP integration</div>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${channels.restApi ? "bg-amber-500 border-amber-400" : "border-slate-700"}`} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: QUICK FLEET SETUP */}
        {currentStep === 4 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl space-y-5 p-5 sm:p-6 animate-in fade-in-50">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono">
                Step 4: Add Your First Courier
              </Badge>
              <h2 className="text-xl font-bold text-white mt-1">
                Deploy Rider to the Fleet
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Couriers will receive an invite token to install the shared Sage Rider Progressive Web App (PWA).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rname" className="text-xs text-slate-300">
                  Courier Full Name
                </Label>
                <Input
                  id="rname"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Babatunde Lawal"
                  className="mt-1 bg-slate-950 border-slate-800 text-white text-sm h-10"
                />
              </div>

              <div>
                <Label htmlFor="rphone" className="text-xs text-slate-300">
                  Courier WhatsApp Phone Number
                </Label>
                <Input
                  id="rphone"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="mt-1 bg-slate-950 border-slate-800 text-white font-mono text-sm h-10"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Vehicle Type</Label>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { type: "MOTORCYCLE", label: "Motorcycle", icon: Bike },
                    { type: "VAN", label: "Delivery Van", icon: Truck },
                    { type: "BICYCLE", label: "Bicycle", icon: Bike },
                  ].map((v) => {
                    const VIcon = v.icon;
                    return (
                      <div
                        key={v.type}
                        onClick={() => setCourierVehicle(v.type)}
                        className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${
                          courierVehicle === v.type
                            ? "border-primary bg-primary/10 text-white font-bold"
                            : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        <VIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <div className="text-xs">{v.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-200 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  The courier will receive an SMS/WhatsApp invite containing a secure 1-time token to launch the Rider PWA.
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isFinishing}
              className="border-slate-800 text-slate-300 hover:text-white gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Skip Setup
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            onClick={handleNext}
            disabled={isFinishing}
            className="gap-1.5 font-bold px-6 shadow-md"
          >
            {isFinishing ? (
              <span>Launching Sage Control Centre...</span>
            ) : currentStep === totalSteps ? (
              <>
                <Sparkles className="h-4 w-4" />
                Complete & Launch Dashboard
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
