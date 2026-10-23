"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bus,
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
import {  Button } from "@sage/ui";
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
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: Package,
    },
    {
      title: "Interstate",
      href: "/dashboard/interstate",
      icon: Bus,
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
    },
    {
      title: "Incidents",
      href: "/dashboard/incidents",
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : undefined,
    },
    {
      title: "AI Recommendations",
      href: "/dashboard/recommendations",
      icon: Sparkles,
      badge: pendingRecsCount > 0 ? `${pendingRecsCount}` : undefined,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const switchTenant = (slug: string) => {
    document.cookie = `sage_tenant_slug=${slug}; path=/; max-age=2592000`;
    window.location.reload();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm shadow-sm">
            S
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            sage
          </span>
        </Link>
      </div>

      {/* Organization Switcher */}
      <div className="relative px-3 pb-4">
        <button
          type="button"
          onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-2 text-left text-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <span className="text-base leading-none">{currentTenant.logo}</span>
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              {currentTenant.name}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 ml-1" />
        </button>

        {tenantDropdownOpen && (
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-lg">
            <div className="px-2 py-1.5 text-xs font-medium text-zinc-500">
              Switch Workspace
            </div>
            {DEFAULT_TENANTS.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => switchTenant(tenant.slug)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-left transition-colors ${
                  tenant.slug === currentTenantSlug
                    ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base leading-none">{tenant.logo}</span>
                  <span>{tenant.name}</span>
                </div>
                {tenant.slug === currentTenantSlug && (
                  <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  item.badge === "LIVE" 
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                    : "bg-zinc-200/50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* PWA / Rider Mode Quick Action */}
      <div className="p-4 mt-auto">
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <Smartphone className="h-4 w-4 text-zinc-500" />
            Rider App
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Open mobile app interface for couriers.
          </p>
          <Link href="/rider" className="block">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Launch PWA
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}