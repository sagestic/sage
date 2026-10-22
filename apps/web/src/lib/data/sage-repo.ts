import type {
  CreateIncidentInput,
  CreateIntegrationInput,
  CreateOrderInput,
  CreateWebhookSubscriptionInput,
  CustodyEventType,
  IncidentSeverity,
  IncidentStatus,
  IngestOrderInput,
  IntegrationProvider,
  IntegrationStatus,
  InterstatePlanInput,
  InviteRiderInput,
  LegStatus,
  LegType,
  OrderPriority,
  OrderStatus,
  ParkDropoffInput,
  ParkRetrievedInput,
  RetrievalAssignInput,
  RiderStatus,
  Role,
  SealCheck,
  VehicleType,
  WebhookEvent,
} from "@sage/site-schema";
import {
  evaluateCorridorConsolidation,
  type ActiveCourierRoute,
  type ActiveCourierOrder,
} from "@sage/ai-engine";

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
  consolidationType?: "DIRECT_CONSOLIDATION" | "INTERCEPTION_RELAY" | "INDEPENDENT_DISPATCH";
  consolidatedWithOrderId?: string;
  consolidationNotes?: string;
  handoverFromRiderId?: string;
  handoverFromRiderName?: string;
  rendezvousPoint?: { name: string; lat: number; lng: number };
  estimatedKmSaved?: number;
  paymentStatus?: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "EXEMPT";
  paymentAmount?: number;
  paymentCurrency?: string;
  paystackReference?: string;
  paystackPaymentUrl?: string;
  paidAt?: string;
  orderType?: "STANDARD" | "CASH_ON_DELIVERY" | "PREPAID_EXPRESS" | "B2B_SCHEDULED";
  codAmountNgn?: number;
  itemValueNgn?: number;
  deliveryFeeNgn?: number;
  codRemittanceStatus?: "PENDING" | "REMITTED" | "NOT_APPLICABLE";
  metadata?: Record<string, unknown>;
  isInterstate?: boolean;
  originState?: string;
  destState?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterstateLegItem {
  id: string;
  organizationId: string;
  orderId: string;
  orderNumber: string;
  sequenceIndex: number;
  type: LegType;
  status: LegStatus;
  originPark?: string;
  destPark?: string;
  transportCompany?: string;
  vehiclePlate?: string;
  vehicleDescription?: string;
  driverPhone?: string;
  driverNote?: string;
  waybillNumber?: string;
  waybillPhotoUrl?: string;
  sealNumber?: string;
  sealCheck?: SealCheck;
  fareAmountNgn?: number;
  fareReceiptPhotoUrl?: string;
  droppedAt?: string;
  departedAt?: string;
  expectedArrivalAt?: string;
  retrievedAt?: string;
  riderProfileId?: string;
  riderName?: string;
  partnerName?: string;
  partnerDepot?: string;
  photoUrls: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustodyEventItem {
  id: string;
  organizationId: string;
  orderId: string;
  legId?: string;
  eventType: CustodyEventType;
  actorType: string;
  actorId?: string;
  actorName?: string;
  latitude?: number;
  longitude?: number;
  photoUrls: string[];
  note?: string;
  createdAt: string;
}

export interface ParkItem {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  notes?: string;
  useCount: number;
}

export interface CorridorEta {
  originState: string;
  destState: string;
  roadHours: number;
  bufferHours: number;
}

export const DEFAULT_CORRIDOR_ETAS: CorridorEta[] = [
  { originState: "Lagos", destState: "FCT Abuja", roadHours: 12, bufferHours: 4 },
  { originState: "Lagos", destState: "Rivers", roadHours: 10, bufferHours: 4 },
  { originState: "FCT Abuja", destState: "Kano", roadHours: 7, bufferHours: 3 },
  { originState: "Lagos", destState: "Oyo", roadHours: 3, bufferHours: 2 },
  { originState: "Lagos", destState: "Anambra", roadHours: 9, bufferHours: 3 },
];

export function resolveCorridorEta(
  originState: string,
  destState: string,
  corridors: CorridorEta[] = DEFAULT_CORRIDOR_ETAS,
): CorridorEta {
  const norm = (s: string) => s.trim().toLowerCase();
  const hit = corridors.find(
    (c) => norm(c.originState) === norm(originState) && norm(c.destState) === norm(destState),
  );
  return hit ?? { originState, destState, roadHours: 12, bufferHours: 6 };
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
  cashFloatBalance?: number;
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
  private legs: InterstateLegItem[] = [];
  private custodyEvents: CustodyEventItem[] = [];
  private parks: ParkItem[] = [];
  private corridorEtas: CorridorEta[] = [...DEFAULT_CORRIDOR_ETAS];
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
        paymentStatus: "PENDING",
        paymentAmount: 4500,
        paymentCurrency: "NGN",
        paystackReference: "sage_ORD-9421_ref",
        paystackPaymentUrl: "https://checkout.paystack.com/simulate_ORD-9421",
        assignedRiderId: "rdr_apex_1",
        assignedRiderName: "Marcus Thorne",
        assignedRiderVehicle: "MOTORCYCLE",
        estimatedDeliveryAt: new Date(Date.now() + 18 * 60000).toISOString(),
        notes: "Express parcel. Require payment verification before parcel release.",
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
        paymentStatus: "PAID",
        paymentAmount: 7500,
        paymentCurrency: "NGN",
        paystackReference: "sage_ORD-9422_paid",
        paidAt: new Date(Date.now() - 45 * 60000).toISOString(),
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
      {
        id: "int_apex_paystack",
        organizationId: orgApex,
        provider: "CUSTOM_WEBHOOK",
        name: "Paystack Payment Gateway",
        status: "ACTIVE",
        orderCount: 154,
        lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
        lastSyncStatus: "LISTENING (/api/v1/webhooks/paystack - charge.success)",
        syncIntervalMinutes: 1,
        endpointUrl: "/api/v1/webhooks/paystack",
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

    // 10. Park directory seed
    this.parks.push(
      {
        id: "park_jibowu",
        organizationId: orgApex,
        name: "Jibowu Motor Park",
        city: "Lagos",
        state: "Lagos",
        address: "Jibowu, Yaba, Lagos",
        notes: "ABC Motors office is block C. Mile 2 bound buses load from bay 4.",
        useCount: 34,
      },
      {
        id: "park_utako",
        organizationId: orgApex,
        name: "Utako Motor Park",
        city: "Abuja",
        state: "FCT Abuja",
        address: "Utako District, Abuja",
        notes: "Lagos arrivals park at the north wing. Waybill office closes 10pm.",
        useCount: 21,
      },
      {
        id: "park_ojota",
        organizationId: orgApex,
        name: "Ojota Motor Park",
        city: "Lagos",
        state: "Lagos",
        address: "Ojota, Ikorodu Road, Lagos",
        useCount: 12,
      },
    );

    // 11. Interstate demo order (Lagos -> Abuja, linehaul active)
    const interstateOrder: OrderItem = {
      id: "ord_apex_201",
      organizationId: orgApex,
      orderNumber: "ORD-9501",
      source: "WEBSITE_API",
      customerName: "Ngozi Okafor",
      customerPhone: "+234 803 555 0142",
      pickupAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
      pickupLat: 6.4281,
      pickupLng: 3.4219,
      deliveryAddress: "Plot 22, Garki Area 11, Abuja",
      deliveryLat: 9.036,
      deliveryLng: 7.489,
      status: "IN_TRANSIT",
      priority: "EXPRESS",
      packageSize: "MEDIUM",
      paymentStatus: "PAID",
      paymentAmount: 12500,
      paymentCurrency: "NGN",
      paystackReference: "sage_ORD-9501_paid",
      paidAt: new Date(Date.now() - 300 * 60000).toISOString(),
      assignedRiderId: "rdr_apex_1",
      assignedRiderName: "Marcus Thorne",
      assignedRiderVehicle: "MOTORCYCLE",
      isInterstate: true,
      originState: "Lagos",
      destState: "FCT Abuja",
      estimatedDeliveryAt: new Date(Date.now() + 600 * 60000).toISOString(),
      notes: "Interstate: Lagos -> Abuja via Jibowu park.",
      createdAt: new Date(Date.now() - 320 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.unshift(interstateOrder);

    const leg0: InterstateLegItem = {
      id: "leg_9501_0",
      organizationId: orgApex,
      orderId: interstateOrder.id,
      orderNumber: interstateOrder.orderNumber,
      sequenceIndex: 0,
      type: "FIRST_MILE",
      status: "COMPLETED",
      originPark: "Jibowu Motor Park",
      riderProfileId: "rdr_apex_1",
      riderName: "Marcus Thorne",
      photoUrls: [],
      createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    };
    const leg1: InterstateLegItem = {
      id: "leg_9501_1",
      organizationId: orgApex,
      orderId: interstateOrder.id,
      orderNumber: interstateOrder.orderNumber,
      sequenceIndex: 1,
      type: "LINEHAUL_BUS",
      status: "ACTIVE",
      originPark: "Jibowu Motor Park",
      destPark: "Utako Motor Park",
      transportCompany: "ABC Motors",
      vehiclePlate: "LAG-482-XQ",
      waybillNumber: "ABC-88412",
      waybillPhotoUrl: "waybill_abc_88412.jpg",
      sealNumber: "SEAL-2201",
      fareAmountNgn: 8000,
      droppedAt: new Date(Date.now() - 240 * 60000).toISOString(),
      departedAt: new Date(Date.now() - 200 * 60000).toISOString(),
      expectedArrivalAt: new Date(Date.now() + 520 * 60000).toISOString(),
      photoUrls: ["parcel_sealed_9501.jpg", "bus_loaded_9501.jpg"],
      createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 200 * 60000).toISOString(),
    };
    const leg2: InterstateLegItem = {
      id: "leg_9501_2",
      organizationId: orgApex,
      orderId: interstateOrder.id,
      orderNumber: interstateOrder.orderNumber,
      sequenceIndex: 2,
      type: "LAST_MILE",
      status: "PENDING",
      originPark: "Utako Motor Park",
      photoUrls: [],
      createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    };
    this.legs.push(leg0, leg1, leg2);
    this.custodyEvents.push(
      {
        id: "cev_9501_1",
        organizationId: orgApex,
        orderId: interstateOrder.id,
        eventType: "ORDER_CREATED",
        actorType: "DISPATCHER",
        actorName: "Dispatcher",
        photoUrls: [],
        note: "Interstate order Lagos -> FCT Abuja created.",
        createdAt: new Date(Date.now() - 320 * 60000).toISOString(),
      },
      {
        id: "cev_9501_2",
        organizationId: orgApex,
        orderId: interstateOrder.id,
        eventType: "INTERSTATE_PLANNED",
        actorType: "DISPATCHER",
        actorName: "Dispatcher",
        photoUrls: [],
        note: "3 legs planned: first-mile, Jibowu -> Utako linehaul, last-mile.",
        createdAt: new Date(Date.now() - 310 * 60000).toISOString(),
      },
      {
        id: "cev_9501_3",
        organizationId: orgApex,
        orderId: interstateOrder.id,
        legId: leg1.id,
        eventType: "PARK_DROPOFF",
        actorType: "RIDER",
        actorId: "rdr_apex_1",
        actorName: "Marcus Thorne",
        photoUrls: ["parcel_sealed_9501.jpg", "waybill_abc_88412.jpg"],
        note: "Handed to ABC Motors at Jibowu. Waybill ABC-88412. Fare ₦8,000.",
        createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      },
      {
        id: "cev_9501_4",
        organizationId: orgApex,
        orderId: interstateOrder.id,
        legId: leg1.id,
        eventType: "DEPARTED",
        actorType: "RIDER",
        actorId: "rdr_apex_1",
        actorName: "Marcus Thorne",
        photoUrls: ["bus_loaded_9501.jpg"],
        note: "Bus LAG-482-XQ departed Jibowu. Expected Utako tonight.",
        createdAt: new Date(Date.now() - 200 * 60000).toISOString(),
      },
    );
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
      isInterstate: input.isInterstate ?? false,
      originState: input.originState || undefined,
      destState: input.destState || undefined,
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
      isInterstate: input.isInterstate ?? false,
      originState: input.originState || undefined,
      destState: input.destState || undefined,
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

  // Inter-Rider Reassignment (transfers an order from one rider to another)
  reassignRider(orgId: string, orderId: string, targetRiderId: string, reason?: string): boolean {
    const order = this.getOrder(orgId, orderId);
    const targetRider = this.getRider(orgId, targetRiderId);
    if (!order || !targetRider) return false;

    const previousRiderId = order.assignedRiderId;
    const previousRider = previousRiderId ? this.getRider(orgId, previousRiderId) : undefined;

    if (previousRider) {
      previousRider.activeOrderCount = Math.max(0, previousRider.activeOrderCount - 1);
      if (previousRider.activeOrderCount === 0) {
        previousRider.status = "AVAILABLE";
      }
    }

    order.assignedRiderId = targetRider.id;
    order.assignedRiderName = targetRider.name;
    order.assignedRiderVehicle = targetRider.vehicleType;
    order.updatedAt = new Date().toISOString();

    targetRider.activeOrderCount += 1;
    targetRider.status = "BUSY";

    const details = reason
      ? `Reassigned order ${order.orderNumber} from ${previousRider?.name || "none"} to ${targetRider.name}. Reason: ${reason}`
      : `Reassigned order ${order.orderNumber} to ${targetRider.name}`;

    this.logAudit(
      orgId,
      "Autonomous Corridor Dispatcher",
      "SYSTEM",
      "RIDER_REASSIGNED",
      "ORDER",
      orderId,
      details,
    );

    this.dispatchWebhookEvent(orgId, "delivery.assigned", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      riderId: targetRider.id,
      riderName: targetRider.name,
      previousRiderId: previousRider?.id,
    });

    return true;
  }

  // Physical Custody Handover / Interception Relay
  recordHandover(
    orgId: string,
    orderId: string,
    fromRiderId: string,
    toRiderId: string,
    rendezvousName?: string,
    notes?: string,
  ): boolean {
    const order = this.getOrder(orgId, orderId);
    const fromRider = this.getRider(orgId, fromRiderId);
    const toRider = this.getRider(orgId, toRiderId);
    if (!order || !fromRider || !toRider) return false;

    fromRider.activeOrderCount = Math.max(0, fromRider.activeOrderCount - 1);
    if (fromRider.activeOrderCount === 0) {
      fromRider.status = "AVAILABLE";
    }

    order.handoverFromRiderId = fromRider.id;
    order.handoverFromRiderName = fromRider.name;
    order.assignedRiderId = toRider.id;
    order.assignedRiderName = toRider.name;
    order.assignedRiderVehicle = toRider.vehicleType;
    order.status = "IN_TRANSIT";
    order.updatedAt = new Date().toISOString();

    toRider.activeOrderCount += 1;
    toRider.status = "BUSY";

    const handoverDetails = `Physical custody handover: ${fromRider.name} transferred parcel to ${toRider.name} at ${rendezvousName || "Corridor Rendezvous"}. ${notes || ""}`;
    order.notes = order.notes ? `${order.notes} | ${handoverDetails}` : handoverDetails;

    this.logAudit(
      orgId,
      "Rider PWA / Corridor Intercept",
      "COURIER",
      "ORDER_HANDOVER_EXECUTED",
      "ORDER",
      orderId,
      handoverDetails,
    );

    this.dispatchWebhookEvent(orgId, "delivery.status_updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "IN_TRANSIT",
      handoverFrom: fromRider.name,
      handoverTo: toRider.name,
      rendezvousName,
    });

    return true;
  }

  // Autonomous Fleet Auto-Dispatch with Intelligent Corridor Overlap & Interception Detection
  autoDispatchPendingOrders(orgId: string): {
    assignedCount: number;
    unassignedCount: number;
    matches: Array<{
      orderNumber: string;
      riderName: string;
      type: "DIRECT_CONSOLIDATION" | "INTERCEPTION_RELAY" | "INDEPENDENT_DISPATCH";
      kmSaved: number;
      reason?: string;
    }>;
  } {
    const pendingOrders = this.orders.filter(
      (o) => o.organizationId === orgId && o.status === "PENDING",
    );
    const tenantRiders = this.riders.filter((r) => r.organizationId === orgId);

    const matches: Array<{
      orderNumber: string;
      riderName: string;
      type: "DIRECT_CONSOLIDATION" | "INTERCEPTION_RELAY" | "INDEPENDENT_DISPATCH";
      kmSaved: number;
      reason?: string;
    }> = [];

    if (tenantRiders.length === 0 || pendingOrders.length === 0) {
      return {
        assignedCount: 0,
        unassignedCount: pendingOrders.length,
        matches: [],
      };
    }

    // Process each pending order using Corridor Overlap & Coincidence Detection
    for (const order of pendingOrders) {
      // Build active courier representations with their active orders
      const activeCouriers: ActiveCourierRoute[] = tenantRiders.map((r) => {
        const ridersActiveOrders = this.orders.filter(
          (o) => o.organizationId === orgId && o.assignedRiderId === r.id && (o.status === "ASSIGNED" || o.status === "IN_TRANSIT"),
        );

        const currentOrders: ActiveCourierOrder[] = ridersActiveOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          pickupAddress: o.pickupAddress,
          pickup: { lat: o.pickupLat || 6.5244, lng: o.pickupLng || 3.3792 },
          deliveryAddress: o.deliveryAddress,
          delivery: { lat: o.deliveryLat || 6.4281, lng: o.deliveryLng || 3.4219 },
          status: o.status === "IN_TRANSIT" ? "IN_TRANSIT" : "ASSIGNED",
        }));

        return {
          riderId: r.id,
          riderName: r.name,
          currentLocation: { lat: r.currentLatitude, lng: r.currentLongitude },
          vehicleCapacityKg: r.vehicleType === "VAN" ? 60 : 25,
          currentLoadKg: r.activeOrderCount * 4,
          status: r.status === "OFFLINE" ? "OFFLINE" : (r.activeOrderCount >= 4 ? "BUSY" : "AVAILABLE"),
          activeOrders: currentOrders,
        };
      });

      const candidate = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        pickupAddress: order.pickupAddress,
        pickup: { lat: order.pickupLat || 6.5244, lng: order.pickupLng || 3.3792 },
        deliveryAddress: order.deliveryAddress,
        delivery: { lat: order.deliveryLat || 6.4281, lng: order.deliveryLng || 3.4219 },
        weightKg: order.packageWeightKg || 3,
      };

      const decision = evaluateCorridorConsolidation(candidate, activeCouriers);

      if (decision.type === "DIRECT_CONSOLIDATION") {
        this.assignRider(orgId, order.id, decision.primaryRiderId);
        order.consolidationType = "DIRECT_CONSOLIDATION";
        order.consolidatedWithOrderId = decision.sharedWithOrderNumber;
        order.consolidationNotes = decision.reason;
        order.estimatedKmSaved = decision.estimatedKmSaved;

        matches.push({
          orderNumber: order.orderNumber,
          riderName: decision.primaryRiderName,
          type: "DIRECT_CONSOLIDATION",
          kmSaved: decision.estimatedKmSaved,
          reason: decision.reason,
        });
      } else if (decision.type === "INTERCEPTION_RELAY") {
        // Interception Relay: Primary rider delivers both, secondary rider executes local pickup & handover
        this.assignRider(orgId, order.id, decision.primaryRiderId);
        order.consolidationType = "INTERCEPTION_RELAY";
        order.handoverFromRiderId = decision.secondaryRiderId;
        order.handoverFromRiderName = decision.secondaryRiderName;
        order.rendezvousPoint = decision.rendezvousPoint;
        order.consolidationNotes = decision.reason;
        order.estimatedKmSaved = decision.estimatedKmSaved;

        matches.push({
          orderNumber: order.orderNumber,
          riderName: `${decision.primaryRiderName} (Intercept from ${decision.secondaryRiderName})`,
          type: "INTERCEPTION_RELAY",
          kmSaved: decision.estimatedKmSaved,
          reason: decision.reason,
        });
      } else {
        // Standard independent dispatch
        if (decision.primaryRiderId && decision.primaryRiderId !== "rdr_unassigned") {
          this.assignRider(orgId, order.id, decision.primaryRiderId);
          order.consolidationType = "INDEPENDENT_DISPATCH";
          matches.push({
            orderNumber: order.orderNumber,
            riderName: decision.primaryRiderName,
            type: "INDEPENDENT_DISPATCH",
            kmSaved: 0,
            reason: decision.reason,
          });
        }
      }
    }

    const totalKmSaved = matches.reduce((sum, m) => sum + (m.kmSaved || 0), 0);

    this.logAudit(
      orgId,
      "Autonomous Corridor Engine",
      "SYSTEM",
      "AUTONOMOUS_FLEET_DISPATCH",
      "DISPATCH_BATCH",
      `batch_${Date.now()}`,
      `Autonomously dispatched ${matches.length} orders. Corridor consolidations saved an estimated ${totalKmSaved.toFixed(1)} km of fleet travel.`,
    );

    return {
      assignedCount: matches.length,
      unassignedCount: pendingOrders.length - matches.length,
      matches,
    };
  }

  // ---- Interstate park handoff (bus drivers unaffiliated: no driver OTP) ----

  getLegs(orgId: string, orderId: string): InterstateLegItem[] {
    return this.legs
      .filter((l) => l.organizationId === orgId && l.orderId === orderId)
      .sort((a, b) => a.sequenceIndex - b.sequenceIndex);
  }

  getLeg(orgId: string, legId: string): InterstateLegItem | undefined {
    return this.legs.find((l) => l.organizationId === orgId && l.id === legId);
  }

  getLegByOrderAndType(
    orgId: string,
    orderId: string,
    type: LegType,
  ): InterstateLegItem | undefined {
    return this.legs.find(
      (l) => l.organizationId === orgId && l.orderId === orderId && l.type === type,
    );
  }

  getCustodyTimeline(orgId: string, orderId: string): CustodyEventItem[] {
    return this.custodyEvents
      .filter((e) => e.organizationId === orgId && e.orderId === orderId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }

  getParks(orgId: string): ParkItem[] {
    return this.parks
      .filter((p) => p.organizationId === orgId)
      .sort((a, b) => b.useCount - a.useCount);
  }

  upsertPark(orgId: string, name: string, state?: string, city?: string): ParkItem {
    const norm = (s: string) => s.trim().toLowerCase();
    const existing = this.parks.find(
      (p) => p.organizationId === orgId && norm(p.name) === norm(name),
    );
    if (existing) {
      existing.useCount += 1;
      return existing;
    }
    const park: ParkItem = {
      id: `park_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      name: name.trim(),
      city: city?.trim() || "",
      state: state?.trim() || "",
      useCount: 1,
    };
    this.parks.push(park);
    return park;
  }

  getCorridorEtas(): CorridorEta[] {
    return [...this.corridorEtas];
  }

  upsertCorridorEta(input: CorridorEta): CorridorEta {
    const norm = (s: string) => s.trim().toLowerCase();
    const existing = this.corridorEtas.find(
      (c) => norm(c.originState) === norm(input.originState) && norm(c.destState) === norm(input.destState),
    );
    if (existing) {
      existing.roadHours = input.roadHours;
      existing.bufferHours = input.bufferHours;
      return existing;
    }
    this.corridorEtas.push({ ...input });
    return input;
  }

  private recordCustodyEvent(
    orgId: string,
    orderId: string,
    eventType: CustodyEventType,
    opts: {
      legId?: string;
      actorType?: string;
      actorId?: string;
      actorName?: string;
      latitude?: number;
      longitude?: number;
      photoUrls?: string[];
      note?: string;
    } = {},
  ): CustodyEventItem {
    const event: CustodyEventItem = {
      id: `cev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      orderId,
      legId: opts.legId,
      eventType,
      actorType: opts.actorType ?? "SYSTEM",
      actorId: opts.actorId,
      actorName: opts.actorName,
      latitude: opts.latitude,
      longitude: opts.longitude,
      photoUrls: opts.photoUrls ?? [],
      note: opts.note,
      createdAt: new Date().toISOString(),
    };
    this.custodyEvents.push(event);
    return event;
  }

  planInterstate(
    orgId: string,
    orderId: string,
    input: InterstatePlanInput,
  ): { legs: InterstateLegItem[]; error?: string } {
    const order = this.getOrder(orgId, orderId);
    if (!order) return { legs: [], error: "Order not found" };
    if (this.legs.some((l) => l.organizationId === orgId && l.orderId === orderId)) {
      return { legs: this.getLegs(orgId, orderId), error: "Interstate plan already exists" };
    }

    order.isInterstate = true;
    order.originState = input.originState;
    order.destState = input.destState;
    order.updatedAt = new Date().toISOString();

    const now = new Date().toISOString();
    const originRider = input.originRiderId ? this.getRider(orgId, input.originRiderId) : undefined;
    const destRider = input.destRiderId ? this.getRider(orgId, input.destRiderId) : undefined;

    const legs: InterstateLegItem[] = [
      {
        id: `leg_${Date.now()}_0`,
        organizationId: orgId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        sequenceIndex: 0,
        type: "FIRST_MILE",
        status: "ACTIVE",
        originPark: input.originPark,
        riderProfileId: originRider?.id,
        riderName: originRider?.name,
        photoUrls: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `leg_${Date.now()}_1`,
        organizationId: orgId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        sequenceIndex: 1,
        type: "LINEHAUL_BUS",
        status: "PENDING",
        originPark: input.originPark,
        destPark: input.destPark,
        photoUrls: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `leg_${Date.now()}_2`,
        organizationId: orgId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        sequenceIndex: 2,
        type: "LAST_MILE",
        status: "PENDING",
        originPark: input.destPark,
        riderProfileId: destRider?.id,
        riderName: destRider?.name,
        photoUrls: [],
        createdAt: now,
        updatedAt: now,
      },
    ];
    this.legs.push(...legs);

    if (originRider) {
      this.assignRider(orgId, order.id, originRider.id);
      order.status = "IN_TRANSIT";
    }

    this.recordCustodyEvent(orgId, order.id, "INTERSTATE_PLANNED", {
      actorType: "DISPATCHER",
      actorName: "Dispatcher",
      note: `3 legs planned: first-mile, ${input.originPark ?? input.originState} -> ${input.destPark ?? input.destState} linehaul, last-mile.`,
    });
    this.logAudit(
      orgId,
      "Dispatcher",
      "DISPATCHER",
      "INTERSTATE_PLANNED",
      "ORDER",
      order.id,
      `Planned interstate ${order.orderNumber}: ${input.originState} -> ${input.destState}`,
    );
    return { legs };
  }

  recordParkDropoff(
    orgId: string,
    orderId: string,
    riderId: string,
    input: ParkDropoffInput,
  ): { leg?: InterstateLegItem; error?: string } {
    const order = this.getOrder(orgId, orderId);
    if (!order) return { error: "Order not found" };
    const rider = this.getRider(orgId, riderId);
    if (!rider) return { error: "Rider not found" };

    // Required-field enforcement (driver phone deliberately NOT required)
    if (!input.originPark?.trim()) return { error: "Origin park is required" };
    if (!input.transportCompany?.trim()) return { error: "Transport company is required" };
    if (!input.vehiclePlate?.trim() && !input.vehicleDescription?.trim()) {
      return { error: "Bus plate or description is required" };
    }
    if (!input.waybillNumber?.trim()) return { error: "Waybill number is required" };
    if (!input.waybillPhotoUrl?.trim()) return { error: "Waybill photo is required" };
    if (!input.photoUrls || input.photoUrls.length < 1) {
      return { error: "At least one parcel photo is required" };
    }

    let linehaul = this.getLegByOrderAndType(orgId, orderId, "LINEHAUL_BUS");
    if (!linehaul) {
      // Auto-plan when dispatcher skipped planning (origin/dest states required)
      if (!order.originState || !order.destState) {
        return { error: "Plan interstate first (origin/dest state missing)" };
      }
      const planned = this.planInterstate(orgId, orderId, {
        originState: order.originState,
        destState: order.destState,
        originPark: input.originPark,
        destPark: input.destPark,
        originRiderId: riderId,
      });
      if (planned.error && planned.legs.length === 0) return { error: planned.error };
      linehaul = this.getLegByOrderAndType(orgId, orderId, "LINEHAUL_BUS");
      if (!linehaul) return { error: "Could not create linehaul leg" };
    }

    const firstMile = this.getLegByOrderAndType(orgId, orderId, "FIRST_MILE");
    if (firstMile) {
      firstMile.status = "COMPLETED";
      firstMile.updatedAt = new Date().toISOString();
    }

    const corridor = resolveCorridorEta(
      order.originState ?? "",
      order.destState ?? "",
      this.corridorEtas,
    );
    const departedAt = input.departedAt ?? new Date().toISOString();
    const eta = new Date(
      new Date(departedAt).getTime() + (corridor.roadHours + corridor.bufferHours) * 3600000,
    ).toISOString();

    linehaul.status = "ACTIVE";
    linehaul.originPark = input.originPark.trim();
    if (input.destPark?.trim()) linehaul.destPark = input.destPark.trim();
    linehaul.transportCompany = input.transportCompany.trim();
    linehaul.vehiclePlate = input.vehiclePlate?.trim() || undefined;
    linehaul.vehicleDescription = input.vehicleDescription?.trim() || undefined;
    linehaul.waybillNumber = input.waybillNumber.trim();
    linehaul.waybillPhotoUrl = input.waybillPhotoUrl.trim();
    linehaul.sealNumber = input.sealNumber?.trim() || undefined;
    linehaul.fareAmountNgn = input.fareAmountNgn;
    linehaul.fareReceiptPhotoUrl = input.fareReceiptPhotoUrl?.trim() || undefined;
    linehaul.photoUrls = [...input.photoUrls];
    linehaul.driverPhone = input.driverPhone?.trim() || undefined;
    linehaul.driverNote = input.driverNote?.trim() || undefined;
    linehaul.droppedAt = new Date().toISOString();
    linehaul.departedAt = departedAt;
    linehaul.expectedArrivalAt = eta;
    linehaul.notes = input.notes?.trim() || undefined;
    linehaul.updatedAt = new Date().toISOString();

    this.upsertPark(orgId, linehaul.originPark, order.originState);
    if (linehaul.destPark) this.upsertPark(orgId, linehaul.destPark, order.destState);

    order.status = "IN_TRANSIT";
    order.updatedAt = new Date().toISOString();

    this.recordCustodyEvent(orgId, order.id, "PARK_DROPOFF", {
      legId: linehaul.id,
      actorType: "RIDER",
      actorId: rider.id,
      actorName: rider.name,
      photoUrls: [linehaul.waybillPhotoUrl, ...input.photoUrls],
      note: `Handed to ${linehaul.transportCompany} at ${linehaul.originPark}. Waybill ${linehaul.waybillNumber}.${linehaul.fareAmountNgn ? ` Fare ₦${linehaul.fareAmountNgn.toLocaleString()}.` : ""}`,
    });
    this.recordCustodyEvent(orgId, order.id, "DEPARTED", {
      legId: linehaul.id,
      actorType: "RIDER",
      actorId: rider.id,
      actorName: rider.name,
      photoUrls: [...input.photoUrls],
      note: `${linehaul.vehiclePlate ?? linehaul.vehicleDescription ?? "Bus"} departed ${linehaul.originPark}. Expected ${linehaul.destPark ?? order.destState} by ${new Date(eta).toLocaleString()}.`,
    });
    this.dispatchWebhookEvent(orgId, "delivery.status_updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "IN_TRANSIT",
      leg: "LINEHAUL_BUS",
      waybillNumber: linehaul.waybillNumber,
    });
    return { leg: linehaul };
  }

  assignRetrieval(
    orgId: string,
    orderId: string,
    input: RetrievalAssignInput,
  ): { leg?: InterstateLegItem; error?: string } {
    const order = this.getOrder(orgId, orderId);
    if (!order) return { error: "Order not found" };
    const lastMile =
      this.getLegByOrderAndType(orgId, orderId, "LAST_MILE") ??
      this.getLegByOrderAndType(orgId, orderId, "PARTNER_HANDOFF");
    if (!lastMile) return { error: "Last-mile leg not found" };

    if (input.riderProfileId) {
      const rider = this.getRider(orgId, input.riderProfileId);
      if (!rider) return { error: "Rider not found" };
      lastMile.type = "LAST_MILE";
      lastMile.riderProfileId = rider.id;
      lastMile.riderName = rider.name;
      lastMile.partnerName = undefined;
      lastMile.partnerDepot = undefined;
    } else if (input.partnerName) {
      lastMile.type = "PARTNER_HANDOFF";
      lastMile.partnerName = input.partnerName.trim();
      lastMile.partnerDepot = input.partnerDepot?.trim() || undefined;
      lastMile.riderProfileId = undefined;
      lastMile.riderName = undefined;
    } else {
      return { error: "Rider or partner is required" };
    }
    lastMile.status = lastMile.status === "COMPLETED" ? lastMile.status : "PENDING";
    lastMile.updatedAt = new Date().toISOString();

    this.recordCustodyEvent(orgId, order.id, "RETRIEVAL_ASSIGNED", {
      legId: lastMile.id,
      actorType: "DISPATCHER",
      actorName: "Dispatcher",
      note:
        lastMile.type === "PARTNER_HANDOFF"
          ? `Partner ${lastMile.partnerName}${lastMile.partnerDepot ? ` (${lastMile.partnerDepot})` : ""} assigned for retrieval.`
          : `Retrieval assigned to ${lastMile.riderName} at ${lastMile.originPark ?? order.destState}.`,
    });
    return { leg: lastMile };
  }

  recordParkRetrieved(
    orgId: string,
    orderId: string,
    riderId: string,
    input: ParkRetrievedInput,
  ): { leg?: InterstateLegItem; error?: string } {
    const order = this.getOrder(orgId, orderId);
    if (!order) return { error: "Order not found" };
    const rider = this.getRider(orgId, riderId);
    if (!rider) return { error: "Rider not found" };
    if (!input.photoUrls || input.photoUrls.length < 1) {
      return { error: "Retrieval photo is required" };
    }

    const linehaul = this.getLegByOrderAndType(orgId, orderId, "LINEHAUL_BUS");
    if (!linehaul || (linehaul.status !== "ACTIVE" && linehaul.status !== "OVERDUE")) {
      return { error: "No active linehaul to retrieve" };
    }
    const lastMile =
      this.getLegByOrderAndType(orgId, orderId, "LAST_MILE") ??
      this.getLegByOrderAndType(orgId, orderId, "PARTNER_HANDOFF");

    linehaul.status = "COMPLETED";
    linehaul.retrievedAt = new Date().toISOString();
    linehaul.sealCheck = input.sealCheck;
    linehaul.updatedAt = new Date().toISOString();

    if (lastMile) {
      lastMile.status = "ACTIVE";
      lastMile.riderProfileId = rider.id;
      lastMile.riderName = rider.name;
      lastMile.updatedAt = new Date().toISOString();
    }

    order.assignedRiderId = rider.id;
    order.assignedRiderName = rider.name;
    order.assignedRiderVehicle = rider.vehicleType;
    order.status = "IN_TRANSIT";
    order.updatedAt = new Date().toISOString();

    this.recordCustodyEvent(orgId, order.id, "PARK_RETRIEVED", {
      legId: linehaul.id,
      actorType: "RIDER",
      actorId: rider.id,
      actorName: rider.name,
      latitude: input.latitude,
      longitude: input.longitude,
      photoUrls: [...input.photoUrls],
      note: `Retrieved at ${linehaul.destPark ?? order.destState}. Seal ${input.sealCheck.toLowerCase()}.${input.note ? ` ${input.note}` : ""}`,
    });

    if (input.sealCheck === "BROKEN") {
      this.recordCustodyEvent(orgId, order.id, "SEAL_BROKEN", {
        legId: linehaul.id,
        actorType: "RIDER",
        actorId: rider.id,
        actorName: rider.name,
        photoUrls: [...input.photoUrls],
        note: "Seal broken on retrieval. Incident opened; last-mile continues.",
      });
      this.createIncident(orgId, {
        title: `Broken seal on ${order.orderNumber}`,
        description: `Parcel retrieved at ${linehaul.destPark ?? order.destState} with broken seal (waybill ${linehaul.waybillNumber ?? "unknown"}). Photos attached to custody timeline. Last-mile continues.`,
        severity: "HIGH",
        category: "SEAL_BROKEN",
        orderId: order.id,
        riderProfileId: rider.id,
      });
    }

    this.dispatchWebhookEvent(orgId, "delivery.status_updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "IN_TRANSIT",
      leg: "LAST_MILE",
      sealCheck: input.sealCheck,
    });
    return { leg: linehaul };
  }

  flagOverdueLegs(orgId: string, nowIso?: string): InterstateLegItem[] {
    const now = new Date(nowIso ?? new Date().toISOString()).getTime();
    const flagged: InterstateLegItem[] = [];
    for (const leg of this.legs) {
      if (leg.organizationId !== orgId) continue;
      if (leg.type !== "LINEHAUL_BUS" || leg.status !== "ACTIVE") continue;
      if (!leg.expectedArrivalAt) continue;
      if (new Date(leg.expectedArrivalAt).getTime() < now) {
        leg.status = "OVERDUE";
        leg.updatedAt = new Date().toISOString();
        flagged.push(leg);
        this.recordCustodyEvent(orgId, leg.orderId, "OVERDUE_FLAGGED", {
          legId: leg.id,
          actorType: "SYSTEM",
          actorName: "Overdue Monitor",
          note: `Linehaul overdue: expected ${leg.destPark ?? ""} by ${new Date(leg.expectedArrivalAt).toLocaleString()}. Waybill ${leg.waybillNumber ?? "unknown"}. Call park office.`,
        });
      }
    }
    return flagged;
  }

  getInterstateQueue(orgId: string): {
    order: OrderItem;
    linehaul?: InterstateLegItem;
    lastMile?: InterstateLegItem;
  }[] {
    return this.orders
      .filter((o) => o.organizationId === orgId && o.isInterstate)
      .map((order) => ({
        order,
        linehaul: this.getLegByOrderAndType(orgId, order.id, "LINEHAUL_BUS"),
        lastMile:
          this.getLegByOrderAndType(orgId, order.id, "LAST_MILE") ??
          this.getLegByOrderAndType(orgId, order.id, "PARTNER_HANDOFF"),
      }));
  }

  getRiderInterstateTasks(
    orgId: string,
    riderId: string,
  ): { order: OrderItem; leg: InterstateLegItem; task: "PARK_DROPOFF" | "PARK_RETRIEVAL" }[] {
    const tasks: { order: OrderItem; leg: InterstateLegItem; task: "PARK_DROPOFF" | "PARK_RETRIEVAL" }[] = [];
    for (const leg of this.legs) {
      if (leg.organizationId !== orgId) continue;
      const order = this.orders.find((o) => o.organizationId === orgId && o.id === leg.orderId);
      if (!order) continue;
      if (leg.type === "FIRST_MILE" && leg.status === "ACTIVE" && leg.riderProfileId === riderId) {
        tasks.push({ order, leg, task: "PARK_DROPOFF" });
      }
      if (
        (leg.type === "LAST_MILE" || leg.type === "PARTNER_HANDOFF") &&
        leg.status === "PENDING" &&
        leg.riderProfileId === riderId
      ) {
        tasks.push({ order, leg, task: "PARK_RETRIEVAL" });
      }
      // Unassigned retrieval at an active linehaul is visible to all riders in dest state
      if (
        (leg.type === "LAST_MILE" || leg.type === "PARTNER_HANDOFF") &&
        leg.status === "PENDING" &&
        !leg.riderProfileId
      ) {
        const linehaul = this.getLegByOrderAndType(orgId, order.id, "LINEHAUL_BUS");
        if (linehaul && (linehaul.status === "ACTIVE" || linehaul.status === "OVERDUE")) {
          tasks.push({ order, leg, task: "PARK_RETRIEVAL" });
        }
      }
    }
    return tasks;
  }

  // Public Tracking Query (for customer WhatsApp tracking links)
  getPublicTrackingOrder(orderId: string): {
    order: OrderItem;
    courier?: {
      name: string;
      phone: string;
      vehicleType: VehicleType;
      latitude?: number;
      longitude?: number;
      batteryLevel: number;
    };
    legs: InterstateLegItem[];
    timeline: CustodyEventItem[];
  } | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    let courier = undefined;
    if (order.assignedRiderId) {
      const rider = this.riders.find((r) => r.id === order.assignedRiderId);
      if (rider) {
        courier = {
          name: rider.name,
          phone: rider.phone,
          vehicleType: rider.vehicleType,
          latitude: rider.currentLatitude,
          longitude: rider.currentLongitude,
          batteryLevel: rider.batteryLevel,
        };
      }
    }

    const legs = order.isInterstate ? this.getLegs(order.organizationId, order.id) : [];
    const timeline = order.isInterstate
      ? this.getCustodyTimeline(order.organizationId, order.id)
      : [];
    return { order, courier, legs, timeline };
  }

  // Payment Verification & Processing (Paystack Integration)
  markOrderPaid(
    orgId: string,
    orderIdOrNumber: string,
    amount: number,
    reference: string,
    method: "PAYSTACK" | "CASH" = "PAYSTACK",
  ): boolean {
    const order = this.orders.find(
      (o) =>
        (o.organizationId === orgId || !orgId) &&
        (o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber),
    );
    if (!order) return false;

    order.paymentStatus = "PAID";
    order.paymentAmount = amount || order.paymentAmount || 4500;
    order.paystackReference = reference;
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    const verifiedDetails = `Payment of ₦${order.paymentAmount.toLocaleString()} verified via ${method} (Ref: ${reference}). Courier cleared for package release.`;
    order.notes = order.notes ? `${order.notes} | ${verifiedDetails}` : verifiedDetails;

    this.logAudit(
      order.organizationId,
      "Paystack Payment Gateway",
      "SYSTEM",
      "PAYMENT_VERIFIED",
      "ORDER",
      order.id,
      verifiedDetails,
    );

    this.dispatchWebhookEvent(order.organizationId, "delivery.status_updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: "PAID",
      amountPaid: order.paymentAmount,
      reference,
    });

    return true;
  }

  initializePaystackOrderPayment(
    orgId: string,
    orderIdOrNumber: string,
    amountNgn?: number,
  ): { authorizationUrl: string; reference: string; amount: number } {
    const order = this.orders.find(
      (o) =>
        (o.organizationId === orgId || !orgId) &&
        (o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber),
    );
    const amount = amountNgn || order?.paymentAmount || 4500;
    const reference = `sage_${order?.orderNumber || "ORD"}_${Date.now()}`;
    const authorizationUrl = `https://checkout.paystack.com/simulate_${reference}`;

    if (order) {
      order.paystackReference = reference;
      order.paystackPaymentUrl = authorizationUrl;
      order.paymentAmount = amount;
      if (order.paymentStatus !== "PAID") {
        order.paymentStatus = "PENDING";
      }
    }

    return { authorizationUrl, reference, amount };
  }

  // Cash on Delivery (COD) Collection & Courier Cash Float
  recordCodCollection(
    orgId: string,
    orderIdOrNumber: string,
    amountCollected: number,
    riderId?: string,
  ): boolean {
    const order = this.orders.find(
      (o) =>
        (o.organizationId === orgId || !orgId) &&
        (o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber),
    );
    if (!order) return false;

    const rider = this.riders.find(
      (r) => r.id === (riderId || order.assignedRiderId),
    );

    order.paymentStatus = "PAID";
    order.paymentAmount = amountCollected;
    order.codRemittanceStatus = "PENDING";
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    if (rider) {
      rider.cashFloatBalance = (rider.cashFloatBalance || 0) + amountCollected;
    }

    const codDetails = `COD cash collection: Courier ${rider?.name || "assigned"} collected ₦${amountCollected.toLocaleString()} in cash. Added to rider cash float (Current balance: ₦${(rider?.cashFloatBalance || amountCollected).toLocaleString()}). Pending merchant remittance.`;
    order.notes = order.notes ? `${order.notes} | ${codDetails}` : codDetails;

    this.logAudit(
      order.organizationId,
      "Rider PWA / COD Engine",
      "COURIER",
      "COD_CASH_COLLECTED",
      "ORDER",
      order.id,
      codDetails,
    );

    this.dispatchWebhookEvent(order.organizationId, "delivery.status_updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: "PAID",
      codCollected: amountCollected,
      riderName: rider?.name,
    });

    return true;
  }

  remitRiderCashFloat(orgId: string, riderId: string): { remittedAmount: number } {
    const rider = this.riders.find((r) => r.organizationId === orgId && r.id === riderId);
    if (!rider) return { remittedAmount: 0 };

    const amount = rider.cashFloatBalance || 0;
    rider.cashFloatBalance = 0;

    // Update associated orders to REMITTED
    this.orders
      .filter((o) => o.organizationId === orgId && o.assignedRiderId === rider.id && o.codRemittanceStatus === "PENDING")
      .forEach((o) => {
        o.codRemittanceStatus = "REMITTED";
      });

    this.logAudit(
      orgId,
      "Dispatcher / Finance",
      "DISPATCHER",
      "RIDER_FLOAT_REMITTED",
      "RIDER",
      rider.id,
      `Remitted cash float of ₦${amount.toLocaleString()} from ${rider.name} to logistics treasury.`,
    );

    return { remittedAmount: amount };
  }

  private organizationSettings: Record<string, {
    operatingModel: "ECOMMERCE_COD" | "ON_DEMAND_EXPRESS" | "WHATSAPP_COMMERCE" | "B2B_DISTRIBUTION";
    defaultCity: string;
    defaultDepotAddress: string;
    defaultDeliveryFeeNgn: number;
    acceptsCashOnDelivery: boolean;
    acceptsOnlinePaystack: boolean;
    activeIntakeChannels: string[];
    onboardedAt?: string;
  }> = {
    org_apex_logistics: {
      operatingModel: "ECOMMERCE_COD",
      defaultCity: "Lagos",
      defaultDepotAddress: "Mainland Logistics Hub, Ikeja, Lagos",
      defaultDeliveryFeeNgn: 4500,
      acceptsCashOnDelivery: true,
      acceptsOnlinePaystack: true,
      activeIntakeChannels: ["WHATSAPP", "SHOPIFY", "WEBSITE_API", "TRACKING_WIDGET"],
      onboardedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  };

  getOrganizationSettings(orgId: string) {
    return (
      this.organizationSettings[orgId] || {
        operatingModel: "ECOMMERCE_COD",
        defaultCity: "Lagos",
        defaultDepotAddress: "Mainland Logistics Hub, Ikeja",
        defaultDeliveryFeeNgn: 4500,
        acceptsCashOnDelivery: true,
        acceptsOnlinePaystack: true,
        activeIntakeChannels: ["WHATSAPP", "WEBSITE_API"],
      }
    );
  }

  saveOrganizationSettings(
    orgId: string,
    settings: Partial<{
      operatingModel: "ECOMMERCE_COD" | "ON_DEMAND_EXPRESS" | "WHATSAPP_COMMERCE" | "B2B_DISTRIBUTION";
      defaultCity: string;
      defaultDepotAddress: string;
      defaultDeliveryFeeNgn: number;
      acceptsCashOnDelivery: boolean;
      acceptsOnlinePaystack: boolean;
      activeIntakeChannels: string[];
    }>,
  ) {
    const existing = this.getOrganizationSettings(orgId);
    this.organizationSettings[orgId] = {
      ...existing,
      ...settings,
      onboardedAt: new Date().toISOString(),
    };
    this.logAudit(
      orgId,
      "Onboarding Wizard",
      "ADMIN",
      "OPERATING_MODEL_CONFIGURED",
      "SETTINGS",
      orgId,
      `Updated logistics operating model to ${this.organizationSettings[orgId].operatingModel} in ${this.organizationSettings[orgId].defaultCity}.`,
    );
    return this.organizationSettings[orgId];
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

    const codPendingRemittance = tenantOrders
      .filter((o) => o.codRemittanceStatus === "PENDING")
      .reduce((sum, o) => sum + (o.codAmountNgn || o.paymentAmount || 0), 0);
    const totalCourierCashFloat = tenantRiders
      .reduce((sum, r) => sum + (r.cashFloatBalance || 0), 0);

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
      codPendingRemittance,
      totalCourierCashFloat,
      operatingModel: this.getOrganizationSettings(orgId).operatingModel,
    };
  }
}

// Global Singleton for Next.js App
const globalForSage = globalThis as unknown as { sageRepo?: SageDataStore };
export const sageRepo = globalForSage.sageRepo || new SageDataStore();
if (process.env.NODE_ENV !== "production") globalForSage.sageRepo = sageRepo;
