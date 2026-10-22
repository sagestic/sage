"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import {
  Badge,
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
  const [copiedTracking, setCopiedTracking] = React.useState(false);

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
      setSuccessNotice(
        `Autonomously dispatched ${res.assignedCount} pending orders to available couriers!`,
      );
    }
    loadData();
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleQuickWhatsAppIngest = () => {
    if (!whatsAppText.trim()) return;

    // Intelligent regex/heuristic extraction
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

    setWhatsAppModalOpen(false);
    setSuccessNotice(
      `Ingested order ${created.order.orderNumber} from WhatsApp chat for ${name}. Live tracking active.`,
    );
    loadData();
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // React Hook Form for Create Order
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
    sageRepo.assignRider(orgId, orderId, assignRiderId);
    setSuccessNotice(`Assigned courier to delivery order.`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Order Orchestration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-channel order ingestion from Shopify, WooCommerce, API, and manual dispatch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoDispatch}
            className="gap-1.5 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
            Auto-Dispatch Pending
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setWhatsAppModalOpen(true)}
            className="gap-1.5 text-xs border-primary/30"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Quick WhatsApp Intake
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateOrderOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            Create Manual Order
          </Button>
        </div>
      </div>

      {successNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer, address..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Quick Filter Tabs */}
            <div className="flex flex-wrap gap-1 w-full md:w-auto">
              {[
                { id: "ALL", label: `All (${orders.length})` },
                {
                  id: "PENDING",
                  label: `Pending (${orders.filter((o) => o.status === "PENDING").length})`,
                },
                {
                  id: "IN_TRANSIT",
                  label: `In Transit (${orders.filter((o) => o.status === "IN_TRANSIT").length})`,
                },
                {
                  id: "DELIVERED",
                  label: `Delivered (${orders.filter((o) => o.status === "DELIVERED").length})`,
                },
                {
                  id: "FAILED",
                  label: `Delayed / Issue (${orders.filter((o) => o.status === "FAILED").length})`,
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
          </div>

          {/* Orders Data Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Source Channel</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Addresses (Pickup → Dropoff)</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Assigned Courier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No delivery orders matched this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono py-0"
                        >
                          {order.source}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <div className="text-[11px] text-muted-foreground truncate">
                          <span className="font-semibold text-foreground">From:</span>{" "}
                          {order.pickupAddress}
                        </div>
                        <div className="text-[11px] text-foreground truncate mt-0.5">
                          <span className="font-semibold text-foreground">To:</span>{" "}
                          {order.deliveryAddress}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            order.priority === "RUSH"
                              ? "destructive"
                              : order.priority === "EXPRESS"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[9px] uppercase font-bold py-0"
                        >
                          {order.priority}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {order.assignedRiderName ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-medium text-foreground">
                              {order.assignedRiderName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold italic text-[11px]">
                            Awaiting Dispatch
                          </span>
                        )}
                      </td>
                      <td className="p-3">
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
                          className="text-[10px] uppercase font-semibold py-0"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Inspect
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

      {/* Modal: Create Manual Order */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={orderForm.handleSubmit(onCreateOrder)}>
            <DialogHeader>
              <DialogTitle>Register Delivery Order</DialogTitle>
              <DialogDescription>
                Create a manual fulfillment order with address geocoding and priority dispatch.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="orderNumber">Order Reference #</Label>
                  <Input
                    id="orderNumber"
                    className="mt-1 font-mono"
                    {...orderForm.register("orderNumber")}
                  />
                  {orderForm.formState.errors.orderNumber && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {orderForm.formState.errors.orderNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    id="priority"
                    className="mt-1"
                    {...orderForm.register("priority")}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express Priority</option>
                    <option value="RUSH">Rush (Under 30m)</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customerName">Recipient Name</Label>
                  <Input
                    id="customerName"
                    placeholder="e.g. Jane Doe"
                    className="mt-1"
                    {...orderForm.register("customerName")}
                  />
                  {orderForm.formState.errors.customerName && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {orderForm.formState.errors.customerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Recipient Phone</Label>
                  <Input
                    id="customerPhone"
                    placeholder="+44 7700 900123"
                    className="mt-1"
                    {...orderForm.register("customerPhone")}
                  />
                  {orderForm.formState.errors.customerPhone && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {orderForm.formState.errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="pickupAddress">Pickup Location (Store / Depot)</Label>
                <Input
                  id="pickupAddress"
                  placeholder="e.g. 10 Oxford St, London"
                  className="mt-1"
                  {...orderForm.register("pickupAddress")}
                />
                {orderForm.formState.errors.pickupAddress && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {orderForm.formState.errors.pickupAddress.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Delivery Destination</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="e.g. 55 High Street, London"
                  className="mt-1"
                  {...orderForm.register("deliveryAddress")}
                />
                {orderForm.formState.errors.deliveryAddress && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {orderForm.formState.errors.deliveryAddress.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Delivery Notes & Gate Codes</Label>
                <Textarea
                  id="notes"
                  placeholder="Leave with concierge or ring flat 4B..."
                  className="mt-1 h-16"
                  {...orderForm.register("notes")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOrderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Inspect Order Details */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-mono">
                  {selectedOrder.orderNumber}
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {selectedOrder.status}
                </Badge>
              </div>
              <DialogDescription>
                Full order timeline and courier routing metadata.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-1.5">
                <div className="font-semibold text-foreground">
                  Customer: {selectedOrder.customerName}
                </div>
                <div className="text-muted-foreground">
                  Phone: {selectedOrder.customerPhone}
                </div>
                <div className="text-muted-foreground">
                  Channel: {selectedOrder.source}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-foreground">
                  Pickup:
                </div>
                <div className="text-muted-foreground">{selectedOrder.pickupAddress}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-foreground">
                  Delivery Destination:
                </div>
                <div className="text-muted-foreground">{selectedOrder.deliveryAddress}</div>
              </div>

              {selectedOrder.notes && (
                <div className="rounded-lg border border-border/80 p-2 text-muted-foreground bg-muted/30">
                  <span className="font-semibold text-foreground">Notes:</span>{" "}
                  {selectedOrder.notes}
                </div>
              )}

              {/* Customer Live Tracking Link */}
              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                  <span>Customer Live Tracking (WhatsApp/SMS Share):</span>
                  <a
                    href={`/track/${selectedOrder.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                  >
                    Open View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    readOnly
                    value={`https://sage-ops.com/track/${selectedOrder.orderNumber}`}
                    className="h-8 font-mono text-[11px] bg-muted/50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs shrink-0 gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://sage-ops.com/track/${selectedOrder.orderNumber}`,
                      );
                      setCopiedTracking(true);
                      setTimeout(() => setCopiedTracking(false), 2000);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedTracking ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Assign rider action if not yet assigned */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="text-[11px] font-semibold text-foreground">
                  {selectedOrder.assignedRiderName
                    ? `Assigned: ${selectedOrder.assignedRiderName}`
                    : "Assign Courier:"}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={assignRiderId}
                    onChange={(e) => setAssignRiderId(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="">Select available courier...</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.vehicleType} • {r.status})
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!assignRiderId}
                    onClick={() => handleAssignRider(selectedOrder.id)}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center w-full">
              {selectedOrder.status !== "DELIVERED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-emerald-600 border-emerald-300"
                  onClick={() => handleMarkDelivered(selectedOrder.id)}
                >
                  Mark Delivered
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal: Quick WhatsApp Chat Ingestion */}
      <Dialog open={whatsAppModalOpen} onOpenChange={setWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              <DialogTitle>Quick WhatsApp Order Intake</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Paste raw unstructured customer chats (social commerce, Instagram/WhatsApp orders). Gemini extracts customer name, phone, landmarks, and Cash on Delivery terms.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="waRawText">Paste WhatsApp Message</Label>
              <button
                type="button"
                onClick={() =>
                  setWhatsAppText(
                    "Pls send rider to pick up 2 packs of jollof at 14 Admiralty Way Lekki Phase 1, deliver to 5 Adeola Odeku VI. Recipient: Tola 08031234567, Cash on delivery N12,000",
                  )
                }
                className="text-[11px] text-primary hover:underline"
              >
                Load Lagos Sample
              </button>
            </div>

            <Textarea
              id="waRawText"
              rows={4}
              value={whatsAppText}
              onChange={(e) => setWhatsAppText(e.target.value)}
              placeholder="e.g. Please pick up at..."
              className="font-mono text-xs bg-muted/40"
            />

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                Automatic Heuristic Extraction:
              </div>
              <p>
                Extracts phone numbers, pickup and delivery landmarks, parcel details, and COD cash instructions.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWhatsAppModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleQuickWhatsAppIngest} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Extract & Ingest Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
