import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@sage/ui";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm">
              S
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                sage
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 text-primary border-primary/30">
                Logistics Control Centre
              </Badge>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#integrations" className="hover:text-foreground transition-colors">
              Integrations
            </a>
            <Link href="/rider" className="hover:text-foreground transition-colors flex items-center gap-1 text-emerald-600 font-semibold">
              <Smartphone className="h-3.5 w-3.5" /> Rider PWA
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs shadow-sm">
                Open Control Centre
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multi-Tenant Operations Control Plane</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            The Logistics Operations Control Centre That{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Complements
            </span>{" "}
            Your Existing Stack.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Connect to existing logistics businesses, receive delivery orders from Shopify, WooCommerce, or custom APIs, centralise operational visibility, coordinate riders, and mitigate delays with algorithmic intelligence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-sm px-6 gap-2 shadow-md">
                Launch Live Control Centre <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/rider">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" /> Open Rider PWA Mode
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-6">
                Instant Demo Logins
              </Button>
            </Link>
          </div>

          {/* Operational Metrics Ticker */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="text-2xl font-black text-foreground">14,200+</div>
              <div className="text-xs text-muted-foreground mt-0.5">Orders Orquestrated</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="text-2xl font-black text-emerald-600">98.4%</div>
              <div className="text-xs text-muted-foreground mt-0.5">On-Time SLA Delivery</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="text-2xl font-black text-primary">5+ Channels</div>
              <div className="text-xs text-muted-foreground mt-0.5">Native Adapters (Shopify, Woo)</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="text-2xl font-black text-foreground">100% Isolated</div>
              <div className="text-xs text-muted-foreground mt-0.5">Row-Level Multi-Tenancy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle Section */}
      <section className="py-20 bg-muted/20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              The Sage Principle
            </h2>
            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
              Don&apos;t Replace Your Software. Orchestrate It.
            </p>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Logistics companies shouldn&apos;t be forced to abandon their existing storefronts, ERPs, or customer portals. Sage connects to what you already have, aggregating orders into a unified operational command centre without disruption.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-xs bg-card">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 font-bold mb-2">
                  <X className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  The Old Way: Total Replacement
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Rip-and-replace legacy migrations take months and cost hundreds of thousands.</p>
                <p>Merchants, dispatchers, and riders must be retrained on an entirely new ecosystem.</p>
                <p>API lock-in prevents connecting newer regional couriers and specialized brokers.</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs bg-card border-primary/40 md:scale-105 shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  The Sage Way: Over-The-Top Control
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Keep your existing Shopify stores, WooCommerce sites, and enterprise ERPs.</p>
                <p>Orders flow into Sage in milliseconds via webhooks and REST polling.</p>
                <p>Dispatchers monitor one unified radar and coordinate all field couriers simultaneously.</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs bg-card">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  Continuous Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>AI identifies vehicle breakdowns and traffic anomalies before customers notice.</p>
                <p>Beam-search road matrix algorithms recommend immediate courier reassignments.</p>
                <p>Mandatory human review ensures dispatchers always maintain final operational control.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Capabilities */}
      <section id="capabilities" className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Capabilities
            </h2>
            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
              Everything Needed to Run Modern Fleet Logistics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Multi-Source Order Ingestion
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive delivery orders from Shopify, WooCommerce, Onfleet, CSV files, and custom REST API endpoints in a unified queue.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Live Operations Radar
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Geospatial fleet radar with Google Maps Platform integration, route polylines, vehicle filtering, and live battery telemetry.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Rider Progressive Web App (PWA)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Installable mobile web application for drivers. Features shift status toggles, turn-by-turn navigation, and one-tap handover signoffs.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Road-Aware Beam Search Optimizer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bounded beam-search algorithms evaluate real road network travel matrices to minimize SLA breaches and balance driver capacity.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Automated Incident Intelligence
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gemini inference parses courier messages and speed drops to flag breakdowns, road closures, and customer address discrepancies.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 bg-card space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Strict Multi-Tenant Isolation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every record is scoped server-side by organization identity. Granular role-based access control enforces least-privilege for admins, dispatchers, and riders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Sage Works */}
      <section id="how-it-works" className="py-20 bg-muted/20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Workflow
            </h2>
            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
              Three Steps to Operational Clarity
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">
                Connect Existing Channels
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plug in your Shopify store, WooCommerce webhook, or custom logistics API. Orders immediately stream into the centralized queue without altering merchant setups.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">
                Centralise Dispatch & Fleet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dispatchers visualize all couriers on a live geospatial radar, monitor delivery ETAs, and manually or automatically assign drops based on vehicle capacity.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">
                Execute & Adapt With AI
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Riders execute deliveries on their mobile PWA. If traffic or mechanical stalls occur, Sage proposes recovery reassignments for human dispatcher signoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section id="integrations" className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Integration Ecosystem
            </h2>
            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
              Connects to Your Tools in Minutes
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Shopify Storefront",
                badge: "Native Webhook",
                desc: "Live order ingestion, fulfillment status writeback, customer tracking.",
              },
              {
                name: "WooCommerce B2B",
                badge: "REST API",
                desc: "Automated polling, wholesale order routing, package size sync.",
              },
              {
                name: "Onfleet Fleet Sync",
                badge: "Fleet Bridge",
                desc: "Bi-directional courier status, route synchronization, dropoff telemetry.",
              },
              {
                name: "ShipStation",
                badge: "Label Adapter",
                desc: "Tracking updates, label generation, multi-carrier parcel handoffs.",
              },
            ].map((integ) => (
              <div
                key={integ.name}
                className="rounded-xl border border-border p-5 bg-card space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {integ.badge}
                  </Badge>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-sm text-foreground mt-2">
                  {integ.name}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {integ.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Ready to Take Control of Your Logistics Fleet?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Experience Sage right now in demo mode or onboard your logistics organization with isolated data partitions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-sm px-8 shadow-md">
                Launch Control Centre
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-8">
                Register New Organization
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
              S
            </div>
            <span className="font-bold text-sm text-foreground">sage</span>
            <span>• Logistics Operations Control Centre</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/integrations" className="hover:text-foreground">
              Integrations
            </Link>
            <Link href="/rider" className="hover:text-foreground">
              Rider PWA
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign In
            </Link>
          </div>

          <div>
            Strict Multi-Tenant Server Isolation • PostgreSQL & Prisma 7
          </div>
        </div>
      </footer>
    </div>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
