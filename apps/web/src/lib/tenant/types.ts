import type { Role } from "@sage/site-schema";

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
}

export interface TenantContext {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  currentUser: TenantUser;
  isDemoMode: boolean;
}

export const DEFAULT_TENANTS = [
  {
    id: "org_apex_logistics",
    name: "Apex Express Logistics",
    slug: "apex-logistics",
    logo: "⚡",
  },
  {
    id: "org_metro_swift",
    name: "MetroSwift Delivery Co",
    slug: "metro-swift",
    logo: "🚀",
  },
];

export const DEMO_USERS: Record<string, TenantUser[]> = {
  "apex-logistics": [
    {
      id: "usr_apex_admin",
      name: "Alex Vance",
      email: "alex.admin@apexlogistics.com",
      role: "ORG_ADMIN",
      organizationId: "org_apex_logistics",
      organizationName: "Apex Express Logistics",
      organizationSlug: "apex-logistics",
    },
    {
      id: "usr_apex_dispatcher",
      name: "Sarah Chen",
      email: "sarah.dispatch@apexlogistics.com",
      role: "DISPATCHER",
      organizationId: "org_apex_logistics",
      organizationName: "Apex Express Logistics",
      organizationSlug: "apex-logistics",
    },
    {
      id: "usr_apex_rider_1",
      name: "Marcus Thorne",
      email: "marcus.rider@apexlogistics.com",
      role: "RIDER",
      organizationId: "org_apex_logistics",
      organizationName: "Apex Express Logistics",
      organizationSlug: "apex-logistics",
    },
  ],
  "metro-swift": [
    {
      id: "usr_metro_admin",
      name: "Elena Rostova",
      email: "elena@metroswift.com",
      role: "ORG_ADMIN",
      organizationId: "org_metro_swift",
      organizationName: "MetroSwift Delivery Co",
      organizationSlug: "metro-swift",
    },
    {
      id: "usr_metro_dispatcher",
      name: "David Kim",
      email: "david@metroswift.com",
      role: "DISPATCHER",
      organizationId: "org_metro_swift",
      organizationName: "MetroSwift Delivery Co",
      organizationSlug: "metro-swift",
    },
    {
      id: "usr_metro_rider_1",
      name: "Leo Rivera",
      email: "leo.rider@metroswift.com",
      role: "RIDER",
      organizationId: "org_metro_swift",
      organizationName: "MetroSwift Delivery Co",
      organizationSlug: "metro-swift",
    },
  ],
};
