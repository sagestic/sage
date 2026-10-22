import type {
  CreateIncidentInput,
  CreateIntegrationInput,
  CreateOrderInput,
  CreateWebhookSubscriptionInput,
  IncidentSeverity,
  IncidentStatus,
  IngestOrderInput,
  IntegrationProvider,
  IntegrationStatus,
  InviteRiderInput,
  OrderPriority,
  OrderStatus,
  RiderStatus,
  Role,
  VehicleType,
  WebhookEvent,
} from "@sage/site-schema";

export interface OrderItem {
  id: string;
  organizationId: string;
  orderNumber: string;
  source: string;
  externalReference?: string;
  idempotencyKey?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  requiresGeocoding?: boolean;
  status: OrderStatus;
  priority: OrderPriority;
  packageSize: string;
  packageWeightKg?: number;
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderVehicle?: VehicleType;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RiderItem {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  employeeId?: string;
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

export interface RiderInvitationItem {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  employeeId?: string;
  token: string;
  role: Role;
  vehicleType: VehicleType;
  capacityScore: number;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
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
  private invitations: RiderInvitationItem[] = [];
  private integrations: IntegrationItem[] = [];
  private apiCredentials: ApiCredentialItem[] = [];
  private webhooks: WebhookSubscriptionItem[] = [];
  private incidents: IncidentItem[] = [];
  private recommendations: RecommendationItem[] = [];
  private auditEvents: AuditEventItem[] = [];
  private idempotencyCache: Set<string> = new Set();

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
        employeeId: "EMP-901",
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
        employeeId: "EMP-902",
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
        employeeId: "EMP-903",
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
        employeeId: "EMP-904",
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
    );

    // 2. Demo Invitations
    this.invitations.push({
      id: "inv_apex_demo",
      organizationId: orgApex,
      name: "Jamie Vance",
      phone: "+44 7700 900999",
      email: "jamie.rider@example.com",
      employeeId: "EMP-909",
      token: "demo-invitation-token-12345",
      role: "RIDER",
      vehicleType: "MOTORCYCLE",
      capacityScore: 90,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    // 3. Orders for Apex
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ord_apex_103",
        organizationId: orgApex,
        orderNumber: "ORD-9423",
        source: "WEBSITE_API",
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      },
    );

    // 4. Integrations
    this.integrations.push(
      {
        id: "int_apex_api",
        organizationId: orgApex,
        provider: "WEBSITE_API",
        name: "Website REST Ingestion Gateway",
        status: "ACTIVE",
        orderCount: 1890,
        lastSyncAt: new Date(Date.now() - 1 * 60000).toISOString(),
        lastSyncStatus: "ACTIVE (Listening on /api/v1/orders)",
        syncIntervalMinutes: 1,
        endpointUrl: "/api/v1/orders",
      },
      {
        id: "int_apex_shopify",
        organizationId: orgApex,
        provider: "SHOPIFY",
        name: "Shopify Storefront Webhook",
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
        name: "WooCommerce B2B Portal",
        status: "ACTIVE",
        orderCount: 618,
        lastSyncAt: new Date(Date.now() - 7 * 60000).toISOString(),
        lastSyncStatus: "SUCCESS (200 OK)",
        syncIntervalMinutes: 10,
        endpointUrl: "https://wholesale.apexlogistics.co.uk/wp-json/wc/v3",
      },
      {
        id: "int_apex_whatsapp",
        organizationId: orgApex,
        provider: "WHATSAPP",
        name: "WhatsApp Business Ingestion Webhook",
        status: "ACTIVE",
        orderCount: 42,
        lastSyncAt: new Date(Date.now() - 18 * 60000).toISOString(),
        lastSyncStatus: "LISTENING (/api/v1/webhooks/whatsapp)",
        syncIntervalMinutes: 1,
        endpointUrl: "/api/v1/webhooks/whatsapp",
      },
      {
        id: "int_apex_csv",
        organizationId: orgApex,
        provider: "CSV_IMPORT",
        name: "Batch CSV / Spreadsheet Importer",
        status: "ACTIVE",
        orderCount: 310,
        lastSyncAt: new Date(Date.now() - 120 * 60000).toISOString(),
        lastSyncStatus: "IDLE (Ready for file drop)",
        syncIntervalMinutes: 60,
      },
    );

    // 5. API Credentials
    this.apiCredentials.push(
      {
        id: "cred_apex_1",
        organizationId: orgApex,
        name: "Production Dispatcher Bot",
        keyPrefix: "sage_live_948a",
        scopes: [
          "orders:read",
          "orders:write",
          "riders:read",
          "incidents:read",
          "incidents:write",
          "recommendations:read",
        ],
        lastUsedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
        isRevoked: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    );

    // 6. Webhooks
    this.webhooks.push(
      {
        id: "wh_apex_1",
        organizationId: orgApex,
        url: "https://ops.apexlogistics.com/webhooks/sage-events",
        events: [
          "order.created",
          "order.updated",
          "delivery.assigned",
          "delivery.status_updated",
          "incident.created",
          "recommendation.created",
        ],
        secret: "whsec_99a8120bcdf428",
        isActive: true,
        failureCount: 0,
        lastTriggeredAt: new Date(Date.now() - 8 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    );

    // 7. Incidents
    this.incidents.push({
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
    });

    // 8. Recommendations
    this.recommendations.push({
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
    });

    // 9. Audit Events
    this.auditEvents.push({
      id: "aud_apex_1",
      organizationId: orgApex,
      actorName: "System Initialization",
      actorRole: "SYSTEM",
      action: "TENANT_PROVISIONED",
      entityType: "ORGANIZATION",
      entityId: orgApex,
      details: "Initial multi-tenant operational data established.",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    });
  }

  // Orders
  getOrders(orgId: string, statusFilter?: string): OrderItem[] {
    return this.orders.filter(
      (o) =>
        o.organizationId === orgId &&
        (!statusFilter || statusFilter === "ALL" || o.status === statusFilter),
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
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.logAudit(
      orgId,
      "Dispatcher / UI",
      "DISPATCHER",
      "ORDER_CREATED",
      "ORDER",
      newOrder.id,
      `Created manual order ${newOrder.orderNumber}`,
    );
    this.dispatchWebhookEvent(orgId, "order.created", {
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      source: newOrder.source,
      status: newOrder.status,
    });
    return newOrder;
  }

  // Canonical Order Ingestion with Idempotency & Coordinate Validation
  ingestCanonicalOrder(orgId: string, input: IngestOrderInput): {
    order: OrderItem;
    isDuplicate: boolean;
  } {
    // Check Idempotency Key or External Order ID
    if (input.idempotencyKey && this.idempotencyCache.has(`${orgId}:${input.idempotencyKey}`)) {
      const existing = this.orders.find(
        (o) => o.organizationId === orgId && o.idempotencyKey === input.idempotencyKey,
      );
      if (existing) return { order: existing, isDuplicate: true };
    }

    if (input.externalOrderId) {
      const existing = this.orders.find(
        (o) =>
          o.organizationId === orgId &&
          o.source === input.source &&
          o.externalReference === input.externalOrderId,
      );
      if (existing) return { order: existing, isDuplicate: true };
    }

    // Determine coordinate validity or geocoding requirement
    const hasValidPickupCoords =
      input.pickupCoordinates &&
      input.pickupCoordinates.latitude >= -90 &&
      input.pickupCoordinates.latitude <= 90 &&
      input.pickupCoordinates.longitude >= -180 &&
      input.pickupCoordinates.longitude <= 180;

    const hasValidDropoffCoords =
      input.dropoffCoordinates &&
      input.dropoffCoordinates.latitude >= -90 &&
      input.dropoffCoordinates.latitude <= 90 &&
      input.dropoffCoordinates.longitude >= -180 &&
      input.dropoffCoordinates.longitude <= 180;

    const requiresGeocoding = !hasValidPickupCoords || !hasValidDropoffCoords;

    const orderNumber = `ORD-${Date.now().toString().slice(-5)}`;
    const newOrder: OrderItem = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      orderNumber,
      source: input.source,
      externalReference: input.externalOrderId,
      idempotencyKey: input.idempotencyKey,
      customerName: input.recipientName,
      customerPhone: input.recipientPhone,
      customerEmail: input.recipientEmail || undefined,
      pickupAddress: input.pickupAddress,
      pickupLat: hasValidPickupCoords ? input.pickupCoordinates?.latitude : undefined,
      pickupLng: hasValidPickupCoords ? input.pickupCoordinates?.longitude : undefined,
      deliveryAddress: input.dropoffAddress,
      deliveryLat: hasValidDropoffCoords ? input.dropoffCoordinates?.latitude : undefined,
      deliveryLng: hasValidDropoffCoords ? input.dropoffCoordinates?.longitude : undefined,
      requiresGeocoding,
      status: "PENDING",
      priority: input.priority,
      packageSize: input.packageSize || "MEDIUM",
      packageWeightKg: input.packageWeightKg,
      estimatedDeliveryAt:
        input.deliveryDeadline || new Date(Date.now() + 60 * 60000).toISOString(),
      notes: input.notes,
      metadata: input.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (input.idempotencyKey) {
      this.idempotencyCache.add(`${orgId}:${input.idempotencyKey}`);
    }

    this.orders.unshift(newOrder);

    this.logAudit(
      orgId,
      `API (${input.source})`,
      "INTEGRATION",
      "ORDER_INGESTED",
      "ORDER",
      newOrder.id,
      `Canonical ingestion for ${newOrder.orderNumber} via ${input.source}`,
    );

    this.dispatchWebhookEvent(orgId, "order.created", {
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      source: newOrder.source,
      status: newOrder.status,
    });

    return { order: newOrder, isDuplicate: false };
  }

  ingestBatchOrders(
    orgId: string,
    rows: Array<{
      recipientName: string;
      recipientPhone: string;
      recipientEmail?: string;
      pickupAddress: string;
      dropoffAddress: string;
      priority?: "STANDARD" | "EXPRESS" | "RUSH";
      externalOrderId?: string;
      packageSize?: string;
      notes?: string;
    }>,
  ): { successCount: number; duplicateCount: number; orders: OrderItem[] } {
    let successCount = 0;
    let duplicateCount = 0;
    const orders: OrderItem[] = [];

    for (const row of rows) {
      const res = this.ingestCanonicalOrder(orgId, {
        source: "CSV_IMPORT",
        externalOrderId: row.externalOrderId,
        recipientName: row.recipientName,
        recipientPhone: row.recipientPhone,
        recipientEmail: row.recipientEmail,
        pickupAddress: row.pickupAddress,
        dropoffAddress: row.dropoffAddress,
        priority: row.priority || "STANDARD",
        packageSize: row.packageSize || "MEDIUM",
        notes: row.notes,
      });

      if (res.isDuplicate) {
        duplicateCount++;
      } else {
        successCount++;
        orders.push(res.order);
      }
    }

    this.logAudit(
      orgId,
      "CSV Import Engine",
      "DISPATCHER",
      "BATCH_ORDERS_IMPORTED",
      "ORDER_BATCH",
      `batch_${Date.now()}`,
      `Imported ${successCount} orders (${duplicateCount} duplicates skipped) from CSV`,
    );

    return { successCount, duplicateCount, orders };
  }

  updateOrderStatus(orgId: string, orderId: string, status: OrderStatus): boolean {
    const order = this.getOrder(orgId, orderId);
    if (!order) return false;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "DELIVERED") {
      order.deliveredAt = new Date().toISOString();
    }
    this.logAudit(
      orgId,
      "Dispatcher / Rider",
      "DISPATCHER",
      "ORDER_STATUS_UPDATED",
      "ORDER",
      orderId,
      `Order ${order.orderNumber} status changed to ${status}`,
    );
    this.dispatchWebhookEvent(orgId, "order.updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      deliveredAt: order.deliveredAt,
    });
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
    order.updatedAt = new Date().toISOString();

    rider.activeOrderCount += 1;
    rider.status = "BUSY";

    this.logAudit(
      orgId,
      "Dispatcher / AI",
      "DISPATCHER",
      "RIDER_ASSIGNED",
      "ORDER",
      orderId,
      `Assigned order ${order.orderNumber} to ${rider.name} (${rider.vehicleType})`,
    );

    this.dispatchWebhookEvent(orgId, "delivery.assigned", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      riderId: rider.id,
      riderName: rider.name,
    });

    return true;
  }

  // Riders
  getRiders(orgId: string, statusFilter?: string): RiderItem[] {
    return this.riders.filter(
      (r) =>
        r.organizationId === orgId &&
        (!statusFilter || statusFilter === "ALL" || r.status === statusFilter),
    );
  }

  getRider(orgId: string, riderId: string): RiderItem | undefined {
    return this.riders.find((r) => r.organizationId === orgId && r.id === riderId);
  }

  createRiderInvitation(
    orgId: string,
    input: InviteRiderInput,
  ): { invitation: RiderInvitationItem; rawInviteUrl: string } {
    const rawToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = new Date(Date.now() + 72 * 3600000).toISOString();

    const invitation: RiderInvitationItem = {
      id: `inv_id_${Date.now()}`,
      organizationId: orgId,
      name: input.name,
      phone: input.phone,
      email: input.email || undefined,
      employeeId: input.employeeId || undefined,
      token: rawToken,
      role: input.role,
      vehicleType: input.vehicleType,
      capacityScore: input.capacityScore,
      status: "PENDING",
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.invitations.unshift(invitation);

    // Never log raw tokens!
    this.logAudit(
      orgId,
      "Org Admin",
      "ORG_ADMIN",
      "RIDER_INVITED",
      "INVITATION",
      invitation.id,
      `Issued single-use invitation for courier ${input.name} (${input.phone})`,
    );

    return {
      invitation,
      rawInviteUrl: `/invite/${rawToken}`,
    };
  }

  getInvitationByToken(token: string): RiderInvitationItem | undefined {
    const inv = this.invitations.find((i) => i.token === token);
    if (!inv) return undefined;
    if (new Date() > new Date(inv.expiresAt)) {
      inv.status = "EXPIRED";
    }
    return inv;
  }

  acceptRiderInvitation(
    token: string,
    _passwordHash: string,
  ): { success: boolean; rider?: RiderItem; error?: string } {
    const inv = this.getInvitationByToken(token);
    if (!inv) return { success: false, error: "Invitation not found" };
    if (inv.status !== "PENDING") {
      return { success: false, error: `Invitation is ${inv.status.toLowerCase()}` };
    }

    inv.status = "ACCEPTED";

    const newRider: RiderItem = {
      id: `rdr_${Date.now()}`,
      organizationId: inv.organizationId,
      name: inv.name,
      phone: inv.phone,
      email: inv.email,
      employeeId: inv.employeeId,
      role: "RIDER",
      vehicleType: inv.vehicleType,
      capacityScore: inv.capacityScore,
      status: "AVAILABLE",
      currentLatitude: 51.5074,
      currentLongitude: -0.1278,
      batteryLevel: 100,
      activeOrderCount: 0,
      completedTodayCount: 0,
      lastActiveAt: new Date().toISOString(),
    };

    this.riders.unshift(newRider);

    this.logAudit(
      inv.organizationId,
      newRider.name,
      "RIDER",
      "INVITATION_ACCEPTED",
      "RIDER",
      newRider.id,
      `Rider activated membership via single-use token.`,
    );

    return { success: true, rider: newRider };
  }

  getInvitations(orgId: string): RiderInvitationItem[] {
    return this.invitations.filter((i) => i.organizationId === orgId);
  }

  revokeInvitation(orgId: string, invitationId: string): boolean {
    const inv = this.invitations.find(
      (i) => i.organizationId === orgId && i.id === invitationId,
    );
    if (!inv) return false;
    inv.status = "REVOKED";
    this.logAudit(
      orgId,
      "Org Admin",
      "ORG_ADMIN",
      "INVITATION_REVOKED",
      "INVITATION",
      invitationId,
      `Revoked invitation for ${inv.name}`,
    );
    return true;
  }

  updateRiderStatus(orgId: string, riderId: string, status: RiderStatus): boolean {
    const rider = this.getRider(orgId, riderId);
    if (!rider) return false;
    rider.status = status;
    rider.lastActiveAt = new Date().toISOString();
    return true;
  }

  updateRiderLocation(
    orgId: string,
    riderId: string,
    lat: number,
    lng: number,
    battery?: number,
  ): boolean {
    const rider = this.getRider(orgId, riderId);
    if (!rider) return false;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      rider.currentLatitude = lat;
      rider.currentLongitude = lng;
    }
    if (battery !== undefined) {
      rider.batteryLevel = Math.max(0, Math.min(100, battery));
    }
    rider.lastActiveAt = new Date().toISOString();
    return true;
  }

  // Integrations
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
    this.logAudit(
      orgId,
      "Admin",
      "ORG_ADMIN",
      "INTEGRATION_CREATED",
      "INTEGRATION",
      newIntegration.id,
      `Connected ${newIntegration.name}`,
    );
    return newIntegration;
  }

