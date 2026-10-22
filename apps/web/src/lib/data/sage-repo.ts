import type {
  CreateIncidentInput,
  CreateIntegrationInput,
  CreateOrderInput,
  CreateWebhookSubscriptionInput,
  IncidentSeverity,
  IncidentStatus,
  IntegrationProvider,
  IntegrationStatus,
  InviteRiderInput,
  OrderPriority,
  OrderStatus,
  RiderStatus,
  Role,
  VehicleType,
} from "@sage/site-schema";

export interface OrderItem {
  id: string;
  organizationId: string;
  orderNumber: string;
  source: string;
  externalReference?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  status: OrderStatus;
  priority: OrderPriority;
  packageSize: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderVehicle?: VehicleType;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
}

export interface RiderItem {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  vehicleType: VehicleType;
  capacityScore: number;
  status: RiderStatus;
  currentLatitude: number;
  currentLongitude: number;
  batteryLevel: number;
  activeOrderCount: number;
  completedTodayCount: number;
  lastActiveAt: string;
}

export interface IntegrationItem {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  orderCount: number;
  lastSyncAt: string;
  lastSyncStatus: string;
  syncIntervalMinutes: number;
  endpointUrl?: string;
  errorMessage?: string;
}

export interface ApiCredentialItem {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface WebhookSubscriptionItem {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  failureCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface IncidentItem {
  id: string;
  organizationId: string;
  orderId?: string;
  orderNumber?: string;
  riderProfileId?: string;
  riderName?: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: string;
  aiDetected: boolean;
  aiConfidence?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface RecommendationItem {
  id: string;
  organizationId: string;
  incidentId?: string;
  orderId?: string;
  orderNumber?: string;
  title: string;
  explanation: string;
  actionType: "REASSIGN_RIDER" | "REROUTE" | "ADJUST_ETA" | "NOTIFY_CUSTOMER";
  targetRiderId?: string;
  targetRiderName?: string;
  confidence: number;
  estimatedTimeSavedMinutes: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXECUTED";
  createdAt: string;
}

export interface AuditEventItem {
  id: string;
  organizationId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

// In-Memory Data Store (simulated multi-tenant persistent storage)
class SageDataStore {
  private orders: OrderItem[] = [];
  private riders: RiderItem[] = [];
  private integrations: IntegrationItem[] = [];
  private apiCredentials: ApiCredentialItem[] = [];
  private webhooks: WebhookSubscriptionItem[] = [];
  private incidents: IncidentItem[] = [];
  private recommendations: RecommendationItem[] = [];
  private auditEvents: AuditEventItem[] = [];

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    const orgApex = "org_apex_logistics";
    const orgMetro = "org_metro_swift";

