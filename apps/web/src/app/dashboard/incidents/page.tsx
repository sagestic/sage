"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@sage/ui";
import {
  CreateIncidentSchema,
  type CreateIncidentInput,
} from "@sage/site-schema";
import {
  sageRepo,
  type IncidentItem,
  type OrderItem,
  type RiderItem,
} from "../../../lib/data/sage-repo";

export default function IncidentsPage() {
  const orgId = "org_apex_logistics";
  const [incidents, setIncidents] = React.useState<IncidentItem[]>([]);
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [riders, setRiders] = React.useState<RiderItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [createIncidentOpen, setCreateIncidentOpen] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setIncidents(sageRepo.getIncidents(orgId));
    setOrders(sageRepo.getOrders(orgId));
    setRiders(sageRepo.getRiders(orgId));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const incidentForm = useForm<CreateIncidentInput>({
    resolver: zodResolver(CreateIncidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "MEDIUM",
      category: "TRAFFIC_DELAY",
      orderId: "",
      riderProfileId: "",
    },
  });

  const onCreateIncident = (data: CreateIncidentInput) => {
    sageRepo.createIncident(orgId, data);
    setCreateIncidentOpen(false);
    incidentForm.reset();
    setNotice("Incident logged into operations dispatch queue.");
    loadData();
    setTimeout(() => setNotice(null), 4000);
  };

  const handleResolve = (id: string) => {
    sageRepo.resolveIncident(orgId, id);
    setNotice("Incident marked resolved.");
    loadData();
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredIncidents = incidents.filter((i) => {
    if (statusFilter === "ALL") return true;
    return i.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Operational Incidents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time anomaly detection, driver breakdown reports, and automated mitigation queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/recommendations">
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary">
              <Sparkles className="h-4 w-4" />
              AI Recovery Plans
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setCreateIncidentOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-border pb-3">
        {[
          { id: "ALL", label: `All (${incidents.length})` },
          {
            id: "OPEN",
            label: `Open (${incidents.filter((i) => i.status === "OPEN").length})`,
          },
          {
            id: "INVESTIGATING",
            label: `Investigating (${incidents.filter((i) => i.status === "INVESTIGATING").length})`,
          },
          {
            id: "RESOLVED",
            label: `Resolved (${incidents.filter((i) => i.status === "RESOLVED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
              statusFilter === tab.id
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground shadow-xs">
            No incidents found for this filter.
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className={`shadow-xs transition-colors ${
                incident.severity === "CRITICAL"
                  ? "border-red-500/40 bg-red-500/5"
                  : incident.severity === "HIGH"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold shrink-0 ${
                        incident.severity === "CRITICAL"
                          ? "bg-red-600"
                          : incident.severity === "HIGH"
                            ? "bg-amber-600"
                            : "bg-slate-700"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {incident.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Category: <span className="font-semibold">{incident.category}</span> • Reported{" "}
                        {new Date(incident.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {incident.aiDetected && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono border-primary/20 bg-primary/10 text-primary flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Telemetry ({Math.round((incident.aiConfidence || 0.9) * 100)}%)
                      </Badge>
                    )}
                    <Badge
                      variant={
                        incident.severity === "CRITICAL"
                          ? "destructive"
                          : incident.severity === "HIGH"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px] uppercase font-bold py-0.5"
                    >
                      {incident.severity}
                    </Badge>
                    <Badge
                      variant={incident.status === "RESOLVED" ? "default" : "outline"}
                      className="text-[10px] uppercase font-semibold py-0.5"
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {incident.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-border/60 text-muted-foreground">
                  {incident.orderNumber && (
                    <div>
                      <span className="font-semibold text-foreground">Affected Order:</span>{" "}
                      <span className="font-mono text-primary font-bold">
                        {incident.orderNumber}
                      </span>
                    </div>
                  )}
                  {incident.riderName && (
                    <div>
                      <span className="font-semibold text-foreground">Courier:</span>{" "}
                      <span className="font-medium text-foreground">
                        {incident.riderName}
                      </span>
                    </div>
                  )}
                  {incident.resolvedAt && (
                    <div>
                      <span className="font-semibold text-foreground">Resolved:</span>{" "}
                      <span>{new Date(incident.resolvedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="px-6 pb-4 pt-0 flex items-center justify-between">
                <Link href="/dashboard/recommendations">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-primary/30 text-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Review AI Action Plan
                  </Button>
                </Link>

                {incident.status !== "RESOLVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-emerald-600 border-emerald-300 dark:border-emerald-800"
                    onClick={() => handleResolve(incident.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Report Incident */}
      <Dialog open={createIncidentOpen} onOpenChange={setCreateIncidentOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={incidentForm.handleSubmit(onCreateIncident)}>
            <DialogHeader>
              <DialogTitle>Report Operational Incident</DialogTitle>
              <DialogDescription>
                Flag an active delivery impediment to initiate recovery and rerouting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <Label htmlFor="incTitle">Incident Summary</Label>
                <Input
                  id="incTitle"
                  placeholder="e.g. Courier Flat Tire / Delay"
                  className="mt-1"
                  {...incidentForm.register("title")}
                />
                {incidentForm.formState.errors.title && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {incidentForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="incSeverity">Severity</Label>
                  <Select
                    id="incSeverity"
                    className="mt-1"
                    {...incidentForm.register("severity")}
                  >
                    <option value="LOW">Low (Minor note)</option>
                    <option value="MEDIUM">Medium (Delayed 10-15m)</option>
                    <option value="HIGH">High (Delayed 20m+)</option>
                    <option value="CRITICAL">Critical (Run stalled)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="incCategory">Category</Label>
                  <Select
                    id="incCategory"
                    className="mt-1"
                    {...incidentForm.register("category")}
                  >
                    <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                    <option value="TRAFFIC_DELAY">Traffic Gridlock</option>
                    <option value="CUSTOMER_UNAVAILABLE">Customer Absent</option>
                    <option value="ADDRESS_NOT_FOUND">Address Not Found</option>
                    <option value="WEATHER_ALERT">Severe Weather</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="incOrder">Related Order</Label>
                <Select
                  id="incOrder"
                  className="mt-1"
                  {...incidentForm.register("orderId")}
                >
                  <option value="">None / Fleet-wide</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customerName}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="incRider">Involved Courier</Label>
                <Select
                  id="incRider"
                  className="mt-1"
                  {...incidentForm.register("riderProfileId")}
                >
                  <option value="">None / Unassigned</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.vehicleType})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="incDesc">Detailed Observation</Label>
                <Textarea
                  id="incDesc"
                  placeholder="Describe location, road conditions, and courier status..."
                  className="mt-1 h-20"
                  {...incidentForm.register("description")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateIncidentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Flag Incident
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
