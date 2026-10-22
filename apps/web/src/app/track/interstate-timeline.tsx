"use client";

import { Bus, CheckCircle2, Flag, MapPin, PackageCheck } from "lucide-react";
import { Badge } from "@sage/ui";
import type { CustodyEventItem, InterstateLegItem } from "../../lib/data/sage-repo";

const EVENT_LABELS: Record<string, string> = {
  ORDER_CREATED: "Order received",
  INTERSTATE_PLANNED: "Interstate planned",
  PARK_DROPOFF: "At origin park",
  DEPARTED: "On the road",
  RETRIEVAL_ASSIGNED: "Destination courier assigned",
  PARK_RETRIEVED: "With destination courier",
  SEAL_BROKEN: "Seal check failed",
  OVERDUE_FLAGGED: "Delayed",
  PARTNER_RECEIVED: "At partner depot",
  DELIVERED: "Delivered",
};

export function interstateStepIndex(
  legs: InterstateLegItem[],
  delivered: boolean,
): number {
  if (delivered) return 4;
  const linehaul = legs.find((l) => l.type === "LINEHAUL_BUS");
  const lastMile = legs.find((l) => l.type === "LAST_MILE" || l.type === "PARTNER_HANDOFF");
  if (lastMile?.status === "ACTIVE" || lastMile?.status === "COMPLETED") return 3;
  if (linehaul?.status === "ACTIVE" || linehaul?.status === "OVERDUE") return 2;
  if (linehaul?.status === "COMPLETED") return 3;
  const firstMile = legs.find((l) => l.type === "FIRST_MILE");
  if (firstMile?.status === "COMPLETED") return 1;
  return 0;
}

export default function InterstateTimeline({
  legs,
  timeline,
  originState,
  destState,
}: {
  legs: InterstateLegItem[];
  timeline: CustodyEventItem[];
  originState?: string;
  destState?: string;
}) {
  const linehaul = legs.find((l) => l.type === "LINEHAUL_BUS");

  return (
    <div className="space-y-4">
      {linehaul && (linehaul.status === "ACTIVE" || linehaul.status === "OVERDUE") && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-200">
            <Bus className="h-4 w-4" />
            On the road: {linehaul.originPark} → {linehaul.destPark ?? destState}
          </div>
          <div className="text-amber-200/80">
            {linehaul.transportCompany}
            {linehaul.waybillNumber ? ` • Waybill ${linehaul.waybillNumber}` : ""}
          </div>
          <div className="text-[11px] text-amber-200/70">
            {linehaul.departedAt
              ? `Departed ${new Date(linehaul.departedAt).toLocaleString()}. `
              : ""}
            {linehaul.expectedArrivalAt
              ? `Expected ${new Date(linehaul.expectedArrivalAt).toLocaleString()}. `
              : ""}
            Our {destState ?? "destination"} team retrieves on arrival.
          </div>
          {linehaul.status === "OVERDUE" && (
            <Badge variant="destructive" className="text-[10px] uppercase">
              Delayed — dispatcher notified
            </Badge>
          )}
          <div className="text-[10px] text-amber-200/60">
            Live position isn&apos;t available while the parcel is on a public bus. This
            page updates when our team retrieves it.
          </div>
        </div>
      )}

      <div className="space-y-0 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.length === 0 && (
          <div className="text-xs text-slate-500">No custody events yet.</div>
        )}
        {timeline.map((event) => (
          <div key={event.id} className="relative pb-4 last:pb-0">
            <span className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700">
              {event.eventType === "PARK_RETRIEVED" || event.eventType === "DELIVERED" ? (
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              ) : event.eventType === "DEPARTED" ? (
                <Bus className="h-2 w-2 text-amber-400" />
              ) : event.eventType === "PARK_DROPOFF" ? (
                <MapPin className="h-2 w-2 text-cyan-400" />
              ) : event.eventType === "SEAL_BROKEN" || event.eventType === "OVERDUE_FLAGGED" ? (
                <Flag className="h-2 w-2 text-red-400" />
              ) : (
                <PackageCheck className="h-2 w-2 text-slate-400" />
              )}
            </span>
            <div className="text-xs font-bold text-white">
              {EVENT_LABELS[event.eventType] ?? event.eventType}
            </div>
            {event.note && (
              <div className="text-[11px] text-slate-400 mt-0.5">{event.note}</div>
            )}
            <div className="text-[10px] text-slate-600 mt-0.5">
              {new Date(event.createdAt).toLocaleString()}
              {event.actorName ? ` • ${event.actorName}` : ""}
            </div>
          </div>
        ))}
      </div>

      {originState && destState && (
        <div className="text-[11px] text-slate-500">
          Corridor: {originState} → {destState}
        </div>
      )}
    </div>
  );
}
