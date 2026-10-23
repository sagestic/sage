"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import {
  RegisterOrganizationSchema,
  type RegisterOrganizationInput,
} from "@sage/site-schema";
import { Building2, ShieldCheck, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterOrganizationInput>({
    resolver: zodResolver(RegisterOrganizationSchema),
    defaultValues: {
      organizationName: "",
      organizationSlug: "",
      adminName: "",
      adminEmail: "",
      password: "",
      fleetSize: "1-10",
      primaryIntegration: "SHOPIFY",
    },
  });

  const onSubmit = (data: RegisterOrganizationInput) => {
    // Set tenant cookie
    document.cookie = `sage_tenant_slug=${data.organizationSlug}; path=/; max-age=2592000`;
    document.cookie = `sage_user_role=ORG_ADMIN; path=/; max-age=2592000`;
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Brand & Value Props */}
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
              Onboard Your Organization
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-sm leading-relaxed">
              Instantly provision a partitioned multi-tenant operational environment for your logistics fleet.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start space-x-4">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg shrink-0">
                <Building2 className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Isolated Tenants</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your data is securely partitioned in our multi-tenant architecture.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg shrink-0">
                <Zap className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Real-time Operations</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Instant sync between dispatchers, riders, and your primary order source.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Enterprise Ready</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Role-based access control and scalable infrastructure from day one.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="p-6 lg:p-10">
          <Card className="shadow-lg border-zinc-200/60 dark:border-zinc-800">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Register Tenant
                </CardTitle>
                <CardDescription className="text-base text-zinc-500">
                  Setup your organization and administrator account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="orgName"
                      placeholder="e.g. SwiftCourier UK"
                      className="h-11"
                      {...form.register("organizationName", {
                        onChange: (e) => {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-");
                          form.setValue("organizationSlug", slug);
                        },
                      })}
                    />
                    {form.formState.errors.organizationName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.organizationName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgSlug" className="text-sm font-medium">Tenant Slug</Label>
                    <Input
                      id="orgSlug"
                      placeholder="swiftcourier-uk"
                      className="h-11 font-mono text-sm bg-zinc-50 dark:bg-zinc-900/50"
                      {...form.register("organizationSlug")}
                    />
                    {form.formState.errors.organizationSlug && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.organizationSlug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="adminName" className="text-sm font-medium">Admin Full Name</Label>
                    <Input
                      id="adminName"
                      placeholder="e.g. Jordan Smith"
                      className="h-11"
                      {...form.register("adminName")}
                    />
                    {form.formState.errors.adminName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.adminName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-sm font-medium">Work Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="jordan@swiftcourier.com"
                      className="h-11"
                      {...form.register("adminEmail")}
                    />
                    {form.formState.errors.adminEmail && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.adminEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Administrator Password</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fleetSize" className="text-sm font-medium">Fleet Size</Label>
                    <Select
                      id="fleetSize"
                      className="w-full h-11"
                      {...form.register("fleetSize")}
                    >
                      <option value="1-10">1 - 10 Couriers</option>
                      <option value="11-50">11 - 50 Couriers</option>
                      <option value="50+">50+ Enterprise Fleet</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryIntegration" className="text-sm font-medium">Primary Source</Label>
                    <Select
                      id="primaryIntegration"
                      className="w-full h-11"
                      {...form.register("primaryIntegration")}
                    >
                      <option value="SHOPIFY">Shopify Storefront</option>
                      <option value="WOOCOMMERCE">WooCommerce Store</option>
                      <option value="ONFLEET">Onfleet Dispatch</option>
                      <option value="CUSTOM_WEBHOOK">Custom REST Ingestion</option>
                    </Select>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button type="submit" className="w-full h-11 text-base font-medium">
                  Create Organization
                </Button>
                <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                  Already registered?{" "}
                  <Link href="/login" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
                    Sign In
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