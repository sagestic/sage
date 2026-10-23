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
  

  const criticalIncident = incidents.find((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED");

  return (
    <div className="space-y-8 pb-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Overview
            </h1>
            <Badge variant="outline" className="text-[11px] font-medium bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
              {context.organizationName}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time fleet coordination and multi-source order tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/dashboard/recommendations">
            <Button variant="outline" size="sm" className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              AI Suggestions
              {recommendations.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="ml-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium">
                  {recommendations.filter((r) => r.status === "PENDING").length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button size="sm" className="h-9 gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Incident Banner if active */}
      {criticalIncident && (
        <div className="rounded-xl border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Critical Incident: {criticalIncident.title}
                </span>
              </div>
              <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                {criticalIncident.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <Link href="/dashboard/incidents">
              <Button size="sm" variant="outline" className="h-8 text-xs border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-white/50 dark:bg-zinc-950/50 hover:bg-rose-100 dark:hover:bg-rose-900">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Deliveries */}
        <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Active Deliveries
            </CardTitle>
            <Truck className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {metrics.activeDeliveries}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-500 font-medium flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" /> +14%
              </span>
              <span>from last hour</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Pending Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {metrics.pendingAssignments}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Median wait: <span className="font-medium text-zinc-700 dark:text-zinc-300">2.4m</span>
            </p>
          </CardContent>
        </Card>

        {/* Delayed Deliveries */}
        <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Impacted / Delayed
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-rose-600 dark:text-rose-500">
              {metrics.delayedDeliveries}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {metrics.openIncidents} active alerts
            </p>
          </CardContent>
        </Card>

        {/* Available Fleet */}
        <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Available Fleet
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {metrics.availableRiders}
              <span className="text-lg font-normal text-zinc-400 dark:text-zinc-600 ml-1.5">
                / {metrics.totalRiders}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {metrics.busyRiders} riders on active runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Section: Map Preview & Live Dispatch Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-time Map Preview (2 cols) */}
        <Card className="lg:col-span-2 shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CardTitle className="text-base font-medium">Live Operations Radar</CardTitle>
                <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-2 py-0.5 rounded-full text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
              <Link
                href="/dashboard/operations"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
              >
                Command Centre <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <div className="flex-1 p-0 bg-zinc-100 dark:bg-zinc-900">
            <OperationsMap
              riders={riders}
              orders={orders}
              incidents={incidents}
              height="400px"
            />
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Operating Model */}
          <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Financial Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Operating Model</div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {metrics.operatingModel === "ECOMMERCE_COD"
                    ? "E-Commerce & Cash on Delivery (COD)"
                    : metrics.operatingModel.replace("_", " ")}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Courier Cash Float</div>
                  <div className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    ₦{metrics.totalCourierCashFloat.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Pending Remittance</div>
                  <div className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    ₦{metrics.codPendingRemittance.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Health Matrix */}
          <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Integrations
              </CardTitle>
              <Link href="/dashboard/integrations" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {integrations.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium text-xs border border-zinc-200/50 dark:border-zinc-800">
                      {item.provider.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.orderCount} orders • {item.lastSyncStatus.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Active Orders Table */}
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div>
            <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/50">
              <tr>
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Channel</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Destination</th>
                <th className="py-3 px-4 font-medium">Courier</th>
                <th className="py-3 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-900 dark:text-zinc-100">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {order.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                    {order.deliveryAddress}
                  </td>
                  <td className="py-3 px-4">
                    {order.assignedRiderName ? (
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {order.assignedRiderName}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : order.status === "IN_TRANSIT"
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          : order.status === "FAILED"
                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}