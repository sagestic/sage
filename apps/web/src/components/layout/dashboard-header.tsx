"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Avatar, Badge, Button, Input } from "@sage/ui";
import type { Role } from "@sage/site-schema";
import type { IncidentItem } from "../../lib/data/sage-repo";
import type { TenantUser } from "../../lib/tenant/types";

interface DashboardHeaderProps {
  currentUser: TenantUser;
  incidents: IncidentItem[];
}

export function DashboardHeader({
  currentUser,
  incidents,
}: DashboardHeaderProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const openIncidents = incidents.filter((i) => i.status !== "RESOLVED");

  const switchRole = (newRole: Role) => {
    document.cookie = `sage_user_role=${newRole}; path=/; max-age=2592000`;
    window.location.reload();
  };

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-md">
      {/* Search and Quick Filters */}
      <div className="flex items-center space-x-4 max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, riders, incidents, addresses..."
            className="pl-9 h-9 bg-background text-xs border-border/80 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Real-time Status Pill */}
        <div className="hidden md:flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Dispatch Synced</span>
        </div>

        {/* Refresh Sync Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={handleManualSync}
          title="Refresh Operations Data"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`}
          />
        </Button>

        {/* Notifications & Incident Drawer */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-4 w-4" />
            {openIncidents.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <span className="text-xs font-bold text-foreground">
                  Operational Alerts
                </span>
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                  {openIncidents.length} Active
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {openIncidents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    All operations running smoothly. No active alerts.
                  </div>
                ) : (
                  openIncidents.map((incident) => (
                    <Link
                      key={incident.id}
                      href="/dashboard/incidents"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="truncate text-foreground">
                          {incident.title}
                        </span>
                        <Badge
                          variant="destructive"
                          className="text-[9px] uppercase px-1 py-0"
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                    </Link>
                  ))
                )}
              </div>

              <div className="border-t border-border pt-2 mt-2 text-center">
                <Link
                  href="/dashboard/incidents"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View All Incidents →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Role Simulator Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize font-semibold text-foreground">
              {currentUser.role.replace("_", " ").toLowerCase()}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-50 animate-in fade-in-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                Simulate User Role (RBAC)
              </div>
              {[
                {
                  role: "ORG_ADMIN" as Role,
                  label: "Org Administrator",
                  desc: "Full access, credentials, settings",
                },
                {
                  role: "DISPATCHER" as Role,
                  label: "Dispatcher / Ops Manager",
                  desc: "Assign orders, fleet control, incidents",
                },
                {
                  role: "RIDER" as Role,
                  label: "Field Courier / Rider",
                  desc: "Assigned orders, status reporting",
                },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => switchRole(item.role)}
                  className={`flex w-full flex-col items-start rounded-lg p-2 text-left transition-colors ${
                    currentUser.role === item.role
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                    {currentUser.role === item.role && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-border">
          <Avatar name={currentUser.name} className="h-8 w-8 text-xs font-bold" />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold leading-none text-foreground">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {currentUser.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
