import { ShieldCheck } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@sage/ui";
import { sageRepo } from "../../../lib/data/sage-repo";
import { DEMO_USERS, getTenantContext } from "../../../lib/tenant/context";

export default async function SettingsPage() {
  const context = await getTenantContext();
  const orgUsers = DEMO_USERS[context.organizationSlug] || [];
  const auditEvents = sageRepo.getAuditEvents(context.organizationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Tenant Settings & Governance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-tenant configuration, team role permissions, and cryptographic audit logging.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organization Profile (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Info */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Organization Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Your tenant identity across the Sage logistics ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    defaultValue={context.organizationName}
                    readOnly
                    className="mt-1 bg-muted/40"
                  />
                </div>
                <div>
                  <Label htmlFor="orgSlug">Tenant Slug</Label>
                  <Input
                    id="orgSlug"
                    defaultValue={context.organizationSlug}
                    readOnly
                    className="mt-1 font-mono bg-muted/40"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tenantId">Server Tenant ID (Immutable)</Label>
                <Input
                  id="tenantId"
                  defaultValue={context.organizationId}
                  readOnly
                  className="mt-1 font-mono text-muted-foreground bg-muted/40"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  All database records, API keys, and order events are strictly partition-scoped by this ID.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Members & Roles */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Organization Members
                </CardTitle>
                <CardDescription className="text-xs">
                  Active team members and their assigned RBAC permissions.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8">
                Invite Member
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {orgUsers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar name={member.name} className="h-9 w-9 text-xs font-bold" />
                      <div>
                        <div className="font-semibold text-foreground">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        member.role === "ORG_ADMIN"
                          ? "default"
                          : member.role === "DISPATCHER"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {member.role.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Tenant Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Immutable chronological log of administrative and dispatcher actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {auditEvents.slice(0, 6).map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start justify-between border-b border-border/50 pb-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {evt.action.replace("_", " ")}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        {evt.details}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Actor: <span className="font-medium text-foreground">{evt.actorName}</span> ({evt.actorRole})
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security Architecture & RBAC Reference */}
        <div className="space-y-6">
          <Card className="shadow-xs border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-sm font-bold">
                  Data Isolation Architecture
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground pt-0">
              <p>
                Sage utilizes a multi-tenant shared-schema architecture with row-level logical separation.
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                <li>Every database table enforces foreign key relations to <code className="font-mono">organizationId</code>.</li>
                <li>Server actions derive the tenant context from cryptographically verified session cookies.</li>
                <li>Client-provided organization IDs are never trusted as proof of authorization.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Role & Permissions Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-0">
              <div className="rounded-lg border border-border p-2.5 space-y-1 bg-muted/20">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Organization Admin</span>
                  <Badge variant="default" className="text-[9px]">ORG_ADMIN</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Full control over integrations, API credentials, billing, member invites, and system settings.
                </p>
              </div>

              <div className="rounded-lg border border-border p-2.5 space-y-1 bg-muted/20">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Dispatcher / Ops Manager</span>
                  <Badge variant="secondary" className="text-[9px]">DISPATCHER</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Manages live orders, manual couriers reassignments, incident resolution, and reviews AI recommendations.
                </p>
              </div>

              <div className="rounded-lg border border-border p-2.5 space-y-1 bg-muted/20">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Field Courier / Rider</span>
                  <Badge variant="outline" className="text-[9px]">RIDER</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Access limited to personal assigned orders, delivery status confirmation, and incident escalation in Rider PWA.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
