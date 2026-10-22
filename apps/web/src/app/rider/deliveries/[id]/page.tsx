"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Navigation,
  Phone,
} from "lucide-react";
import { Badge, Button } from "@sage/ui";
import { sageRepo, type OrderItem } from "../../../../lib/data/sage-repo";

export default function RiderDeliveryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const orgId = "org_apex_logistics";

  const [order, setOrder] = React.useState<OrderItem | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const found = sageRepo.getOrder(orgId, id);
    if (found) {
      setOrder(found);
    }
  }, [id, orgId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-sm text-slate-400 mb-4">Delivery not found</p>
        <Link href="/rider">
          <Button size="sm" variant="outline">
            Return to Courier Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <Link
            href="/rider"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Deliveries</span>
          </Link>
          <Badge variant="outline" className="text-xs font-mono border-slate-700">
            {order.orderNumber}
          </Badge>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <Badge className="uppercase font-bold text-xs">{order.status}</Badge>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ETA: 20m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Customer</div>
              <div className="font-bold text-sm text-white">{order.customerName}</div>
            </div>
            <a href={`tel:${order.customerPhone}`}>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call
              </Button>
            </a>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Pickup Address
              </div>
              <div className="text-slate-200 mt-0.5">{order.pickupAddress}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-cyan-400">
                Dropoff Address
              </div>
              <div className="text-white font-bold mt-0.5">{order.deliveryAddress}</div>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              order.deliveryAddress,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full h-11 text-xs gap-1.5 font-bold">
              <Navigation className="h-4 w-4" />
              Open GPS Navigation
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