    // 1. Apex Riders
    this.riders.push(
      {
        id: "rdr_apex_1",
        organizationId: orgApex,
        name: "Marcus Thorne",
        phone: "+44 7700 900142",
        email: "marcus.rider@apexlogistics.com",
        role: "RIDER",
        vehicleType: "MOTORCYCLE",
        capacityScore: 85,
        status: "BUSY",
        currentLatitude: 51.5074,
        currentLongitude: -0.1278,
        batteryLevel: 92,
        activeOrderCount: 2,
        completedTodayCount: 9,
        lastActiveAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        id: "rdr_apex_2",
        organizationId: orgApex,
        name: "Amina Al-Mansoor",
        phone: "+44 7700 900213",
        email: "amina.rdr@apexlogistics.com",
        role: "RIDER",
        vehicleType: "BICYCLE",
        capacityScore: 60,
        status: "AVAILABLE",
        currentLatitude: 51.5134,
        currentLongitude: -0.1012,
        batteryLevel: 78,
        activeOrderCount: 0,
        completedTodayCount: 14,
        lastActiveAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "rdr_apex_3",
        organizationId: orgApex,
        name: "Lucas Meyer",
        phone: "+44 7700 900388",
        email: "lucas.m@apexlogistics.com",
        role: "RIDER",
        vehicleType: "VAN",
        capacityScore: 180,
        status: "BUSY",
        currentLatitude: 51.4921,
        currentLongitude: -0.1542,
        batteryLevel: 65,
        activeOrderCount: 3,
        completedTodayCount: 7,
        lastActiveAt: new Date(Date.now() - 1 * 60000).toISOString(),
      },
      {
        id: "rdr_apex_4",
        organizationId: orgApex,
        name: "Chloe Dupont",
        phone: "+44 7700 900499",
        email: "chloe.d@apexlogistics.com",
        role: "RIDER",
        vehicleType: "CAR",
        capacityScore: 120,
        status: "AVAILABLE",
        currentLatitude: 51.5225,
        currentLongitude: -0.0899,
        batteryLevel: 88,
        activeOrderCount: 0,
        completedTodayCount: 11,
        lastActiveAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: "rdr_apex_5",
        organizationId: orgApex,
        name: "Tariq Bradley",
        phone: "+44 7700 900677",
        email: "tariq.b@apexlogistics.com",
        role: "RIDER",
        vehicleType: "MOTORCYCLE",
        capacityScore: 90,
        status: "ON_BREAK",
        currentLatitude: 51.501,
        currentLongitude: -0.141,
        batteryLevel: 45,
        activeOrderCount: 0,
        completedTodayCount: 12,
        lastActiveAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: "rdr_apex_6",
        organizationId: orgApex,
        name: "Kenji Sato",
        phone: "+44 7700 900822",
        email: "kenji.s@apexlogistics.com",
        role: "RIDER",
        vehicleType: "MOTORCYCLE",
        capacityScore: 90,
        status: "OFFLINE",
        currentLatitude: 51.485,
        currentLongitude: -0.118,
        batteryLevel: 100,
        activeOrderCount: 0,
        completedTodayCount: 0,
        lastActiveAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
    );

    // MetroSwift Riders
    this.riders.push(
      {
        id: "rdr_metro_1",
        organizationId: orgMetro,
        name: "Leo Rivera",
        phone: "+1 415 555 0192",
        email: "leo.rider@metroswift.com",
        role: "RIDER",
        vehicleType: "VAN",
        capacityScore: 200,
        status: "BUSY",
        currentLatitude: 37.7749,
        currentLongitude: -122.4194,
        batteryLevel: 82,
        activeOrderCount: 2,
        completedTodayCount: 15,
        lastActiveAt: new Date().toISOString(),
      },
      {
        id: "rdr_metro_2",
        organizationId: orgMetro,
        name: "Maya Lin",
        phone: "+1 415 555 0184",
        email: "maya.l@metroswift.com",
        role: "RIDER",
        vehicleType: "BICYCLE",
        capacityScore: 50,
        status: "AVAILABLE",
        currentLatitude: 37.7833,
        currentLongitude: -122.4167,
        batteryLevel: 95,
        activeOrderCount: 0,
        completedTodayCount: 19,
        lastActiveAt: new Date().toISOString(),
      },
    );

    // 2. Orders for Apex
    this.orders.push(
      {
        id: "ord_apex_101",
        organizationId: orgApex,
        orderNumber: "ORD-9421",
        source: "SHOPIFY",
        externalReference: "SHPF-88421",
        customerName: "Eleanor Sterling",
        customerPhone: "+44 7700 900551",
        customerEmail: "eleanor.s@gmail.com",
        pickupAddress: "124 Oxford Street, London W1D 1LT",
        pickupLat: 51.5152,
        pickupLng: -0.1337,
        deliveryAddress: "45 Kensington High St, London W8 5EB",
        deliveryLat: 51.5015,
        deliveryLng: -0.1925,
        status: "IN_TRANSIT",
        priority: "RUSH",
        packageSize: "SMALL",
        assignedRiderId: "rdr_apex_1",
        assignedRiderName: "Marcus Thorne",
        assignedRiderVehicle: "MOTORCYCLE",
        estimatedDeliveryAt: new Date(Date.now() + 18 * 60000).toISOString(),
        notes: "Express medical supply. Direct handover to receptionist.",
        createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
      },
      {
        id: "ord_apex_102",
        organizationId: orgApex,
        orderNumber: "ORD-9422",
        source: "WOOCOMMERCE",
        externalReference: "WOO-3011",
        customerName: "Dr. Vikram Patel",
        customerPhone: "+44 7700 900552",
        customerEmail: "dr.patel@cityclinic.co.uk",
        pickupAddress: "88 Commercial Street, Shoreditch, E1 6LY",
        pickupLat: 51.5204,
        pickupLng: -0.0743,
        deliveryAddress: "12 St. Mary Axe, City of London, EC3A 8EP",
        deliveryLat: 51.5144,
        deliveryLng: -0.0803,
        status: "ASSIGNED",
        priority: "STANDARD",
        packageSize: "MEDIUM",
        assignedRiderId: "rdr_apex_3",
        assignedRiderName: "Lucas Meyer",
        assignedRiderVehicle: "VAN",
        estimatedDeliveryAt: new Date(Date.now() + 35 * 60000).toISOString(),
        notes: "Fragile optics equipment.",
        createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
      },
      {
        id: "ord_apex_103",
        organizationId: orgApex,
        orderNumber: "ORD-9423",
        source: "CUSTOM_API",
        externalReference: "API-7721",
        customerName: "Harriet Green",
        customerPhone: "+44 7700 900553",
        pickupAddress: "Unit 4, Docklands Hub, London E14 9GE",
        pickupLat: 51.505,
        pickupLng: -0.015,
        deliveryAddress: "78 Canary Wharf Way, London E14 5HP",
        deliveryLat: 51.5045,
        deliveryLng: -0.0195,
        status: "PENDING",
        priority: "EXPRESS",
        packageSize: "MEDIUM",
        estimatedDeliveryAt: new Date(Date.now() + 45 * 60000).toISOString(),
        notes: "Pending assignment. Requires bike or motorcycle for quick bypass.",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: "ord_apex_104",
        organizationId: orgApex,
        orderNumber: "ORD-9424",
        source: "SHOPIFY",
        externalReference: "SHPF-88429",
        customerName: "Oliver James",
        customerPhone: "+44 7700 900554",
        pickupAddress: "15 Piccadilly, London W1J 0TR",
        pickupLat: 51.5085,
        pickupLng: -0.138,
        deliveryAddress: "92 Fleet Street, London EC4Y 1DH",
        deliveryLat: 51.514,
        deliveryLng: -0.106,
        status: "FAILED",
        priority: "STANDARD",
        packageSize: "LARGE",
        assignedRiderId: "rdr_apex_1",
        assignedRiderName: "Marcus Thorne",
        assignedRiderVehicle: "MOTORCYCLE",
        estimatedDeliveryAt: new Date(Date.now() - 15 * 60000).toISOString(),
        notes: "Delayed due to vehicle breakdown on Westminster Bridge.",
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: "ord_apex_105",
        organizationId: orgApex,
        orderNumber: "ORD-9425",
        source: "MANUAL",
        customerName: "Sophie Martin",
        customerPhone: "+44 7700 900555",
        pickupAddress: "22 Regent Street, London SW1Y 4PH",
        pickupLat: 51.509,
        pickupLng: -0.134,
        deliveryAddress: "30 Victoria Street, London SW1H 0TL",
        deliveryLat: 51.498,
        deliveryLng: -0.133,
        status: "DELIVERED",
        priority: "STANDARD",
        packageSize: "SMALL",
        assignedRiderId: "rdr_apex_2",
        assignedRiderName: "Amina Al-Mansoor",
        assignedRiderVehicle: "BICYCLE",
        estimatedDeliveryAt: new Date(Date.now() - 30 * 60000).toISOString(),
        deliveredAt: new Date(Date.now() - 28 * 60000).toISOString(),
        notes: "Successfully delivered. Signed by recipient.",
        createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
      },
    );

    // 3. Integrations for Apex
    this.integrations.push(
      {
        id: "int_apex_shopify",
        organizationId: orgApex,
        provider: "SHOPIFY",
        name: "Main Shopify Storefront",
        status: "ACTIVE",
        orderCount: 1420,
        lastSyncAt: new Date(Date.now() - 3 * 60000).toISOString(),
        lastSyncStatus: "SUCCESS (200 OK)",
        syncIntervalMinutes: 5,
        endpointUrl: "https://apex-direct.myshopify.com/admin/api/2024-01",
      },
      {
        id: "int_apex_woo",
        organizationId: orgApex,
        provider: "WOOCOMMERCE",
        name: "B2B Wholesale Portal (WooCommerce)",
        status: "ACTIVE",
        orderCount: 618,
        lastSyncAt: new Date(Date.now() - 7 * 60000).toISOString(),
        lastSyncStatus: "SUCCESS (200 OK)",
        syncIntervalMinutes: 10,
        endpointUrl: "https://wholesale.apexlogistics.co.uk/wp-json/wc/v3",
      },
      {
        id: "int_apex_onfleet",
        organizationId: orgApex,
        provider: "ONFLEET",
        name: "Onfleet Fleet Sync Adapter",
        status: "ACTIVE",
        orderCount: 389,
        lastSyncAt: new Date(Date.now() - 2 * 60000).toISOString(),
        lastSyncStatus: "SUCCESS (200 OK)",
        syncIntervalMinutes: 2,
        endpointUrl: "https://onfleet.com/api/v2",
      },
      {
        id: "int_apex_shipstation",
        organizationId: orgApex,
        provider: "SHIPSTATION",
        name: "ShipStation Multi-Carrier Bridge",
        status: "INACTIVE",
        orderCount: 95,
        lastSyncAt: new Date(Date.now() - 1440 * 60000).toISOString(),
        lastSyncStatus: "PAUSED",
        syncIntervalMinutes: 15,
        endpointUrl: "https://ssapi.shipstation.com",
      },
      {
        id: "int_apex_custom",
        organizationId: orgApex,
        provider: "CUSTOM_WEBHOOK",
        name: "Enterprise ERP Order Ingest Webhook",
        status: "ACTIVE",
        orderCount: 284,
        lastSyncAt: new Date(Date.now() - 1 * 60000).toISOString(),
        lastSyncStatus: "HEALTHY (Listening on /api/v1/webhooks/orders)",
        syncIntervalMinutes: 1,
        endpointUrl: "https://api.sage.logistics/v1/webhooks/apex-logistics",
      },
    );

    // 4. API Credentials for Apex
    this.apiCredentials.push(
      {
        id: "cred_apex_1",
        organizationId: orgApex,
        name: "Production Dispatcher Bot",
        keyPrefix: "sage_live_948a",
        scopes: ["orders:read", "orders:write", "riders:read", "incidents:write"],
        lastUsedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
        isRevoked: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "cred_apex_2",
        organizationId: orgApex,
        name: "Warehouse Inventory Webhook",
        keyPrefix: "sage_live_21bf",
        scopes: ["orders:read", "integrations:read"],
        lastUsedAt: new Date(Date.now() - 24 * 60000).toISOString(),
        expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
        isRevoked: false,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    );

    // 5. Webhook Subscriptions for Apex
    this.webhooks.push(
      {
        id: "wh_apex_1",
        organizationId: orgApex,
        url: "https://ops.apexlogistics.com/webhooks/sage-events",
        events: ["order.delayed", "order.delivered", "incident.raised"],
        secret: "whsec_99a8120bcdf428",
        isActive: true,
        failureCount: 0,
        lastTriggeredAt: new Date(Date.now() - 8 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: "wh_apex_2",
        organizationId: orgApex,
        url: "https://slack.corp.apexlogistics.com/services/T00/B00/X00",
        events: ["incident.raised", "recommendation.generated"],
        secret: "whsec_77b31499aa2011",
        isActive: true,
        failureCount: 0,
        lastTriggeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    );

    // 6. Incidents for Apex
    this.incidents.push(
      {
        id: "inc_apex_1",
        organizationId: orgApex,
        orderId: "ord_apex_104",
        orderNumber: "ORD-9424",
        riderProfileId: "rdr_apex_1",
        riderName: "Marcus Thorne",
        title: "Motorcycle Mechanical Breakdown",
        description:
          "Rider reported engine stall and flat rear tire near Westminster Bridge. Order ORD-9424 cannot proceed without reassignment.",
        severity: "CRITICAL",
        status: "OPEN",
        category: "VEHICLE_BREAKDOWN",
        aiDetected: true,
        aiConfidence: 0.96,
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: "inc_apex_2",
        organizationId: orgApex,
        orderId: "ord_apex_101",
        orderNumber: "ORD-9421",
        title: "Severe Downtown Road Closure & Gridlock",
        description:
          "Emergency construction on Kensington High Street causing 25-minute ETA deviation. Traffic flow rate below 5 km/h.",
        severity: "HIGH",
        status: "INVESTIGATING",
        category: "TRAFFIC_DELAY",
        aiDetected: true,
        aiConfidence: 0.91,
        createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      },
      {
        id: "inc_apex_3",
        organizationId: orgApex,
        orderId: "ord_apex_102",
        orderNumber: "ORD-9422",
        riderProfileId: "rdr_apex_3",
        riderName: "Lucas Meyer",
        title: "Customer Address Delivery Note Clarification",
        description: "Delivery unit buzzer broken. Customer requesting back alley gate entrance code.",
        severity: "LOW",
        status: "RESOLVED",
        category: "CUSTOMER_UNAVAILABLE",
        aiDetected: false,
        createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
        resolvedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      },
    );

    // 7. AI Recommendations for Apex (powered by @sage/ai-engine principles)
    this.recommendations.push(
      {
        id: "rec_apex_1",
        organizationId: orgApex,
        incidentId: "inc_apex_1",
        orderId: "ord_apex_104",
        orderNumber: "ORD-9424",
        title: "Immediate Reassignment: Transfer ORD-9424 to Chloe Dupont",
        explanation:
          "Rider Chloe Dupont (Car) is currently AVAILABLE and positioned 1.1 km away at Piccadilly. Reassignment resolves delay within 8 minutes and preserves order SLA.",
        actionType: "REASSIGN_RIDER",
        targetRiderId: "rdr_apex_4",
        targetRiderName: "Chloe Dupont",
        confidence: 0.94,
        estimatedTimeSavedMinutes: 24,
        status: "PENDING",
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: "rec_apex_2",
        organizationId: orgApex,
        incidentId: "inc_apex_2",
        orderId: "ord_apex_101",
        orderNumber: "ORD-9421",
        title: "Road-Aware Beam-Search Reroute via Bayswater Corridor",
        explanation:
          "Algorithmic matrix optimization identified an alternate bypass via Bayswater Road. Avoids Kensington closure and reduces estimated duration by 16 minutes.",
        actionType: "REROUTE",
        confidence: 0.89,
        estimatedTimeSavedMinutes: 16,
        status: "PENDING",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: "rec_apex_3",
        organizationId: orgApex,
        orderId: "ord_apex_103",
        orderNumber: "ORD-9423",
        title: "Automated Priority Dispatch to Amina Al-Mansoor",
        explanation:
          "Amina (Bicycle) has 0 active assignments, 78% battery, and is 900m from Docklands Hub. Direct dispatch avoids standard queuing latency.",
        actionType: "REASSIGN_RIDER",
        targetRiderId: "rdr_apex_2",
        targetRiderName: "Amina Al-Mansoor",
        confidence: 0.97,
        estimatedTimeSavedMinutes: 12,
        status: "PENDING",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    );

    // 8. Audit Events
    this.auditEvents.push(
      {
        id: "aud_apex_1",
        organizationId: orgApex,
        actorName: "Sarah Chen",
        actorRole: "DISPATCHER",
        action: "ORDER_ASSIGNED",
        entityType: "ORDER",
        entityId: "ord_apex_101",
        details: "Assigned order ORD-9421 to rider Marcus Thorne.",
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      },
      {
        id: "aud_apex_2",
        organizationId: orgApex,
        actorName: "Sage AI Engine",
        actorRole: "SYSTEM",
        action: "INCIDENT_DETECTED",
        entityType: "INCIDENT",
        entityId: "inc_apex_1",
        details: "Detected vehicle stall anomaly from rider telemetry (speed dropped to 0 km/h).",
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: "aud_apex_3",
        organizationId: orgApex,
        actorName: "Shopify Sync Daemon",
        actorRole: "INTEGRATION",
        action: "ORDERS_INGESTED",
        entityType: "INTEGRATION",
        entityId: "int_apex_shopify",
        details: "Synced 14 new delivery orders via Shopify Webhook hook_992.",
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
      },
    );
  }

  // Repository Operations with Strict Tenant Isolation
  getOrders(orgId: string, statusFilter?: string): OrderItem[] {
    return this.orders.filter(
      (o) => o.organizationId === orgId && (!statusFilter || statusFilter === "ALL" || o.status === statusFilter),
    );
  }

  getOrder(orgId: string, orderId: string): OrderItem | undefined {
    return this.orders.find((o) => o.organizationId === orgId && o.id === orderId);
  }

  createOrder(orgId: string, input: CreateOrderInput): OrderItem {
    const newOrder: OrderItem = {
      id: `ord_${Date.now()}`,
      organizationId: orgId,
      orderNumber: input.orderNumber,
      source: input.source || "MANUAL",
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || undefined,
      pickupAddress: input.pickupAddress,
      pickupLat: input.pickupLat || 51.5074 + (Math.random() - 0.5) * 0.05,
      pickupLng: input.pickupLng || -0.1278 + (Math.random() - 0.5) * 0.05,
      deliveryAddress: input.deliveryAddress,
      deliveryLat: input.deliveryLat || 51.5074 + (Math.random() - 0.5) * 0.05,
      deliveryLng: input.deliveryLng || -0.1278 + (Math.random() - 0.5) * 0.05,
      status: "PENDING",
      priority: input.priority,
      packageSize: input.packageSize || "MEDIUM",
      estimatedDeliveryAt: new Date(Date.now() + 45 * 60000).toISOString(),
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.logAudit(orgId, "System Operator", "DISPATCHER", "ORDER_CREATED", "ORDER", newOrder.id, `Created manual order ${newOrder.orderNumber}`);
    return newOrder;
  }

  updateOrderStatus(orgId: string, orderId: string, status: OrderStatus): boolean {
    const order = this.getOrder(orgId, orderId);
    if (!order) return false;
    order.status = status;
    if (status === "DELIVERED") {
      order.deliveredAt = new Date().toISOString();
    }
    this.logAudit(orgId, "System Operator", "DISPATCHER", "ORDER_STATUS_UPDATED", "ORDER", orderId, `Updated status to ${status}`);
    return true;
  }

  assignRider(orgId: string, orderId: string, riderId: string): boolean {
    const order = this.getOrder(orgId, orderId);
    const rider = this.getRider(orgId, riderId);
    if (!order || !rider) return false;

    order.assignedRiderId = rider.id;
    order.assignedRiderName = rider.name;
    order.assignedRiderVehicle = rider.vehicleType;
    order.status = "ASSIGNED";

    rider.activeOrderCount += 1;
    rider.status = "BUSY";

    this.logAudit(
      orgId,
      "Sarah Chen",
      "DISPATCHER",
      "RIDER_ASSIGNED",
      "ORDER",
      orderId,
      `Assigned order ${order.orderNumber} to ${rider.name} (${rider.vehicleType})`,
    );
    return true;
  }

  getRiders(orgId: string, statusFilter?: string): RiderItem[] {
    return this.riders.filter(
      (r) => r.organizationId === orgId && (!statusFilter || statusFilter === "ALL" || r.status === statusFilter),
    );
  }

  getRider(orgId: string, riderId: string): RiderItem | undefined {
    return this.riders.find((r) => r.organizationId === orgId && r.id === riderId);
  }

  inviteRider(orgId: string, input: InviteRiderInput): RiderItem {
    const newRider: RiderItem = {
      id: `rdr_${Date.now()}`,
      organizationId: orgId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      role: input.role,
      vehicleType: input.vehicleType,
      capacityScore: input.capacityScore,
      status: "AVAILABLE",
      currentLatitude: 51.5074 + (Math.random() - 0.5) * 0.04,
      currentLongitude: -0.1278 + (Math.random() - 0.5) * 0.04,
      batteryLevel: 100,
      activeOrderCount: 0,
      completedTodayCount: 0,
      lastActiveAt: new Date().toISOString(),
    };

    this.riders.unshift(newRider);
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "RIDER_INVITED", "RIDER", newRider.id, `Invited new rider ${newRider.name}`);
    return newRider;
  }

  updateRiderStatus(orgId: string, riderId: string, status: RiderStatus): boolean {
    const rider = this.getRider(orgId, riderId);
    if (!rider) return false;
    rider.status = status;
    rider.lastActiveAt = new Date().toISOString();
    return true;
  }

  updateRiderTelemetry(orgId: string, riderId: string, lat: number, lng: number, battery: number): boolean {
    const rider = this.getRider(orgId, riderId);
    if (!rider) return false;
    rider.currentLatitude = lat;
    rider.currentLongitude = lng;
    rider.batteryLevel = battery;
    rider.lastActiveAt = new Date().toISOString();
    return true;
  }

  getIntegrations(orgId: string): IntegrationItem[] {
    return this.integrations.filter((i) => i.organizationId === orgId);
  }

  createIntegration(orgId: string, input: CreateIntegrationInput): IntegrationItem {
    const newIntegration: IntegrationItem = {
      id: `int_${Date.now()}`,
      organizationId: orgId,
      provider: input.provider,
      name: input.name,
      status: "ACTIVE",
      orderCount: 0,
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: "CONNECTED",
      syncIntervalMinutes: input.syncIntervalMinutes,
      endpointUrl: input.endpointUrl || undefined,
    };
    this.integrations.push(newIntegration);
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "INTEGRATION_CREATED", "INTEGRATION", newIntegration.id, `Connected ${newIntegration.name}`);
    return newIntegration;
  }

  toggleIntegration(orgId: string, intId: string): boolean {
    const item = this.integrations.find((i) => i.organizationId === orgId && i.id === intId);
    if (!item) return false;
    item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "INTEGRATION_TOGGLED", "INTEGRATION", intId, `Set status to ${item.status}`);
    return true;
  }

  syncIntegration(orgId: string, intId: string): boolean {
    const item = this.integrations.find((i) => i.organizationId === orgId && i.id === intId);
    if (!item) return false;
    item.lastSyncAt = new Date().toISOString();
    item.lastSyncStatus = "SUCCESS (200 OK - 8 new orders ingested)";
    item.orderCount += 8;
    this.logAudit(orgId, "System Scheduler", "SYSTEM", "INTEGRATION_SYNCED", "INTEGRATION", intId, `Manually triggered sync for ${item.name}`);
    return true;
  }

  getApiCredentials(orgId: string): ApiCredentialItem[] {
    return this.apiCredentials.filter((c) => c.organizationId === orgId);
  }

  createApiCredential(orgId: string, name: string, scopes: string[]): ApiCredentialItem {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const newCred: ApiCredentialItem = {
      id: `cred_${Date.now()}`,
      organizationId: orgId,
      name,
      keyPrefix: `sage_live_${randomHex}`,
      scopes,
      lastUsedAt: "Never",
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };
    this.apiCredentials.push(newCred);
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "API_KEY_GENERATED", "CREDENTIAL", newCred.id, `Generated scoped key: ${name}`);
    return newCred;
  }

  revokeApiCredential(orgId: string, credId: string): boolean {
    const cred = this.apiCredentials.find((c) => c.organizationId === orgId && c.id === credId);
    if (!cred) return false;
    cred.isRevoked = true;
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "API_KEY_REVOKED", "CREDENTIAL", credId, `Revoked key: ${cred.name}`);
    return true;
  }

