"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Smartphone,
} from "lucide-react";
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
} from "@sage/ui";
import {
  AcceptInvitationSchema,
  type AcceptInvitationInput,
} from "@sage/site-schema";
import { sageRepo, type RiderInvitationItem } from "../../../lib/data/sage-repo";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [invitation, setInvitation] = React.useState<RiderInvitationItem | null>(null);
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
    const inv = sageRepo.getInvitationByToken(token);
    if (!inv) {
      setErrorStatus("Invitation not found. Please contact your fleet administrator.");
    } else if (inv.status === "EXPIRED") {
      setErrorStatus("This invitation link has expired. Request a new invite from dispatch.");
    } else if (inv.status === "ACCEPTED") {
      setErrorStatus("This invitation has already been used. Please log in directly.");
    } else if (inv.status === "REVOKED") {
      setErrorStatus("This invitation was revoked by your operations manager.");
    } else {
      setInvitation(inv);
    }
  }, [token]);

  const form = useForm<AcceptInvitationInput>({
    resolver: zodResolver(AcceptInvitationSchema),
    defaultValues: {
      token: token || "",
      name: invitation?.name || "",
      password: "",
    },
    values: invitation
      ? { token, name: invitation.name, password: "" }
      : undefined,
  });

  const onSubmit = (data: AcceptInvitationInput) => {
    const result = sageRepo.acceptRiderInvitation(token, data.password);
    if (!result.success) {
      setErrorStatus(result.error || "Failed to accept invitation");
      return;
    }

    // Set authenticated session cookies for this rider
    if (invitation) {
      document.cookie = `sage_tenant_slug=apex-logistics; path=/; max-age=2592000`;
      document.cookie = `sage_user_role=RIDER; path=/; max-age=2592000`;
    }
    router.push("/rider");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 antialiased selection:bg-primary/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-md">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activate Courier Membership
          </h1>
          <p className="text-xs text-muted-foreground">
            Sage Logistics Operations • Shared Rider PWA
          </p>
        </div>

        {errorStatus ? (
          <Card className="border-red-500/30 bg-red-500/5 shadow-xs">
            <CardHeader className="text-center pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-red-700 dark:text-red-300">
                Invalid or Expired Invitation
              </CardTitle>
              <CardDescription className="text-xs text-red-600/80 dark:text-red-400">
                {errorStatus}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-2">
              <Link href="/login">
                <Button size="sm" variant="outline" className="text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : invitation ? (
          <Card className="shadow-xs">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Single-Use Token
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Expires in 72h
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-2">
                  Welcome to the Fleet, {invitation.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  Your dispatch organization has invited you as a verified courier.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs pt-0">
                <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Assigned Courier Details
                  </div>
                  <div className="font-semibold text-foreground">
                    Mobile: {invitation.phone}
                  </div>
                  <div className="text-muted-foreground">
                    Vehicle: {invitation.vehicleType} • Capacity: {invitation.capacityScore}kg
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Confirm Your Full Name</Label>
                  <Input
                    id="name"
                    className="mt-1"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Create Secret Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
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

              <CardFooter className="flex flex-col space-y-2 pt-2">
                <Button type="submit" className="w-full text-xs gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  Accept Invite & Launch Rider PWA
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  By accepting, this token will be permanently marked single-use.
                </p>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Verifying cryptographic invitation token...
          </div>
        )}
      </div>
    </div>
  );
}