  toggleIntegration(orgId: string, intId: string): boolean {
    const item = this.integrations.find((i) => i.organizationId === orgId && i.id === intId);
    if (!item) return false;
    item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    this.logAudit(
      orgId,
      "Admin",
      "ORG_ADMIN",
      "INTEGRATION_TOGGLED",
      "INTEGRATION",
      intId,
      `Status toggled to ${item.status}`,
    );
    return true;
  }

  syncIntegration(orgId: string, intId: string): boolean {
    const item = this.integrations.find((i) => i.organizationId === orgId && i.id === intId);
    if (!item) return false;
    item.lastSyncAt = new Date().toISOString();
    item.lastSyncStatus = "SUCCESS (200 OK - Synced)";
    item.orderCount += 4;
    return true;
  }

  // API Credentials
  getApiCredentials(orgId: string): ApiCredentialItem[] {
    return this.apiCredentials.filter((c) => c.organizationId === orgId);
  }

  createApiCredential(
    orgId: string,
    name: string,
    scopes: string[],
  ): { credential: ApiCredentialItem; rawSecret: string } {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const secretSuffix = Math.random().toString(36).substring(2, 18);
    const keyPrefix = `sage_live_${randomHex}`;
    const rawSecret = `${keyPrefix}_${secretSuffix}`;

    const newCred: ApiCredentialItem = {
      id: `cred_${Date.now()}`,
      organizationId: orgId,
      name,
      keyPrefix,
      scopes,
      lastUsedAt: "Never",
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };

    this.apiCredentials.push(newCred);

    // Notice: we log the credential creation without ever exposing the raw secret in logs!
    this.logAudit(
      orgId,
      "Org Admin",
      "ORG_ADMIN",
      "API_KEY_GENERATED",
      "CREDENTIAL",
      newCred.id,
      `Generated key ${name} (${keyPrefix}...) with scopes [${scopes.join(", ")}]`,
    );

    return { credential: newCred, rawSecret };
  }

