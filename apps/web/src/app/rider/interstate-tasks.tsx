"use client";

import * as React from "react";
import { Bus, CheckCircle2, MapPin, PackageSearch } from "lucide-react";
import { Badge, Button, Input, Label, Select, Textarea } from "@sage/ui";
import {
  sageRepo,
  type InterstateLegItem,
  type OrderItem,
  type ParkItem,
} from "../../lib/data/sage-repo";

interface InterstateTask {
  order: OrderItem;
  leg: InterstateLegItem;
  task: "PARK_DROPOFF" | "PARK_RETRIEVAL";
}

export default function InterstateTasks({
  orgId,
  riderId,
  onDone,
}: {
  orgId: string;
  riderId: string;
  onDone: (msg: string) => void;
}) {
  const [tasks, setTasks] = React.useState<InterstateTask[]>([]);
  const [parks, setParks] = React.useState<ParkItem[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Drop-off form state
  const [dropForm, setDropForm] = React.useState({
    originPark: "",
    destPark: "",
    transportCompany: "",
    vehiclePlate: "",
    vehicleDescription: "",
    waybillNumber: "",
    waybillPhoto: "",
    sealNumber: "",
    fareAmountNgn: "",
    parcelPhoto: "",
    driverNote: "",
  });

  // Retrieval form state
  const [retForm, setRetForm] = React.useState({
    photo: "",
    sealCheck: "INTACT" as "INTACT" | "BROKEN" | "NO_SEAL",
    note: "",
  });

  const refresh = React.useCallback(() => {
    setTasks(sageRepo.getRiderInterstateTasks(orgId, riderId));
    setParks(sageRepo.getParks(orgId));
  }, [orgId, riderId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const linehaulFor = (orderId: string) =>
    sageRepo.getLegByOrderAndType(orgId, orderId, "LINEHAUL_BUS");

  const handleDropoff = (orderId: string) => {
    setError(null);
    const photoUrls = [dropForm.parcelPhoto.trim()].filter(Boolean);
    const res = sageRepo.recordParkDropoff(orgId, orderId, riderId, {
      originPark: dropForm.originPark.trim(),
      destPark: dropForm.destPark.trim() || undefined,
      transportCompany: dropForm.transportCompany.trim(),
      vehiclePlate: dropForm.vehiclePlate.trim() || undefined,
      vehicleDescription: dropForm.vehicleDescription.trim() || undefined,
      waybillNumber: dropForm.waybillNumber.trim(),
      waybillPhotoUrl: dropForm.waybillPhoto.trim(),
      sealNumber: dropForm.sealNumber.trim() || undefined,
      fareAmountNgn: dropForm.fareAmountNgn ? Number(dropForm.fareAmountNgn) : undefined,
      photoUrls,
      driverNote: dropForm.driverNote.trim() || undefined,
    });
    if (res.error) {
      setError(res.error);
      return;
    }
    setDropForm({
      originPark: "",
      destPark: "",
      transportCompany: "",
      vehiclePlate: "",
      vehicleDescription: "",
      waybillNumber: "",
      waybillPhoto: "",
      sealNumber: "",
      fareAmountNgn: "",
      parcelPhoto: "",
      driverNote: "",
    });
    setExpanded(null);
    refresh();
    onDone(`Park drop-off recorded for ${res.leg?.orderNumber}. Linehaul is now active.`);
  };

  const handleRetrieved = (orderId: string) => {
    setError(null);
    const res = sageRepo.recordParkRetrieved(orgId, orderId, riderId, {
      photoUrls: [retForm.photo.trim()].filter(Boolean),
      sealCheck: retForm.sealCheck,
      note: retForm.note.trim() || undefined,
    });
    if (res.error) {
      setError(res.error);
      return;
    }
    setRetForm({ photo: "", sealCheck: "INTACT", note: "" });
    setExpanded(null);
    refresh();
    onDone(
      retForm.sealCheck === "BROKEN"
        ? `Retrieved ${res.leg?.orderNumber} with BROKEN seal. Incident opened; continue last-mile.`
        : `Retrieved ${res.leg?.orderNumber}. Last-mile is now active.`,
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center space-y-2">
        <Bus className="h-8 w-8 text-slate-600 mx-auto" />
        <div className="font-bold text-sm text-white">No interstate tasks</div>
        <p className="text-xs text-slate-400">
          Park drop-offs and retrievals assigned to you will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {tasks.map(({ order, leg, task }) => {
        const linehaul = linehaulFor(order.id);
        const isOpen = expanded === leg.id;
        return (
          <div key={leg.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task === "PARK_DROPOFF" ? (
                  <Bus className="h-4 w-4 text-amber-400" />
                ) : (
                  <PackageSearch className="h-4 w-4 text-emerald-400" />
                )}
                <span className="font-mono text-xs font-bold text-white">{order.orderNumber}</span>
                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-300">
                  {order.originState} → {order.destState}
                </Badge>
              </div>
              <Badge
                variant={task === "PARK_DROPOFF" ? "secondary" : "default"}
                className="text-[9px] uppercase"
              >
                {task === "PARK_DROPOFF" ? "Park drop-off" : "Park retrieval"}
              </Badge>
            </div>

            {task === "PARK_RETRIEVAL" && linehaul && (
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-3 text-xs space-y-1.5">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  Collect at {linehaul.destPark ?? order.destState}
                </div>
                <div className="text-slate-400">
                  {linehaul.transportCompany} • Waybill{" "}
                  <span className="font-mono text-white">{linehaul.waybillNumber}</span>
                  {linehaul.vehiclePlate ? ` • ${linehaul.vehiclePlate}` : ""}
                  {linehaul.sealNumber ? ` • Seal ${linehaul.sealNumber}` : ""}
                </div>
                <div className="text-[11px] text-slate-500">
                  Show the waybill photo at the company office. Collect by sender name +
                  waybill number. Photograph the parcel before leaving.
                </div>
                {linehaul.photoUrls.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    Reference photos: {linehaul.photoUrls.join(", ")}
                  </div>
                )}
              </div>
            )}

            {task === "PARK_DROPOFF" && (
              <div className="text-xs text-slate-400">
                Take {order.orderNumber} to the park and record the handoff below. No code
                from the driver is needed.
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 text-xs border-slate-700"
              onClick={() => setExpanded(isOpen ? null : leg.id)}
            >
              {isOpen ? "Hide form" : task === "PARK_DROPOFF" ? "Record park drop-off" : "Record retrieval"}
            </Button>

            {isOpen && task === "PARK_DROPOFF" && (
              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <Label className="text-slate-300">Origin park *</Label>
                  <Input
                    list="park-options"
                    placeholder="e.g. Jibowu Motor Park"
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                    value={dropForm.originPark}
                    onChange={(e) => setDropForm({ ...dropForm, originPark: e.target.value })}
                  />
                  <datalist id="park-options">
                    {parks.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.city} ({p.useCount} trips)
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">Transport company *</Label>
                    <Input
                      placeholder="ABC Motors"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.transportCompany}
                      onChange={(e) => setDropForm({ ...dropForm, transportCompany: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Dest park</Label>
                    <Input
                      placeholder="Utako Motor Park"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.destPark}
                      onChange={(e) => setDropForm({ ...dropForm, destPark: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">Bus plate (or description)</Label>
                    <Input
                      placeholder="LAG-482-XQ"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.vehiclePlate}
                      onChange={(e) => setDropForm({ ...dropForm, vehiclePlate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Bus description</Label>
                    <Input
                      placeholder="White 14-seater Hiace"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.vehicleDescription}
                      onChange={(e) => setDropForm({ ...dropForm, vehicleDescription: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">Waybill number *</Label>
                    <Input
                      placeholder="ABC-88412"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.waybillNumber}
                      onChange={(e) => setDropForm({ ...dropForm, waybillNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Seal number</Label>
                    <Input
                      placeholder="SEAL-2201"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.sealNumber}
                      onChange={(e) => setDropForm({ ...dropForm, sealNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">Waybill photo ref *</Label>
                    <Input
                      placeholder="waybill_abc_88412.jpg"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.waybillPhoto}
                      onChange={(e) => setDropForm({ ...dropForm, waybillPhoto: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Parcel photo ref *</Label>
                    <Input
                      placeholder="parcel_sealed.jpg"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.parcelPhoto}
                      onChange={(e) => setDropForm({ ...dropForm, parcelPhoto: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">Fare paid (₦)</Label>
                    <Input
                      type="number"
                      placeholder="8000"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.fareAmountNgn}
                      onChange={(e) => setDropForm({ ...dropForm, fareAmountNgn: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Driver note (optional)</Label>
                    <Input
                      placeholder="Driver in red cap"
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                      value={dropForm.driverNote}
                      onChange={(e) => setDropForm({ ...dropForm, driverNote: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-10 font-bold"
                  onClick={() => handleDropoff(order.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Confirm drop-off
                </Button>
              </div>
            )}

            {isOpen && task === "PARK_RETRIEVAL" && (
              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <Label className="text-slate-300">Retrieval photo ref *</Label>
                  <Input
                    placeholder="retrieved_at_utako.jpg"
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                    value={retForm.photo}
                    onChange={(e) => setRetForm({ ...retForm, photo: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Seal check *</Label>
                  <Select
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                    value={retForm.sealCheck}
                    onChange={(e) =>
                      setRetForm({ ...retForm, sealCheck: e.target.value as typeof retForm.sealCheck })
                    }
                  >
                    <option value="INTACT">Seal intact</option>
                    <option value="BROKEN">Seal broken (opens incident)</option>
                    <option value="NO_SEAL">No seal used</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Note</Label>
                  <Textarea
                    placeholder="Anything the dispatcher should know"
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                    value={retForm.note}
                    onChange={(e) => setRetForm({ ...retForm, note: e.target.value })}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-10 font-bold"
                  onClick={() => handleRetrieved(order.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Confirm retrieval
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
