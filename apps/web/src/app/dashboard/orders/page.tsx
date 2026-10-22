"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Plus,
  Search,
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

  const loadData = React.useCallback(() => {
    setOrders(sageRepo.getOrders(orgId));
    setRiders(sageRepo.getRiders(orgId));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateOrderOpen(true)}
            className="gap-1.5"
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
    </div>
  );
}