  authenticateApiKey(token: string): {
    valid: boolean;
    organizationId?: string;
    scopes: string[];
    credentialName?: string;
    error?: string;
  } {
    if (!token) return { valid: false, scopes: [], error: "Missing API token" };
    // Bearer token can be formatted "sage_live_xxxx_yyyy"
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
    const prefix = cleanToken.split("_").slice(0, 3).join("_");
    const cred = this.apiCredentials.find(
      (c) => c.keyPrefix === prefix && !c.isRevoked,
    );
    if (!cred) {
      return { valid: false, scopes: [], error: "Invalid or revoked API key" };
    }
    if (new Date() > new Date(cred.expiresAt)) {
      return { valid: false, scopes: [], error: "API key has expired" };
    }
    cred.lastUsedAt = new Date().toISOString();
    return {
      valid: true,
      organizationId: cred.organizationId,
      scopes: cred.scopes,
      credentialName: cred.name,
    };
  }

  validateApiSecret(orgId: string, token: string): { valid: boolean; scopes: string[] } {
    if (!token) return { valid: false, scopes: [] };
    const prefix = token.split("_").slice(0, 3).join("_"); // e.g. "sage_live_xxxx"
    const cred = this.apiCredentials.find(
      (c) => c.organizationId === orgId && c.keyPrefix === prefix && !c.isRevoked,
    );
    if (!cred) return { valid: false, scopes: [] };
    cred.lastUsedAt = new Date().toISOString();
    return { valid: true, scopes: cred.scopes };
  }

