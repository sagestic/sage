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
  "CUSTOM_WEBHOOK",
]);
export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;

export const IntegrationStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ERROR",
  "SYNCING",
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

// Form schemas for React Hook Form + Zod
export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(2, "Order number is required"),
  source: z.string().default("MANUAL"),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(5, "Customer phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  priority: OrderPrioritySchema.default("STANDARD"),
  packageSize: z.string().default("MEDIUM"),
  notes: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const InviteRiderSchema = z.object({
  name: z.string().min(2, "Rider name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(8, "Phone number is required"),
  vehicleType: VehicleTypeSchema.default("MOTORCYCLE"),
  capacityScore: z.number().min(10).max(500).default(100),
  role: RoleSchema.default("RIDER"),
});
export type InviteRiderInput = z.infer<typeof InviteRiderSchema>;

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