  getWebhooks(orgId: string): WebhookSubscriptionItem[] {
    return this.webhooks.filter((w) => w.organizationId === orgId);
  }

  createWebhook(orgId: string, input: CreateWebhookSubscriptionInput): WebhookSubscriptionItem {
    const item: WebhookSubscriptionItem = {
      id: `wh_${Date.now()}`,
      organizationId: orgId,
      url: input.url,
      events: input.events,
      secret: input.secret,
      isActive: true,
      failureCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.webhooks.push(item);
    this.logAudit(orgId, "Alex Vance", "ORG_ADMIN", "WEBHOOK_CREATED", "WEBHOOK", item.id, `Registered webhook endpoint: ${item.url}`);
    return item;
  }

  triggerTestWebhook(orgId: string, whId: string): { success: boolean; event: string; status: number } {
    const wh = this.webhooks.find((w) => w.organizationId === orgId && w.id === whId);
    if (!wh) return { success: false, event: "unknown", status: 404 };
    wh.lastTriggeredAt = new Date().toISOString();
    return { success: true, event: wh.events[0] || "ping", status: 200 };
  }

  getIncidents(orgId: string, statusFilter?: string): IncidentItem[] {
    return this.incidents.filter(
      (inc) =>
        inc.organizationId === orgId && (!statusFilter || statusFilter === "ALL" || inc.status === statusFilter),
    );
  }

  createIncident(orgId: string, input: CreateIncidentInput): IncidentItem {
    const order = input.orderId ? this.getOrder(orgId, input.orderId) : undefined;
    const rider = input.riderProfileId ? this.getRider(orgId, input.riderProfileId) : undefined;

    const newIncident: IncidentItem = {
      id: `inc_${Date.now()}`,
      organizationId: orgId,
      orderId: input.orderId || undefined,
      orderNumber: order?.orderNumber,
      riderProfileId: input.riderProfileId || undefined,
      riderName: rider?.name,
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: "OPEN",
      category: input.category,
      aiDetected: false,
      createdAt: new Date().toISOString(),
    };

    this.incidents.unshift(newIncident);
    this.logAudit(orgId, "Sarah Chen", "DISPATCHER", "INCIDENT_RAISED", "INCIDENT", newIncident.id, `Raised incident: ${newIncident.title}`);
    return newIncident;
  }

  resolveIncident(orgId: string, incidentId: string): boolean {
    const inc = this.incidents.find((i) => i.organizationId === orgId && i.id === incidentId);
    if (!inc) return false;
    inc.status = "RESOLVED";
    inc.resolvedAt = new Date().toISOString();
    this.logAudit(orgId, "Sarah Chen", "DISPATCHER", "INCIDENT_RESOLVED", "INCIDENT", incidentId, `Marked incident resolved`);
    return true;
  }

  getRecommendations(orgId: string): RecommendationItem[] {
    return this.recommendations.filter((r) => r.organizationId === orgId);
  }

  applyRecommendation(orgId: string, recId: string): boolean {
    const rec = this.recommendations.find((r) => r.organizationId === orgId && r.id === recId);
    if (!rec) return false;

    if (rec.actionType === "REASSIGN_RIDER" && rec.orderId && rec.targetRiderId) {
      this.assignRider(orgId, rec.orderId, rec.targetRiderId);
    }

    if (rec.incidentId) {
      this.resolveIncident(orgId, rec.incidentId);
    }

    rec.status = "EXECUTED";
    this.logAudit(orgId, "Sarah Chen", "DISPATCHER", "AI_RECOMMENDATION_EXECUTED", "RECOMMENDATION", recId, `Approved & executed recommendation: ${rec.title}`);
    return true;
  }

  rejectRecommendation(orgId: string, recId: string): boolean {
    const rec = this.recommendations.find((r) => r.organizationId === orgId && r.id === recId);
    if (!rec) return false;
    rec.status = "REJECTED";
    this.logAudit(orgId, "Sarah Chen", "DISPATCHER", "AI_RECOMMENDATION_REJECTED", "RECOMMENDATION", recId, `Dispatcher rejected AI recommendation`);
    return true;
  }

  getAuditEvents(orgId: string): AuditEventItem[] {
    return this.auditEvents.filter((a) => a.organizationId === orgId);
  }

  private logAudit(
    orgId: string,
    actorName: string,
    actorRole: string,
    action: string,
    entityType: string,
    entityId: string,
    details: string,
  ) {
    this.auditEvents.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  getDashboardMetrics(orgId: string) {
    const tenantOrders = this.orders.filter((o) => o.organizationId === orgId);
    const tenantRiders = this.riders.filter((r) => r.organizationId === orgId);
    const tenantIncidents = this.incidents.filter((i) => i.organizationId === orgId);
    const tenantIntegrations = this.integrations.filter((i) => i.organizationId === orgId);

    const activeDeliveries = tenantOrders.filter((o) => o.status === "IN_TRANSIT").length;
    const pendingAssignments = tenantOrders.filter((o) => o.status === "PENDING").length;
    const delayedDeliveries = tenantOrders.filter((o) => o.status === "FAILED").length;
    const availableRiders = tenantRiders.filter((r) => r.status === "AVAILABLE").length;
    const busyRiders = tenantRiders.filter((r) => r.status === "BUSY").length;
    const openIncidents = tenantIncidents.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING").length;
    const healthyIntegrations = tenantIntegrations.filter((i) => i.status === "ACTIVE").length;

    return {
      activeDeliveries,
      pendingAssignments,
      delayedDeliveries,
      availableRiders,
      busyRiders,
      totalRiders: tenantRiders.length,
      openIncidents,
      healthyIntegrations,
      totalIntegrations: tenantIntegrations.length,
      slaPercentage: 98.4,
    };
  }
}

// Global Singleton for Next.js App
const globalForSage = globalThis as unknown as { sageRepo?: SageDataStore };
export const sageRepo = globalForSage.sageRepo || new SageDataStore();
if (process.env.NODE_ENV !== "production") globalForSage.sageRepo = sageRepo;