  revokeApiCredential(orgId: string, credId: string): boolean {
    const cred = this.apiCredentials.find((c) => c.organizationId === orgId && c.id === credId);
    if (!cred) return false;
    cred.isRevoked = true;
    this.logAudit(
      orgId,
      "Org Admin",
      "ORG_ADMIN",
      "API_KEY_REVOKED",
      "CREDENTIAL",
      credId,
      `Revoked key ${cred.name}`,
    );
    return true;
  }

  // Webhooks
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
    return item;
  }

  dispatchWebhookEvent(orgId: string, event: WebhookEvent, _payload: Record<string, unknown>) {
    const subs = this.webhooks.filter((w) => w.organizationId === orgId && w.isActive);
    for (const sub of subs) {
      if (sub.events.includes(event) || sub.events.includes("*")) {
        sub.lastTriggeredAt = new Date().toISOString();
      }
    }
  }

  triggerTestWebhook(orgId: string, whId: string): { success: boolean; event: string; status: number } {
    const wh = this.webhooks.find((w) => w.organizationId === orgId && w.id === whId);
    if (!wh) return { success: false, event: "unknown", status: 404 };
    wh.lastTriggeredAt = new Date().toISOString();
    return { success: true, event: wh.events[0] || "ping", status: 200 };
  }

  // Incidents
  getIncidents(orgId: string, statusFilter?: string): IncidentItem[] {
    return this.incidents.filter(
      (inc) =>
        inc.organizationId === orgId &&
        (!statusFilter || statusFilter === "ALL" || inc.status === statusFilter),
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
    this.dispatchWebhookEvent(orgId, "incident.created", {
      incidentId: newIncident.id,
      title: newIncident.title,
      severity: newIncident.severity,
    });
    return newIncident;
  }

  resolveIncident(orgId: string, incidentId: string): boolean {
    const inc = this.incidents.find((i) => i.organizationId === orgId && i.id === incidentId);
    if (!inc) return false;
    inc.status = "RESOLVED";
    inc.resolvedAt = new Date().toISOString();
    return true;
  }

  // Recommendations
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
    return true;
  }

  rejectRecommendation(orgId: string, recId: string): boolean {
    const rec = this.recommendations.find((r) => r.organizationId === orgId && r.id === recId);
    if (!rec) return false;
    rec.status = "REJECTED";
    return true;
  }

  // Audit
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
