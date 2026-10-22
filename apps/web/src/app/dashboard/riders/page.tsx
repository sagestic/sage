"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Battery,
  Bike,
  Car,
  CheckCircle2,
  Mail,
  Phone,
  Search,
  Truck,
  UserPlus,
  Zap,
} from "lucide-react";
import {
  Avatar,
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
} from "@sage/ui";
import {
  InviteRiderSchema,
  type InviteRiderInput,
  type RiderStatus,
  type VehicleType,
} from "@sage/site-schema";
import { sageRepo, type RiderItem } from "../../../lib/data/sage-repo";

export default function RidersPage() {
  const orgId = "org_apex_logistics";
  const [riders, setRiders] = React.useState<RiderItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [inviteRiderOpen, setInviteRiderOpen] = React.useState(false);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setRiders(sageRepo.getRiders(orgId));
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const inviteForm = useForm<InviteRiderInput>({
    resolver: zodResolver(InviteRiderSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vehicleType: "MOTORCYCLE",
      capacityScore: 100,
      role: "RIDER",
    },
  });

  const onInviteRider = (data: InviteRiderInput) => {
    const { invitation, rawInviteUrl } = sageRepo.createRiderInvitation(orgId, data);
    setInviteRiderOpen(false);
    inviteForm.reset();
    setSuccessNotice(`Invitation created for ${invitation.name} (${invitation.phone}). Share link: ${rawInviteUrl}`);
    loadData();
    setTimeout(() => setSuccessNotice(null), 8000);
  };

  const handleStatusChange = (riderId: string, newStatus: RiderStatus) => {
    sageRepo.updateRiderStatus(orgId, riderId, newStatus);
    loadData();
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case "BICYCLE":
        return <Bike className="h-4 w-4" />;
      case "VAN":
        return <Truck className="h-4 w-4" />;
      case "CAR":
        return <Car className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const filteredRiders = riders.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      Boolean(r.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Rider & Fleet Coordination
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time courier availability, shift telemetry, vehicle allocation, and driver invitations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setInviteRiderOpen(true)}
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Invite New Rider
          </Button>
        </div>
      </div>

      {successNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Fleet Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {riders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {riders.filter((r) => r.status !== "OFFLINE").length} active on shift
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Available For Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {riders.filter((r) => r.status === "AVAILABLE").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for immediate dispatch
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              In Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {riders.filter((r) => r.status === "BUSY").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active on customer routes
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {riders.reduce((acc, r) => acc + r.completedTodayCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed drops across all couriers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Filter Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search riders by name, phone, email..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-1">
              {[
                { id: "ALL", label: `All (${riders.length})` },
                {
                  id: "AVAILABLE",
                  label: `Available (${riders.filter((r) => r.status === "AVAILABLE").length})`,
                },
                {
                  id: "BUSY",
                  label: `Busy (${riders.filter((r) => r.status === "BUSY").length})`,
                },
                {
                  id: "ON_BREAK",
                  label: `On Break (${riders.filter((r) => r.status === "ON_BREAK").length})`,
                },
                {
                  id: "OFFLINE",
                  label: `Offline (${riders.filter((r) => r.status === "OFFLINE").length})`,
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

          {/* Riders Grid Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRiders.map((rider) => (
              <Card
                key={rider.id}
                className="shadow-xs hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        rider.status === "AVAILABLE"
                          ? "default"
                          : rider.status === "BUSY"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[9px] uppercase font-bold py-0"
                    >
                      {rider.status}
                    </Badge>

                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Battery className="h-3.5 w-3.5" />
                      {rider.batteryLevel}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <Avatar name={rider.name} className="h-10 w-10 text-xs font-bold" />
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {rider.name}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          {getVehicleIcon(rider.vehicleType)}
                          {rider.vehicleType}
                        </span>
                        <span>•</span>
                        <span>Cap: {rider.capacityScore}kg</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-xs pt-0">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{rider.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{rider.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Active Drops</span>
                    <span className="font-semibold text-foreground">
                      {rider.activeOrderCount} in transit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Today</span>
                    <span className="font-semibold text-foreground">
                      {rider.completedTodayCount} orders
                    </span>
                  </div>
                </CardContent>

                <div className="px-5 pb-4 pt-1 flex items-center justify-between gap-2">
                  <Select
                    value={rider.status}
                    onChange={(e) =>
                      handleStatusChange(rider.id, e.target.value as RiderStatus)
                    }
                    className="h-8 text-[11px] flex-1"
                  >
                    <option value="AVAILABLE">Set Available</option>
                    <option value="BUSY">Set Busy</option>
                    <option value="ON_BREAK">Set On Break</option>
                    <option value="OFFLINE">Set Offline</option>
                  </Select>
                  <a href={`tel:${rider.phone}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Invite New Rider */}
      <Dialog open={inviteRiderOpen} onOpenChange={setInviteRiderOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={inviteForm.handleSubmit(onInviteRider)}>
            <DialogHeader>
              <DialogTitle>Send Rider Invitation</DialogTitle>
              <DialogDescription>
                Invite a courier to join your organization fleet with PWA login credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <Label htmlFor="riderName">Full Name</Label>
                <Input
                  id="riderName"
                  placeholder="e.g. Liam Walker"
                  className="mt-1"
                  {...inviteForm.register("name")}
                />
                {inviteForm.formState.errors.name && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {inviteForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="riderEmail">Email Address</Label>
                <Input
                  id="riderEmail"
                  type="email"
                  placeholder="liam.walker@example.com"
                  className="mt-1"
                  {...inviteForm.register("email")}
                />
                {inviteForm.formState.errors.email && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {inviteForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="riderPhone">Mobile Phone</Label>
                <Input
                  id="riderPhone"
                  placeholder="+44 7700 900888"
                  className="mt-1"
                  {...inviteForm.register("phone")}
                />
                {inviteForm.formState.errors.phone && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {inviteForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    id="vehicleType"
                    className="mt-1"
                    {...inviteForm.register("vehicleType")}
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="CAR">Car</option>
                    <option value="VAN">Van / Truck</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity (KG)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="10"
                    max="500"
                    defaultValue="100"
                    className="mt-1"
                    {...inviteForm.register("capacityScore", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteRiderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Issue Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
