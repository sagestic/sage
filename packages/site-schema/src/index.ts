import { z } from "zod";

export const RoleSchema = z.enum(["ORG_ADMIN", "DISPATCHER", "RIDER"]);
export type Role = z.infer<typeof RoleSchema>;

export const VehicleTypeSchema = z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"]);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const RiderStatusSchema = z.enum(["AVAILABLE", "BUSY", "ON_BREAK", "OFFLINE"]);
export type RiderStatus = z.infer<typeof RiderStatusSchema>;

export const OrderStatusSchema = z.enum([
  "PENDING",
  "ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderPrioritySchema = z.enum(["STANDARD", "EXPRESS", "RUSH"]);
export type OrderPriority = z.infer<typeof OrderPrioritySchema>;

export const IntegrationProviderSchema = z.enum([
  "SHOPIFY",
  "WOOCOMMERCE",
  "ONFLEET",
  "SHIPSTATION",
  "WHATSAPP",
  "WEBSITE_API",
  "CUSTOM_WEBHOOK",
  "CSV_IMPORT",
]);
export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;

export const IntegrationStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ERROR",
  "SYNCING",
  "COMING_SOON",
]);
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const IncidentSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum([
  "OPEN",
  "INVESTIGATING",
  "RESOLVED",
  "DISMISSED",
]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const WebhookEventSchema = z.enum([
  "order.created",
  "order.updated",
  "delivery.assigned",
  "delivery.status_updated",
  "incident.created",
  "recommendation.created",
]);
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const CoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  logoUrl: z.string().optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// Canonical Order Ingestion Schema
export const IngestOrderSchema = z.object({
  source: IntegrationProviderSchema.default("WEBSITE_API"),
  externalOrderId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(5, "Recipient phone is required"),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupCoordinates: CoordinatesSchema.optional(),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  dropoffCoordinates: CoordinatesSchema.optional(),
  priority: OrderPrioritySchema.default("STANDARD"),
  packageSize: z.string().default("MEDIUM"),
  packageWeightKg: z.number().min(0).max(500).optional(),
  deliveryDeadline: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isInterstate: z.boolean().optional(),
  originState: z.string().optional(),
  destState: z.string().optional(),
});
export type IngestOrderInput = z.infer<typeof IngestOrderSchema>;

// Form schemas for React Hook Form + Zod
export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(2, "Order number is required"),
  source: z.string().default("MANUAL"),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(5, "Customer phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLat: z.number().min(-90).max(90).optional(),
  pickupLng: z.number().min(-180).max(180).optional(),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLng: z.number().min(-180).max(180).optional(),
  priority: OrderPrioritySchema.default("STANDARD"),
  packageSize: z.string().default("MEDIUM"),
  notes: z.string().optional(),
  isInterstate: z.boolean().optional(),
  originState: z.string().optional(),
  destState: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Rider Invitation Schema (Name & phone required, email & employeeId optional)
export const InviteRiderSchema = z.object({
  name: z.string().min(2, "Rider name is required"),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  employeeId: z.string().optional(),
  vehicleType: VehicleTypeSchema.default("MOTORCYCLE"),
  capacityScore: z.number().min(10).max(500).default(100),
  role: RoleSchema.default("RIDER"),
});
export type InviteRiderInput = z.infer<typeof InviteRiderSchema>;

export const AcceptInvitationSchema = z.object({
  token: z.string().min(8, "Valid invitation token required"),
  name: z.string().min(2, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;

export const CreateIncidentSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required"),
  severity: IncidentSeveritySchema.default("MEDIUM"),
  category: z.string().min(2, "Category is required"),
  orderId: z.string().optional().or(z.literal("")),
  riderProfileId: z.string().optional().or(z.literal("")),
});
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const CreateIntegrationSchema = z.object({
  provider: IntegrationProviderSchema,
  name: z.string().min(2, "Integration name is required"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  endpointUrl: z.string().url().optional().or(z.literal("")),
  syncIntervalMinutes: z.number().min(1).max(1440).default(5),
});
export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>;

export const CreateApiCredentialSchema = z.object({
  name: z.string().min(2, "Credential name is required"),
  scopes: z.array(z.string()).min(1, "Select at least one scope"),
  expiresInDays: z.number().default(90),
});
export type CreateApiCredentialInput = z.infer<typeof CreateApiCredentialSchema>;

export const CreateWebhookSubscriptionSchema = z.object({
  url: z.string().url("Must be a valid HTTPS/HTTP URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  secret: z.string().min(8, "Webhook secret minimum 8 characters"),
});
export type CreateWebhookSubscriptionInput = z.infer<
  typeof CreateWebhookSubscriptionSchema
>;

export const LoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationSlug: z.string().optional(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterOrganizationSchema = z.object({
  organizationName: z.string().min(2, "Company name is required"),
  organizationSlug: z.string().min(2, "Slug is required"),
  adminName: z.string().min(2, "Administrator name is required"),
  adminEmail: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fleetSize: z.string().default("1-10"),
  primaryIntegration: IntegrationProviderSchema.default("SHOPIFY"),
});
export type RegisterOrganizationInput = z.infer<
  typeof RegisterOrganizationSchema
>;

export const HealthCheckResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  uptime: z.number(),
  timestamp: z.string(),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// Interstate park-handoff schemas (bus drivers are unaffiliated: no driver OTP)
export const LegTypeSchema = z.enum([
  "FIRST_MILE",
  "LINEHAUL_BUS",
  "LAST_MILE",
  "PARTNER_HANDOFF",
]);
export type LegType = z.infer<typeof LegTypeSchema>;

export const LegStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "COMPLETED",
  "OVERDUE",
  "FAILED",
]);
export type LegStatus = z.infer<typeof LegStatusSchema>;

export const SealCheckSchema = z.enum(["INTACT", "BROKEN", "NO_SEAL"]);
export type SealCheck = z.infer<typeof SealCheckSchema>;

export const CustodyEventTypeSchema = z.enum([
  "ORDER_CREATED",
  "INTERSTATE_PLANNED",
  "PARK_DROPOFF",
  "DEPARTED",
  "RETRIEVAL_ASSIGNED",
  "PARK_RETRIEVED",
  "SEAL_BROKEN",
  "OVERDUE_FLAGGED",
  "PARTNER_RECEIVED",
  "DELIVERED",
]);
export type CustodyEventType = z.infer<typeof CustodyEventTypeSchema>;

export const InterstatePlanSchema = z.object({
  originState: z.string().min(2, "Origin state is required"),
  destState: z.string().min(2, "Destination state is required"),
  originPark: z.string().min(2).optional(),
  destPark: z.string().min(2).optional(),
  originRiderId: z.string().optional(),
  destRiderId: z.string().optional(),
});
export type InterstatePlanInput = z.infer<typeof InterstatePlanSchema>;

export const ParkDropoffSchema = z
  .object({
    originPark: z.string().min(2, "Origin park is required"),
    destPark: z.string().min(2).optional(),
    transportCompany: z.string().min(2, "Transport company is required"),
    vehiclePlate: z.string().optional(),
    vehicleDescription: z.string().optional(),
    waybillNumber: z.string().min(2, "Waybill number is required"),
    waybillPhotoUrl: z.string().min(4, "Waybill photo is required"),
    sealNumber: z.string().optional(),
    fareAmountNgn: z.number().min(0).optional(),
    fareReceiptPhotoUrl: z.string().optional(),
    photoUrls: z.array(z.string()).min(1, "At least one parcel photo is required"),
    driverPhone: z.string().optional(),
    driverNote: z.string().optional(),
    departedAt: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => (v.vehiclePlate ?? "").trim() !== "" || (v.vehicleDescription ?? "").trim() !== "", {
    message: "Bus plate or description is required",
    path: ["vehiclePlate"],
  });
export type ParkDropoffInput = z.infer<typeof ParkDropoffSchema>;

export const RetrievalAssignSchema = z.object({
  riderProfileId: z.string().min(2).optional(),
  partnerName: z.string().min(2).optional(),
  partnerDepot: z.string().min(2).optional(),
});
export type RetrievalAssignInput = z.infer<typeof RetrievalAssignSchema>;

export const ParkRetrievedSchema = z.object({
  photoUrls: z.array(z.string()).min(1, "Retrieval photo is required"),
  sealCheck: SealCheckSchema,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().optional(),
});
export type ParkRetrievedInput = z.infer<typeof ParkRetrievedSchema>;
