"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@sage/ui";
import { LoginSchema, type LoginInput, type Role } from "@sage/site-schema";
import { DEFAULT_TENANTS } from "../../lib/tenant/types";

export default function LoginPage() {
  const router = useRouter();
  const [selectedTenant, setSelectedTenant] = React.useState("apex-logistics");

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "sarah.dispatch@apexlogistics.com",
      password: "password123",
      organizationSlug: "apex-logistics",
    },
  });

  const onSubmit = (_data: LoginInput) => {
    // Set tenant and role cookies
    document.cookie = `sage_tenant_slug=${selectedTenant}; path=/; max-age=2592000`;
    document.cookie = `sage_user_role=DISPATCHER; path=/; max-age=2592000`;
    router.push("/dashboard");
  };

  const handleQuickDemoLogin = (tenantSlug: string, role: Role) => {
    document.cookie = `sage_tenant_slug=${tenantSlug}; path=/; max-age=2592000`;
    document.cookie = `sage_user_role=${role}; path=/; max-age=2592000`;
    if (role === "RIDER") {
      router.push("/rider");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-md">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              sage
            </span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            Sign In to Control Centre
          </h1>
          <p className="text-xs text-muted-foreground">
            Multi-tenant logistics operations and fleet dispatch
          </p>
        </div>

        {/* Quick Demo Sign In Roles */}
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-between">
              <span>Instant 1-Click Sandbox Logins</span>
              <Badge variant="outline" className="text-[10px] bg-background">
                Demo Ready
              </Badge>
            </CardTitle>
            <CardDescription className="text-[11px]">
              Select a persona to immediately experience Sage role-based access:
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("apex-logistics", "ORG_ADMIN")}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary text-left text-xs transition-colors shadow-2xs"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Alex Vance (Apex Admin)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Full control: Integrations, API keys, billing
                </div>
              </div>
              <Badge variant="default" className="text-[9px]">ORG_ADMIN</Badge>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("apex-logistics", "DISPATCHER")}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary text-left text-xs transition-colors shadow-2xs"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Sarah Chen (Apex Dispatcher)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Operations, orders, fleet reassignments, AI review
                </div>
              </div>
              <Badge variant="secondary" className="text-[9px]">DISPATCHER</Badge>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("apex-logistics", "RIDER")}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary text-left text-xs transition-colors shadow-2xs"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Marcus Thorne (Apex Rider)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Launches Rider Progressive Web App (PWA)
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30">
                RIDER PWA
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("metro-swift", "ORG_ADMIN")}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary text-left text-xs transition-colors shadow-2xs"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Elena Rostova (MetroSwift Courier)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Isolated second tenant (separate fleet & orders)
                </div>
              </div>
              <Badge variant="outline" className="text-[9px]">TENANT 2</Badge>
            </button>
          </CardContent>
        </Card>

        {/* Regular Login Form */}
        <Card className="shadow-xs">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Account Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs pt-0">
              <div>
                <Label htmlFor="tenant">Logistics Organization</Label>
                <Select
                  id="tenant"
                  className="mt-1"
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                >
                  {DEFAULT_TENANTS.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@business.com"
                  className="mt-1"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="mt-1"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full text-xs">
                Sign In to Dashboard
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Don&apos;t have an organization registered?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register Tenant
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
