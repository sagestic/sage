"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bike,
  Car,
  Compass,
  Layers,
  MapPin,
  Truck,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@sage/ui";
import type { IncidentItem, OrderItem, RiderItem } from "../../lib/data/sage-repo";

export interface OperationsMapProps {
  riders: RiderItem[];
  orders: OrderItem[];
  incidents: IncidentItem[];
  selectedRiderId?: string;
  selectedOrderId?: string;
  onSelectRider?: (rider: RiderItem) => void;
  onSelectOrder?: (order: OrderItem) => void;
  height?: string;
  showControls?: boolean;
}

export function OperationsMap({
  riders,
  orders,
  incidents,
  selectedRiderId,
  selectedOrderId,
  onSelectRider,
  onSelectOrder,
  height = "500px",
  showControls = true,
}: OperationsMapProps) {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [vehicleFilter, setVehicleFilter] = React.useState<string>("ALL");
  const [showIncidentsLayer, setShowIncidentsLayer] = React.useState(true);
  const [activeHoverItem, setActiveHoverItem] = React.useState<{
    type: "rider" | "order" | "incident";
    title: string;
    subtitle: string;
    status: string;
    x: number;
    y: number;
  } | null>(null);

  // Normalize lat/lng to container percentages for the simulated London metropolitan area
  // Bounding box: Lat ~ 51.48 to 51.53, Lng ~ -0.20 to -0.05
  const minLat = 51.48;
  const maxLat = 51.53;
  const minLng = -0.2;
  const maxLng = -0.05;

  const projectCoordinates = React.useCallback(
    (lat: number, lng: number) => {
      const x = Math.min(Math.max(((lng - minLng) / (maxLng - minLng)) * 100, 5), 95);
      // Invert Y because latitude goes upwards
      const y = Math.min(Math.max((1 - (lat - minLat) / (maxLat - minLat)) * 100, 5), 95);
      return { x, y };
    },
    [minLat, maxLat, minLng, maxLng],
  );

  const filteredRiders = riders.filter((r) => {
    if (vehicleFilter === "ALL") return true;
    return r.vehicleType === vehicleFilter;
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "BICYCLE":
        return <Bike className="h-3.5 w-3.5" />;
      case "VAN":
        return <Truck className="h-3.5 w-3.5" />;
      case "CAR":
        return <Car className="h-3.5 w-3.5" />;
      default:
        return <Zap className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-slate-950 font-sans shadow-inner select-none"
      style={{ height }}
    >
      {/* Map Vector Background Layer */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        {/* Stylized Street Grid Lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              <circle cx="0" cy="0" r="1.5" fill="#38bdf8" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Simulated River Thames waterway */}
          <path
            d="M 0 320 Q 200 360, 400 310 T 800 290 T 1200 330 T 1600 300"
            fill="none"
            stroke="#0284c7"
            strokeWidth="32"
            opacity="0.3"
            strokeLinecap="round"
          />
          <path
            d="M 0 320 Q 200 360, 400 310 T 800 290 T 1200 330 T 1600 300"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="8"
            opacity="0.5"
          />

          {/* Major arterial highways */}
          <line
            x1="10%"
            y1="20%"
            x2="90%"
            y2="75%"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <line
            x1="20%"
            y1="85%"
            x2="85%"
            y2="15%"
            stroke="#475569"
            strokeWidth="3"
          />
        </svg>

        {/* Active Route Polylines connecting In-Transit orders to Assigned Riders */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {orders
            .filter((o) => o.status === "IN_TRANSIT" && o.assignedRiderId)
            .map((order) => {
              const rider = riders.find((r) => r.id === order.assignedRiderId);
              if (!rider) return null;
              const rPos = projectCoordinates(
                rider.currentLatitude,
                rider.currentLongitude,
              );
              const dPos = projectCoordinates(
                order.deliveryLat,
                order.deliveryLng,
              );

              return (
                <g key={`route_${order.id}`}>
                  <line
                    x1={`${rPos.x}%`}
                    y1={`${rPos.y}%`}
                    x2={`${dPos.x}%`}
                    y2={`${dPos.y}%`}
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                    opacity="0.8"
                  />
                  <circle
                    cx={`${dPos.x}%`}
                    cy={`${dPos.y}%`}
                    r="4"
                    fill="#06b6d4"
                  />
                </g>
              );
            })}
        </svg>

        {/* Incident Hotspots Layer */}
        {showIncidentsLayer &&
          incidents
            .filter((i) => i.status !== "RESOLVED")
            .map((incident) => {
              const relatedOrder = orders.find((o) => o.id === incident.orderId);
              const pos = relatedOrder
                ? projectCoordinates(relatedOrder.deliveryLat, relatedOrder.deliveryLng)
                : { x: 55, y: 48 };

              return (
                <div
                  key={incident.id}
                  className="absolute cursor-pointer transition-transform hover:scale-125 z-20"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() =>
                    setActiveHoverItem({
                      type: "incident",
                      title: incident.title,
                      subtitle: `${incident.severity} severity • ${incident.category}`,
                      status: incident.status,
                      x: pos.x,
                      y: pos.y,
                    })
                  }
                  onMouseLeave={() => setActiveHoverItem(null)}
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 text-white items-center justify-center shadow-lg border-2 border-red-200">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                  </span>
                </div>
              );
            })}

        {/* Order Destination Markers */}
        {orders
          .filter((o) => o.status !== "DELIVERED")
          .map((order) => {
            const pos = projectCoordinates(order.deliveryLat, order.deliveryLng);
            const isSelected = order.id === selectedOrderId;

            return (
              <div
                key={order.id}
                className={`absolute cursor-pointer transition-transform hover:scale-125 z-10 ${
                  isSelected ? "scale-125 z-30" : ""
                }`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => onSelectOrder?.(order)}
                onMouseEnter={() =>
                  setActiveHoverItem({
                    type: "order",
                    title: `${order.orderNumber} • ${order.customerName}`,
                    subtitle: order.deliveryAddress,
                    status: order.status,
                    x: pos.x,
                    y: pos.y,
                  })
                }
                onMouseLeave={() => setActiveHoverItem(null)}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border shadow-md text-[10px] font-bold ${
                    order.status === "IN_TRANSIT"
                      ? "bg-cyan-600 border-cyan-300 text-white"
                      : order.status === "PENDING"
                        ? "bg-amber-600 border-amber-300 text-white"
                        : "bg-slate-700 border-slate-500 text-slate-200"
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                </div>
              </div>
            );
          })}

        {/* Rider Markers */}
        {filteredRiders.map((rider) => {
          const pos = projectCoordinates(
            rider.currentLatitude,
            rider.currentLongitude,
          );
          const isSelected = rider.id === selectedRiderId;

          return (
            <div
              key={rider.id}
              className={`absolute cursor-pointer transition-all duration-500 ease-out z-20 ${
                isSelected ? "scale-125 z-40" : "hover:scale-115"
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => onSelectRider?.(rider)}
              onMouseEnter={() =>
                setActiveHoverItem({
                  type: "rider",
                  title: `${rider.name} (${rider.vehicleType})`,
                  subtitle: `${rider.batteryLevel}% Battery • ${rider.activeOrderCount} Active Drops`,
                  status: rider.status,
                  x: pos.x,
                  y: pos.y,
                })
              }
              onMouseLeave={() => setActiveHoverItem(null)}
            >
              <div className="relative flex items-center justify-center">
                {rider.status === "AVAILABLE" && (
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-40" />
                )}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg transition-colors ${
                    rider.status === "AVAILABLE"
                      ? "bg-emerald-600 border-emerald-300 text-white"
                      : rider.status === "BUSY"
                        ? "bg-indigo-600 border-indigo-300 text-white"
                        : rider.status === "ON_BREAK"
                          ? "bg-amber-600 border-amber-300 text-white"
                          : "bg-slate-800 border-slate-600 text-slate-400"
                  }`}
                >
                  {getVehicleIcon(rider.vehicleType)}
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-slate-900 bg-emerald-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Hover Tooltip */}
      {activeHoverItem && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md transition-opacity"
          style={{
            left: `${Math.min(Math.max(activeHoverItem.x, 15), 80)}%`,
            top: `${Math.max(activeHoverItem.y - 12, 10)}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-semibold text-slate-100">{activeHoverItem.title}</span>
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1 border-slate-600 text-slate-300 uppercase"
            >
              {activeHoverItem.status}
            </Badge>
          </div>
          <p className="text-slate-400 text-[11px] max-w-[220px] truncate">
            {activeHoverItem.subtitle}
          </p>
        </div>
      )}

      {/* Map Top Bar Info & Status */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-1.5 backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">
            Live Fleet Radar (London Metro)
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] bg-slate-800 text-slate-300 border-slate-700"
          >
            Google Maps Adapter
          </Badge>
        </div>

        {incidents.filter((i) => i.status !== "RESOLVED").length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-950/80 border border-red-800/80 px-2.5 py-1.5 text-xs text-red-300 backdrop-blur-md">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span>
              {incidents.filter((i) => i.status !== "RESOLVED").length} Active Incidents
            </span>
          </div>
        )}
      </div>

      {/* Interactive Controls Overlay */}
      {showControls && (
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          {/* Zoom controls */}
          <div className="flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-sm">
            <button
              type="button"
              className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-px bg-slate-800" />
            <button
              type="button"
              className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="h-px bg-slate-800" />
            <button
              type="button"
              className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => setZoomLevel(1)}
              title="Reset View"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>

          {/* Vehicle filter toggle */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-1.5 backdrop-blur-md shadow-sm">
            <div className="text-[10px] text-slate-400 px-1 mb-1 font-semibold uppercase tracking-wider">
              Fleet Filter
            </div>
            <div className="flex gap-1">
              {[
                { id: "ALL", label: "All" },
                { id: "MOTORCYCLE", label: "Moto" },
                { id: "BICYCLE", label: "Bike" },
                { id: "VAN", label: "Van" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setVehicleFilter(filter.id)}
                  className={`px-2 py-1 text-[11px] rounded transition-colors ${
                    vehicleFilter === filter.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Bottom Legend */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <span>In Delivery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Pending Drop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Incident</span>
        </div>
        <button
          type="button"
          onClick={() => setShowIncidentsLayer(!showIncidentsLayer)}
          className={`flex items-center gap-1 ml-2 text-[10px] px-2 py-0.5 rounded border ${
            showIncidentsLayer
              ? "bg-slate-800 border-slate-700 text-slate-200"
              : "bg-transparent border-slate-800 text-slate-500"
          }`}
        >
          <Layers className="h-3 w-3" />
          <span>{showIncidentsLayer ? "Incidents On" : "Incidents Off"}</span>
        </button>
      </div>

      <div className="absolute bottom-3 right-3 z-30 text-[10px] text-slate-500">
        Lat: 51.5074° N, Lng: -0.1278° W • Realtime Socket Simulation
      </div>
    </div>
  );
}
