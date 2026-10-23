"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  
  
  MessageSquare,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import {
  
  Button,
  Card,
  CardContent,
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
  CreateOrderSchema,
  type CreateOrderInput,
} from "@sage/site-schema";
import {
  sageRepo,
  type OrderItem,
  type RiderItem,
} from "../../../lib/data/sage-repo";

export default function OrdersPage() {
  const orgId = "org_apex_logistics";
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [riders, setRiders] = React.useState<RiderItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [createOrderOpen, setCreateOrderOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderItem | null>(null);
  const [assignRiderId, setAssignRiderId] = React.useState<string>("");
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = React.useState(false);
  const [whatsAppText, setWhatsAppText] = React.useState(
    "Pls send rider to pick up at 14 Admiralty Way Lekki Phase 1, deliver to 5 Adeola Odeku VI. Recipient: Tola 08031234567, Cash on delivery N12,000",
  );
  
  

  const loadData = React.useCallback(() => {
    setOrders(sageRepo.getOrders(orgId));
    setRiders(sageRepo.getRiders(orgId));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAutoDispatch = () => {
    const res = sageRepo.autoDispatchPendingOrders(orgId);
    if (res.assignedCount === 0) {
      setSuccessNotice("No pending orders or no available couriers with capacity.");
    } else {
      const kmSaved = res.matches.reduce((sum, m) => sum + (m.kmSaved || 0), 0);
      const consolidatedCount = res.matches.filter(
        (m) => m.type !== "INDEPENDENT_DISPATCH",
      ).length;
      setSuccessNotice(
        `Autonomously dispatched ${res.assignedCount} pending orders! ${consolidatedCount} consolidated on shared corridors, saving ~${kmSaved.toFixed(1)} km!`,
      );
    }
    loadData();
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleQuickWhatsAppIngest = () => {
    if (!whatsAppText.trim()) return;

    const phoneMatch =
      whatsAppText.match(/(?:\+234|0)[789][01]\d{8}/) ||
      whatsAppText.match(/\b\d{10,14}\b/);
    const phone = phoneMatch ? phoneMatch[0] : "+234 803 123 4567";

    const nameMatch = whatsAppText.match(
      /(?:Recipient|Customer|Name|Contact)[:\s]+([A-Za-z\s]+?)(?:,|\.|\n|$)/i,
    );
    const name = nameMatch ? nameMatch[1].trim() : "WhatsApp Customer";

    const pickupMatch = whatsAppText.match(
      /(?:pick\s*up\s*(?:at|from)?|from)[:\s]+([^,\n]+)/i,
    );
    const pickup = pickupMatch ? pickupMatch[1].trim() : "Depot Hub / Merchant";

    const deliveryMatch = whatsAppText.match(
      /(?:deliver\s*to|drop\s*at|to)[:\s]+([^,\n]+)/i,
    );
    const delivery = deliveryMatch
      ? deliveryMatch[1].trim()
      : whatsAppText.slice(0, 80);

    const created = sageRepo.ingestCanonicalOrder(orgId, {
      source: "WHATSAPP",
      recipientName: name,
      recipientPhone: phone,
      pickupAddress: pickup,
      dropoffAddress: delivery,
      priority:
        whatsAppText.toLowerCase().includes("urgent") ||
        whatsAppText.toLowerCase().includes("rush")
          ? "RUSH"
          : "STANDARD",
      packageSize: "MEDIUM",
      notes: `Raw WhatsApp Chat: "${whatsAppText.slice(0, 150)}"`,
      metadata: {
        rawChat: whatsAppText,
        extractedVia: "Gemini / Quick Dispatch Intake",
      },
    });

    const dispatchRes = sageRepo.autoDispatchPendingOrders(orgId);
    const matched = dispatchRes.matches.find(
      (m) => m.orderNumber === created.order.orderNumber,
    );

    setWhatsAppModalOpen(false);
    const dispatchNote = matched
      ? ` • Assigned to ${matched.riderName}${matched.kmSaved > 0 ? ` (Corridor overlap saved ~${matched.kmSaved} km)` : ""}`
      : "";

    setSuccessNotice(
      `Ingested order ${created.order.orderNumber} from WhatsApp chat for ${name}${dispatchNote}. Live tracking at /track/${created.order.orderNumber}`,
    );
    loadData();
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const orderForm = useForm<CreateOrderInput>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      orderNumber: "ORD-9426",
      source: "MANUAL",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      pickupAddress: "",
      deliveryAddress: "",
      priority: "STANDARD",
      packageSize: "MEDIUM",
      notes: "",
    },
  });

  const onCreateOrder = (data: CreateOrderInput) => {
    const created = sageRepo.createOrder(orgId, data);
    setCreateOrderOpen(false);
    setIsInterstateChecked(false);
    orderForm.reset({
      orderNumber: "ORD-9427",
      source: "MANUAL",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      pickupAddress: "",
      deliveryAddress: "",
      priority: "STANDARD",
      packageSize: "MEDIUM",
      notes: "",
    });
    setSuccessNotice(`Order ${created.orderNumber} successfully registered.`);
    loadData();
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleAssignRider = (orderId: string) => {
    if (!assignRiderId) return;
    sageRepo.reassignRider(orgId, orderId, assignRiderId, "Manual dispatch assignment / transfer");
    setSuccessNotice(`Assigned/Transferred courier for delivery order.`);
    setAssignRiderId("");
    setSelectedOrder(null);
    loadData();
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleMarkDelivered = (orderId: string) => {
    sageRepo.updateOrderStatus(orgId, orderId, "DELIVERED");
    setSuccessNotice(`Order marked delivered.`);
    setSelectedOrder(null);
    loadData();
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesQuery =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Orders
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Multi-channel order orchestration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoDispatch}
            className="h-9 gap-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <Zap className="h-4 w-4" />
            Auto-Dispatch Pending
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWhatsAppModalOpen(true)}
            className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp Intake
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOrderOpen(true)}
            className="h-9 gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {successNotice && (
        <div className="rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium">{successNotice}</span>
        </div>
      )}

      {/* Main List */}
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardContent className="p-0">
          {/* Controls */}
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search orders..."
                className="pl-9 h-9 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm border-zinc-200/60 dark:border-zinc-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 w-full md:w-auto overflow-x-auto">
              {[
                { id: "ALL", label: `All` },
                { id: "PENDING", label: `Pending` },
                { id: "IN_TRANSIT", label: `In Transit` },
                { id: "DELIVERED", label: `Delivered` },
                { id: "FAILED", label: `Issue` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    statusFilter === tab.id
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Order #</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Route</th>
                  <th className="py-3 px-4 font-medium">Priority</th>
                  <th className="py-3 px-4 font-medium">Courier</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {order.orderNumber}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {order.source}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.customerName}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top max-w-[200px]">
                        <div className="text-xs text-zinc-500 truncate mb-1" title={order.pickupAddress}>
                          <span className="font-medium">From:</span> {order.pickupAddress}
                        </div>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 truncate" title={order.deliveryAddress}>
                          <span className="font-medium">To:</span> {order.deliveryAddress}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          order.priority === "RUSH" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                          order.priority === "EXPRESS" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top">
                        {order.assignedRiderName ? (
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-sm text-zinc-900 dark:text-zinc-100">
                              {order.assignedRiderName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-sm italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider ${
                          order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                          order.status === "IN_TRANSIT" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" :
                          order.status === "FAILED" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Manual Order Modal */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
          <form onSubmit={orderForm.handleSubmit(onCreateOrder)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Create Order</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Register a manual fulfillment order.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order ID</Label>
                  <Input
                    className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-sm"
                    {...orderForm.register("orderNumber")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</Label>
                  <Select
                    className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                    {...orderForm.register("priority")}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="RUSH">Rush</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Customer Name</Label>
                  <Input
                    placeholder="Jane Doe"
                    className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                    {...orderForm.register("customerName")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</Label>
                  <Input
                    placeholder="+44..."
                    className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                    {...orderForm.register("customerPhone")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pickup Address</Label>
                <Input
                  className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                  {...orderForm.register("pickupAddress")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Delivery Address</Label>
                <Input
                  className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                  {...orderForm.register("deliveryAddress")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</Label>
                <Textarea
                  placeholder="Gate code, drop-off instructions..."
                  className="min-h-[80px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm resize-none"
                  {...orderForm.register("notes")}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                onClick={() => setCreateOrderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-10 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {selectedOrder.orderNumber}
                </DialogTitle>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {selectedOrder.status.replace("_", " ")}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-5">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-2">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedOrder.customerName}
                </div>
                <div className="text-sm text-zinc-500">{selectedOrder.customerPhone}</div>
              </div>

              <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                <div className="relative">
                  <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
                  <div className="text-xs font-medium text-zinc-500 mb-1">Pickup</div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedOrder.pickupAddress}</div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-800 dark:bg-zinc-200 ring-4 ring-white dark:ring-zinc-950" />
                  <div className="text-xs font-medium text-zinc-500 mb-1">Destination</div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedOrder.deliveryAddress}</div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Notes:</span> {selectedOrder.notes}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {selectedOrder.assignedRiderName ? "Reassign Courier" : "Assign Courier"}
                </Label>
                <div className="flex gap-3">
                  <Select
                    value={assignRiderId}
                    onChange={(e) => setAssignRiderId(e.target.value)}
                    className="h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                  >
                    <option value="">Select courier...</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.status})
                      </option>
                    ))}
                  </Select>
                  <Button
                    disabled={!assignRiderId}
                    onClick={() => handleAssignRider(selectedOrder.id)}
                    className="h-10 px-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex w-full gap-3">
                {selectedOrder.status !== "DELIVERED" && (
                  <Button
                    variant="outline"
                    className="flex-1 h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                    onClick={() => handleMarkDelivered(selectedOrder.id)}
                  >
                    Mark Delivered
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* WhatsApp Intake Modal */}
      <Dialog open={whatsAppModalOpen} onOpenChange={setWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">WhatsApp Intake</DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  AI-powered unstructured text parsing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Paste Message</Label>
              <button
                type="button"
                onClick={() => setWhatsAppText("Pls send rider to pick up 2 packs of jollof at 14 Admiralty Way Lekki Phase 1, deliver to 5 Adeola Odeku VI. Recipient: Tola 08031234567, Cash on delivery N12,000")}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700"
              >
                Load Sample
              </button>
            </div>
            
            <Textarea
              rows={5}
              value={whatsAppText}
              onChange={(e) => setWhatsAppText(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm font-mono resize-none p-4 rounded-xl"
            />
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-3">
            <Button
              variant="outline"
              onClick={() => setWhatsAppModalOpen(false)}
              className="flex-1 h-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickWhatsAppIngest}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
            >
              Parse & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}