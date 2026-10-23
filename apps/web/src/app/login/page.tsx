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
import { Briefcase,  Smartphone, Users } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Brand & Demo Actions */}
        <div className="space-y-8 p-6 lg:p-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-2xl shadow-sm">
                S
              </div>
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                sage
              </span>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Operations Control Centre
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-sm leading-relaxed">
              Multi-tenant logistics operations, automated recovery, and fleet dispatch.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              1-Click Demo Environments
            </h3>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("apex-logistics", "ORG_ADMIN")}
                className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <Briefcase className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      Business Owner
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Alex Vance (Apex Admin)
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">Admin</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("apex-logistics", "DISPATCHER")}
                className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      Operations Dispatcher
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Sarah Chen (Apex Ops)
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">Dispatcher</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("apex-logistics", "RIDER")}
                className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <Smartphone className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      Field Courier (PWA)
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Marcus Thorne (Apex Rider)
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex text-emerald-600 border-emerald-200 dark:border-emerald-900">Rider App</Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Standard Login Form */}
        <div className="p-6 lg:p-10">
          <Card className="shadow-lg border-zinc-200/60 dark:border-zinc-800">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Sign in
                </CardTitle>
                <CardDescription className="text-base text-zinc-500">
                  Enter your organization credentials to access the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="tenant" className="text-sm font-medium">Logistics Organization</Label>
                  <Select
                    id="tenant"
                    className="w-full h-11"
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@business.com"
                    className="h-11"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link href="#" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className="h-11"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button type="submit" className="w-full h-11 text-base font-medium">
                  Sign In
                </Button>
                <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                  Don&apos;t have an organization registered?{" "}
                  <Link href="/register" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
                    Register Tenant
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
