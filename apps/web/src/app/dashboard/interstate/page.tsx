"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Bus, CheckCircle2, Clock, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
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
} from "@sage/ui";
import {
  sageRepo,
  type CorridorEta,
  type CustodyEventItem,
  type InterstateLegItem,
  type OrderItem,
  type RiderItem,
} from "../../../lib/data/sage-repo";

interface QueueRow {
  order: OrderItem;
  linehaul?: InterstateLegItem;
  lastMile?: InterstateLegItem;
}

export default function InterstatePage() {
  const orgId = "org_apex_logistics";
  const [queue, setQueue] = React.useState<QueueRow[]>([]);
  const [riders, setRiders] = React.useState<RiderItem[]>([]);
  const [plainOrders, setPlainOrders] = React.useState<OrderItem[]>([]);
  const [corridors, setCorridors] = React.useState<CorridorEta[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [planOpen, setPlanOpen] = React.useState(false);
  const [inspect, setInspect] = React.useState<QueueRow | null>(null);
  const [timeline, setTimeline] = React.useState<CustodyEventItem[]>([]);

  const [planForm, setPlanForm] = React.useState({
    orderId: "",
    originState: "Lagos",
    destState: "FCT Abuja",
    originPark: "",
    destPark: "",
    originRiderId: "",
    destRiderId: "",
  });
  const [assignForm, setAssignForm] = React.useState({
    riderId: "",
    partnerName: "",
    partnerDepot: "",
  });

  const loadData = React.useCallback(() => {
    setQueue(sageRepo.getInterstateQueue(orgId));
    setRiders(sageRepo.getRiders(orgId));
    setPlainOrders(
      sageRepo.getOrders(orgId).filter((o) => !o.isInterstate && o.status !== "DELIVERED"),
    );
    setCorridors(sageRepo.getCorridorEtas());
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const flash = (msg: string) => {
    setNotice(msg);
    loadData();
    setTimeout(() => setNotice(null), 5000);
  };

  const handlePlan = () => {
    if (!planForm.orderId) return;
    const res = sageRepo.planInterstate(orgId, planForm.orderId, {
      originState: planForm.originState,
      destState: planForm.destState,
      originPark: planForm.originPark || undefined,
      destPark: planForm.destPark || undefined,
      originRiderId: planForm.originRiderId || undefined,
      destRiderId: planForm.destRiderId || undefined,
    });
    setPlanOpen(false);
    if (res.error && res.legs.length === 0) {
      flash(`Could not plan: ${res.error}`);
      return;
    }
    setPlanForm({
      orderId: "",
      originState: "Lagos",
      destState: "FCT Abuja",
      originPark: "",
      destPark: "",
      originRiderId: "",
      destRiderId: "",
    });
    flash(`Interstate plan created: 3 legs (first-mile, linehaul, last-mile).`);
  };

  const handleAssignRetrieval = () => {
    if (!inspect) return;
    const res = sageRepo.assignRetrieval(orgId, inspect.order.id, {
      riderProfileId: assignForm.riderId || undefined,
      partnerName: assignForm.partnerName || undefined,
      partnerDepot: assignForm.partnerDepot || undefined,
    });
    if (res.error) {
      flash(`Assignment failed: ${res.error}`);
      return;
    }
    setAssignForm({ riderId: "", partnerName: "", partnerDepot: "" });
    flash("Retrieval assigned.");
  };

  const handleFlagOverdue = () => {
    const flagged = sageRepo.flagOverdueLegs(orgId);
    flash(
      flagged.length === 0
        ? "Overdue sweep complete. No overdue linehauls."
        : `Flagged ${flagged.length} overdue linehaul(s): ${flagged.map((l) => l.orderNumber).join(", ")}`,
    );
  };

  const openInspect = (row: QueueRow) => {
    setInspect(row);
    setTimeline(sageRepo.getCustodyTimeline(orgId, row.order.id));
  };

  const overdueCount = queue.filter((q) => q.linehaul?.status === "OVERDUE").length;
  const activeCount = queue.filter((q) => q.linehaul?.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Interstate Dispatch
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Park-to-park linehaul via public buses. Drivers are unaffiliated — all proof
            comes from your riders at both ends.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleFlagOverdue} className="gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Run overdue sweep
          </Button>
          <Button size="sm" onClick={() => setPlanOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Plan interstate
          </Button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] text-muted-foreground">Interstate orders</div>
            <div className="text-2xl font-bold">{queue.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] text-muted-foreground">On the road</div>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" /> Overdue
            </div>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bus className="h-4 w-4" /> Linehaul queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Corridor</th>
                  <th className="p-3">Company / Waybill</th>
                  <th className="p-3">Linehaul</th>
                  <th className="p-3">Expected</th>
                  <th className="p-3">Retrieval</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No interstate orders yet. Plan one to get started.
                    </td>
                  </tr>
                ) : (
                  queue.map((row) => (
                    <tr key={row.order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-foreground">
                          {row.order.orderNumber}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {row.order.customerName}
                        </div>
                      </td>
                      <td className="p-3 text-[11px]">
                        {row.order.originState} → {row.order.destState}
                        <div className="text-[10px] text-muted-foreground">
                          {row.linehaul?.originPark ?? "—"} → {row.linehaul?.destPark ?? "—"}
                        </div>
                      </td>
                      <td className="p-3 text-[11px]">
                        {row.linehaul?.transportCompany ?? (
                          <span className="italic text-muted-foreground">Not dropped yet</span>
                        )}
                        {row.linehaul?.waybillNumber && (
                          <div className="font-mono text-[10px]">
                            WB {row.linehaul.waybillNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            row.linehaul?.status === "OVERDUE"
                              ? "destructive"
                              : row.linehaul?.status === "ACTIVE"
                                ? "secondary"
                                : row.linehaul?.status === "COMPLETED"
                                  ? "default"
                                  : "outline"
                          }
                          className="text-[10px] uppercase py-0"
                        >
                          {row.linehaul?.status ?? "—"}
                        </Badge>
                      </td>
                      <td className="p-3 text-[11px]">
                        {row.linehaul?.expectedArrivalAt
                          ? new Date(row.linehaul.expectedArrivalAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-3 text-[11px]">
                        {row.lastMile?.riderName ??
                          row.lastMile?.partnerName ??
                          (row.linehaul?.status === "ACTIVE" || row.linehaul?.status === "OVERDUE" ? (
                            <span className="text-amber-600 font-semibold">Unassigned</span>
                          ) : (
                            "—"
                          ))}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/track/${row.order.orderNumber}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Track
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => openInspect(row)}
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Corridor ETAs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Origin</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Road hours</th>
                  <th className="p-3">Buffer hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {corridors.map((c) => (
                  <tr key={`${c.originState}-${c.destState}`}>
                    <td className="p-3">{c.originState}</td>
                    <td className="p-3">{c.destState}</td>
                    <td className="p-3">{c.roadHours}h</td>
                    <td className="p-3">+{c.bufferHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Expected arrival = departure + road hours + buffer. Overdue sweep flags
            linehauls past this window.
          </p>
        </CardContent>
      </Card>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Plan interstate delivery</DialogTitle>
            <DialogDescription>
              Creates first-mile, linehaul, and last-mile legs for an existing order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div>
              <Label>Order</Label>
              <Select
                className="mt-1"
                value={planForm.orderId}
                onChange={(e) => setPlanForm({ ...planForm, orderId: e.target.value })}
              >
                <option value="">Select an order…</option>
                {plainOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origin state</Label>
                <Input
                  className="mt-1"
                  value={planForm.originState}
                  onChange={(e) => setPlanForm({ ...planForm, originState: e.target.value })}
                />
              </div>
              <div>
                <Label>Destination state</Label>
                <Input
                  className="mt-1"
                  value={planForm.destState}
                  onChange={(e) => setPlanForm({ ...planForm, destState: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origin park (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Jibowu Motor Park"
                  value={planForm.originPark}
                  onChange={(e) => setPlanForm({ ...planForm, originPark: e.target.value })}
                />
              </div>
              <div>
                <Label>Dest park (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Utako Motor Park"
                  value={planForm.destPark}
                  onChange={(e) => setPlanForm({ ...planForm, destPark: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origin rider (optional)</Label>
                <Select
                  className="mt-1"
                  value={planForm.originRiderId}
                  onChange={(e) => setPlanForm({ ...planForm, originRiderId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Dest rider (optional)</Label>
                <Select
                  className="mt-1"
                  value={planForm.destRiderId}
                  onChange={(e) => setPlanForm({ ...planForm, destRiderId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePlan} disabled={!planForm.orderId}>
              Create plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inspect !== null} onOpenChange={(open) => !open && setInspect(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{inspect?.order.orderNumber}</DialogTitle>
            <DialogDescription>
              {inspect?.order.originState} → {inspect?.order.destState} •{" "}
              {inspect?.order.customerName} • {inspect?.order.customerPhone}
            </DialogDescription>
          </DialogHeader>
          {inspect && (
            <div className="space-y-4 py-2 text-xs">
              {inspect.linehaul && (
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <div className="font-bold text-[11px] uppercase text-muted-foreground">
                    Linehaul detail
                  </div>
                  <div>Company: {inspect.linehaul.transportCompany ?? "—"}</div>
                  <div>
                    Vehicle: {inspect.linehaul.vehiclePlate ?? inspect.linehaul.vehicleDescription ?? "—"}
                  </div>
                  <div>Waybill: {inspect.linehaul.waybillNumber ?? "—"}</div>
                  <div>Seal: {inspect.linehaul.sealNumber ?? "—"}</div>
                  <div>
                    Fare:{" "}
                    {inspect.linehaul.fareAmountNgn
                      ? `₦${inspect.linehaul.fareAmountNgn.toLocaleString()}`
                      : "—"}
                  </div>
                  <div>
                    Departed:{" "}
                    {inspect.linehaul.departedAt
                      ? new Date(inspect.linehaul.departedAt).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    Expected:{" "}
                    {inspect.linehaul.expectedArrivalAt
                      ? new Date(inspect.linehaul.expectedArrivalAt).toLocaleString()
                      : "—"}
                  </div>
                  {inspect.linehaul.photoUrls.length > 0 && (
                    <div>Photos: {inspect.linehaul.photoUrls.join(", ")}</div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="font-bold text-[11px] uppercase text-muted-foreground">
                  Assign retrieval
                </div>
                <div>
                  <Label>Destination rider</Label>
                  <Select
                    className="mt-1"
                    value={assignForm.riderId}
                    onChange={(e) => setAssignForm({ ...assignForm, riderId: e.target.value })}
                  >
                    <option value="">Select rider…</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.status})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="text-center text-muted-foreground">— or partner depot —</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Partner name</Label>
                    <Input
                      className="mt-1"
                      placeholder="Speedaf Abuja"
                      value={assignForm.partnerName}
                      onChange={(e) => setAssignForm({ ...assignForm, partnerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Depot</Label>
                    <Input
                      className="mt-1"
                      placeholder="Garki depot"
                      value={assignForm.partnerDepot}
                      onChange={(e) => setAssignForm({ ...assignForm, partnerDepot: e.target.value })}
                    />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={handleAssignRetrieval}>
                  Assign
                </Button>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="font-bold text-[11px] uppercase text-muted-foreground">
                  Custody timeline
                </div>
                {timeline.length === 0 ? (
                  <div className="text-muted-foreground">No events yet.</div>
                ) : (
                  timeline.map((e) => (
                    <div key={e.id} className="border-l-2 border-muted pl-2 py-1">
                      <div className="font-semibold">
                        {e.eventType.replace(/_/g, " ")}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          • {new Date(e.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {e.note && <div className="text-muted-foreground">{e.note}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInspect(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
