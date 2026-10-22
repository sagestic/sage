"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Layers,
  Package,
  Radio,
  Settings,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge, Button } from "@sage/ui";
import { DEFAULT_TENANTS } from "../../lib/tenant/types";

interface DashboardSidebarProps {
  currentTenantSlug: string;
  openIncidentsCount: number;
  pendingRecsCount: number;
}

export function DashboardSidebar({
  currentTenantSlug,
  openIncidentsCount,
  pendingRecsCount,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [tenantDropdownOpen, setTenantDropdownOpen] = React.useState(false);

  const currentTenant =
    DEFAULT_TENANTS.find((t) => t.slug === currentTenantSlug) ||
    DEFAULT_TENANTS[0];

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: Activity,
      exact: true,
    },
    {
      title: "Live Operations",
      href: "/dashboard/operations",
      icon: Radio,
      badge: "LIVE",
      badgeVariant: "destructive" as const,
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: Package,
    },
    {
      title: "Riders & Fleet",
      href: "/dashboard/riders",
      icon: Users,
    },
    {
      title: "Integrations Hub",
      href: "/dashboard/integrations",
      icon: Layers,
      badge: "5 Active",
    },
    {
      title: "Incidents",
      href: "/dashboard/incidents",
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : undefined,
      badgeVariant: "destructive" as const,
    },
    {
      title: "AI Recommendations",
      href: "/dashboard/recommendations",
      icon: Sparkles,
      badge: pendingRecsCount > 0 ? `${pendingRecsCount}` : undefined,
      badgeVariant: "secondary" as const,
    },
    {
      title: "Settings & Access",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const switchTenant = (slug: string) => {
    document.cookie = `sage_tenant_slug=${slug}; path=/; max-age=2592000`;
    window.location.reload();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black tracking-wider text-lg shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground">
              sage
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Control Centre
            </span>
          </div>
        </Link>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
        >
          v0.2.0
        </Badge>
      </div>

      {/* Organization Switcher */}
      <div className="relative p-3 border-b border-border/70 bg-muted/30">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5 flex items-center justify-between">
          <span>Active Tenant</span>
          <span className="text-[9px] text-emerald-600 font-bold">Isolated</span>
        </div>
        <button
          type="button"
          onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-accent transition-colors shadow-xs"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-sm">{currentTenant.logo}</span>
            <span className="truncate font-semibold text-foreground">
              {currentTenant.name}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
        </button>

        {tenantDropdownOpen && (
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in-50">
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              Switch Organization
            </div>
            {DEFAULT_TENANTS.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => switchTenant(tenant.slug)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                  tenant.slug === currentTenantSlug
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tenant.logo}</span>
                  <span>{tenant.name}</span>
                </div>
                {tenant.slug === currentTenantSlug && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
          Operations
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={item.badgeVariant || (isActive ? "secondary" : "outline")}
                  className={`text-[10px] py-0 px-1.5 font-bold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                      : ""
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* PWA / Rider Mode Quick Action */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              Rider PWA Mode
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Open mobile app interface for drivers and field couriers.
          </p>
          <Link href="/rider" className="block">
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              Launch Rider PWA
            </Button>
          </Link>
        </div>

        {/* Demo Data Banner */}
        <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Tenant Sandbox Ready
          </span>
          <span className="font-mono">REST/SSE</span>
        </div>
      </div>
    </aside>
  );
}
