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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
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
            Onboard Your Logistics Organization
          </h1>
          <p className="text-xs text-muted-foreground">
            Instantly provision a partitioned multi-tenant operational environment.
          </p>
        </div>

        <Card className="shadow-xs">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Organization & Administrator Details
              </CardTitle>
              <CardDescription className="text-xs">
                You will be granted the Organization Administrator role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="orgName">Company / Fleet Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g. SwiftCourier UK"
                    className="mt-1"
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
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {form.formState.errors.organizationName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="orgSlug">Tenant Identifier (Slug)</Label>
                  <Input
                    id="orgSlug"
                    placeholder="swiftcourier-uk"
                    className="mt-1 font-mono"
                    {...form.register("organizationSlug")}
                  />
                  {form.formState.errors.organizationSlug && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {form.formState.errors.organizationSlug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="adminName">Admin Full Name</Label>
                  <Input
                    id="adminName"
                    placeholder="e.g. Jordan Smith"
                    className="mt-1"
                    {...form.register("adminName")}
                  />
                  {form.formState.errors.adminName && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {form.formState.errors.adminName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="adminEmail">Work Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="jordan@swiftcourier.co.uk"
                    className="mt-1"
                    {...form.register("adminEmail")}
                  />
                  {form.formState.errors.adminEmail && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {form.formState.errors.adminEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Administrator Password</Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fleetSize">Current Fleet Size</Label>
                  <Select
                    id="fleetSize"
                    className="mt-1"
                    {...form.register("fleetSize")}
                  >
                    <option value="1-10">1 - 10 Couriers</option>
                    <option value="11-50">11 - 50 Couriers</option>
                    <option value="50+">50+ Enterprise Fleet</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="primaryIntegration">Primary Order Source</Label>
                  <Select
                    id="primaryIntegration"
                    className="mt-1"
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

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full text-xs">
                Launch Organization Control Centre
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
