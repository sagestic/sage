"use client";

import * as React from "react";
import { Bus, CheckCircle2, MapPin, PackageSearch } from "lucide-react";
import {  Button, Input, Label, Select, Textarea } from "@sage/ui";
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
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-3 mt-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
          <Bus className="h-6 w-6 text-zinc-500" />
        </div>
        <div className="font-medium text-zinc-100">No Interstate Tasks</div>
        <p className="text-sm text-zinc-500">
          Park drop-offs and retrievals assigned to you will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {tasks.map(({ order, leg, task }) => {
        const linehaul = linehaulFor(order.id);
        const isOpen = expanded === leg.id;
        return (
          <div key={leg.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    {task === "PARK_DROPOFF" ? (
                      <Bus className="h-4 w-4 text-amber-500" />
                    ) : (
                      <PackageSearch className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-zinc-100">{order.orderNumber}</div>
                    <div className="text-xs text-zinc-500">{order.originState} → {order.destState}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-zinc-400">
                  {task === "PARK_DROPOFF" ? "Drop-off" : "Retrieval"}
                </div>
              </div>

              {task === "PARK_RETRIEVAL" && linehaul && (
                <div className="rounded-2xl bg-zinc-950/50 border border-zinc-800/80 p-4 text-sm space-y-2">
                  <div className="font-medium text-zinc-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Collect at {linehaul.destPark ?? order.destState}
                  </div>
                  <div className="text-zinc-400 text-xs">
                    {linehaul.transportCompany} • Waybill <span className="font-mono text-zinc-200">{linehaul.waybillNumber}</span>
                    {linehaul.vehiclePlate ? ` • ${linehaul.vehiclePlate}` : ""}
                    {linehaul.sealNumber ? ` • Seal ${linehaul.sealNumber}` : ""}
                  </div>
                  {linehaul.photoUrls.length > 0 && (
                    <div className="text-xs text-zinc-500">
                      Ref photos: {linehaul.photoUrls.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {task === "PARK_DROPOFF" && (
                <div className="text-sm text-zinc-400 leading-relaxed">
                  Take order <span className="font-mono">{order.orderNumber}</span> to the park and record the handoff below.
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl text-sm border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setExpanded(isOpen ? null : leg.id)}
              >
                {isOpen ? "Hide Form" : task === "PARK_DROPOFF" ? "Record Drop-off" : "Record Retrieval"}
              </Button>
            </div>

            {isOpen && task === "PARK_DROPOFF" && (
              <div className="bg-zinc-950 p-5 space-y-4 border-t border-zinc-800">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Origin park *</Label>
                  <Input
                    list="park-options"
                    placeholder="e.g. Jibowu Motor Park"
                    className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Transport Co *</Label>
                    <Input
                      placeholder="ABC Motors"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.transportCompany}
                      onChange={(e) => setDropForm({ ...dropForm, transportCompany: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Dest park</Label>
                    <Input
                      placeholder="Utako Motor Park"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.destPark}
                      onChange={(e) => setDropForm({ ...dropForm, destPark: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Bus plate</Label>
                    <Input
                      placeholder="LAG-482-XQ"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.vehiclePlate}
                      onChange={(e) => setDropForm({ ...dropForm, vehiclePlate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Waybill num *</Label>
                    <Input
                      placeholder="ABC-88412"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.waybillNumber}
                      onChange={(e) => setDropForm({ ...dropForm, waybillNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Waybill photo *</Label>
                    <Input
                      placeholder="waybill.jpg"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.waybillPhoto}
                      onChange={(e) => setDropForm({ ...dropForm, waybillPhoto: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Parcel photo *</Label>
                    <Input
                      placeholder="parcel.jpg"
                      className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                      value={dropForm.parcelPhoto}
                      onChange={(e) => setDropForm({ ...dropForm, parcelPhoto: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  className="w-full h-12 rounded-xl text-sm font-medium mt-2 bg-white text-zinc-950 hover:bg-zinc-200"
                  onClick={() => handleDropoff(order.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Drop-off
                </Button>
              </div>
            )}

            {isOpen && task === "PARK_RETRIEVAL" && (
              <div className="bg-zinc-950 p-5 space-y-4 border-t border-zinc-800">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Retrieval photo ref *</Label>
                  <Input
                    placeholder="retrieved.jpg"
                    className="h-12 bg-zinc-900 border-zinc-800 rounded-xl"
                    value={retForm.photo}
                    onChange={(e) => setRetForm({ ...retForm, photo: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Seal check *</Label>
                  <Select
                    className="h-12 bg-zinc-900 border-zinc-800 rounded-xl text-zinc-100"
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
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Note</Label>
                  <Textarea
                    placeholder="Optional details..."
                    className="min-h-[100px] bg-zinc-900 border-zinc-800 rounded-xl resize-none"
                    value={retForm.note}
                    onChange={(e) => setRetForm({ ...retForm, note: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full h-12 rounded-xl text-sm font-medium mt-2 bg-white text-zinc-950 hover:bg-zinc-200"
                  onClick={() => handleRetrieved(order.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Retrieval
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}