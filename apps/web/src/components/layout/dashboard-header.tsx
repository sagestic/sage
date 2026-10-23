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
import { Avatar, Button, Input } from "@sage/ui";
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="flex items-center space-x-4 max-w-md w-full">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search orders, riders..."
            className="pl-9 h-9 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm border-zinc-200/60 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        {/* Real-time Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Live</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={handleManualSync}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-4 w-4" />
            {openIncidents.length > 0 && (
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500 border border-white dark:border-zinc-950" />
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-lg z-50">
              <div className="px-2 py-1.5 mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Alerts
                </span>
                {openIncidents.length > 0 && (
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {openIncidents.length} New
                  </span>
                )}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {openIncidents.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No active alerts.
                  </div>
                ) : (
                  openIncidents.map((incident) => (
                    <Link
                      key={incident.id}
                      href="/dashboard/incidents"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {incident.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {incident.description}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Simulator Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-2 rounded-full border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
            <span className="capitalize font-semibold text-zinc-900 dark:text-zinc-100">
              {currentUser.role.replace("_", " ").toLowerCase()}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg z-50">
              <div className="px-2 py-1.5 text-xs font-medium text-zinc-500">
                Simulate Role
              </div>
              {[
                { role: "ORG_ADMIN" as Role, label: "Admin" },
                { role: "DISPATCHER" as Role, label: "Dispatcher" },
                { role: "RIDER" as Role, label: "Rider" },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => switchRole(item.role)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-left transition-colors ${
                    currentUser.role === item.role
                      ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span>{item.label}</span>
                  {currentUser.role === item.role && (
                    <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">
              {currentUser.name}
            </span>
          </div>
          <Avatar name={currentUser.name} className="h-8 w-8 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" />
        </div>
      </div>
    </header>
  );
}