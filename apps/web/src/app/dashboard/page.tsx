import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
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
} from "@sage/ui";
import { OperationsMap } from "../../components/maps/operations-map";
import { sageRepo } from "../../lib/data/sage-repo";
import { getTenantContext } from "../../lib/tenant/context";

export default async function DashboardOverviewPage() {
  const context = await getTenantContext();
  const orgId = context.organizationId;

  const metrics = sageRepo.getDashboardMetrics(orgId);
  const riders = sageRepo.getRiders(orgId);
  const orders = sageRepo.getOrders(orgId);
  const incidents = sageRepo.getIncidents(orgId);
  const integrations = sageRepo.getIntegrations(orgId);
  const recommendations = sageRepo.getRecommendations(orgId);
  const auditEvents = sageRepo.getAuditEvents(orgId).slice(0, 5);

  const criticalIncident = incidents.find((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED");

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Operations Control Centre
            </h1>
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
              {context.organizationName}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time fleet coordination, multi-source order tracking, and automated recovery.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link href="/dashboard/recommendations">
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Recommendations ({recommendations.filter((r) => r.status === "PENDING").length})
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Incident Banner if active */}
      {criticalIncident && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-red-950 dark:text-red-200">
                  Critical Incident: {criticalIncident.title}
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0">
                  Action Required
                </Badge>
              </div>
              <p className="text-xs text-red-900/80 dark:text-red-300/90 mt-0.5">
                {criticalIncident.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <Link href="/dashboard/recommendations">
              <Button size="sm" variant="destructive" className="text-xs">
                Review AI Solution (Save 24m)
              </Button>
            </Link>
            <Link href="/dashboard/incidents">
              <Button size="sm" variant="outline" className="text-xs border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
                Details
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Deliveries */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Deliveries
            </CardTitle>
            <Truck className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.activeDeliveries}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +14%
              </span>
              <span>vs previous hour</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.pendingAssignments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Median dispatch wait: <span className="font-semibold text-foreground">2.4 mins</span>
            </p>
          </CardContent>
        </Card>

        {/* Delayed Deliveries */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delayed / Impacted
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {metrics.delayedDeliveries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.openIncidents} unresolved incidents flagged
            </p>
          </CardContent>
        </Card>

        {/* Available Fleet */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available Fleet
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.availableRiders}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {metrics.totalRiders} on duty
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.busyRiders} riders currently on delivery runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Section: Map Preview & Live Dispatch Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-time Map Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-foreground">
                Live Fleet Radar & Route Map
              </h2>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <Link
              href="/dashboard/operations"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Full Command Centre <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <OperationsMap
            riders={riders}
            orders={orders}
            incidents={incidents}
            height="460px"
          />
        </div>

        {/* Right Column: AI Optimization Spotlight & Integration Health */}
        <div className="space-y-6">
          {/* AI Recommendation Spotlight */}
          <Card className="border-primary/30 bg-primary/5 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gemini & Beam Search
                </Badge>
                <span className="text-xs font-semibold text-emerald-600">
                  94% Confidence
                </span>
              </div>
              <CardTitle className="text-sm font-bold mt-2 text-foreground">
                {recommendations[0]?.title || "Fleet Load Balancing"}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                {recommendations[0]?.explanation ||
                  "Algorithms identified high-priority reassignment to mitigate SLA delay."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link href="/dashboard/recommendations" className="w-full">
                <Button size="sm" className="w-full text-xs">
                  Review & Apply Action →
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Integration Health Matrix */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Integration Health
                </CardTitle>
                <CardDescription className="text-xs">
                  Connected order sources & fleet adapters
                </CardDescription>
              </div>
              <Link href="/dashboard/integrations">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  View Hub
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {integrations.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-2.5 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground font-bold text-[10px]">
                      {item.provider.slice(0, 3)}
                    </span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.orderCount} orders • Sync: {item.lastSyncStatus.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={item.status === "ACTIVE" ? "default" : "outline"}
                    className={`text-[9px] uppercase font-bold py-0 ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-600 text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Active Orders Table & Operational Audit Stream */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Overview */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Active Order Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time delivery fulfillment status across all channels
              </CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm" className="text-xs h-8">
                View All Orders ({orders.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-border text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="pb-2">Order #</th>
                    <th className="pb-2">Channel</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Destination</th>
                    <th className="pb-2">Assigned Courier</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 font-mono font-semibold text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {order.source}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-medium text-foreground">
                        {order.customerName}
                      </td>
                      <td className="py-2.5 text-muted-foreground max-w-[180px] truncate">
                        {order.deliveryAddress}
                      </td>
                      <td className="py-2.5">
                        {order.assignedRiderName ? (
                          <span className="font-medium text-foreground">
                            {order.assignedRiderName}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant={
                            order.status === "DELIVERED"
                              ? "default"
                              : order.status === "IN_TRANSIT"
                                ? "secondary"
                                : order.status === "FAILED"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-[10px] font-semibold uppercase"
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Operational Audit Stream */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Live audit events & dispatcher actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex space-x-3 text-xs">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {event.actorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-snug">
                    {event.details}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
