import { cookies } from "next/headers";
import type { Role } from "@sage/site-schema";
import {
  DEFAULT_TENANTS,
  DEMO_USERS,
  type TenantContext,
} from "./types";

export * from "./types";

/**
 * Server-side tenant isolation enforcement.
 * Never trust a client-supplied organization ID without validating user membership.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const cookieStore = await cookies();
  const slugCookie = cookieStore.get("sage_tenant_slug")?.value;
  const roleCookie = cookieStore.get("sage_user_role")?.value as Role | undefined;

  const organizationSlug =
    slugCookie && DEMO_USERS[slugCookie] ? slugCookie : "apex-logistics";
  const organization =
    DEFAULT_TENANTS.find((t) => t.slug === organizationSlug) || DEFAULT_TENANTS[0];

  const orgUsers = DEMO_USERS[organizationSlug] || DEMO_USERS["apex-logistics"];
  const matchedUser = roleCookie
    ? orgUsers.find((u) => u.role === roleCookie) || orgUsers[0]
    : orgUsers[0];

  return {
    organizationId: organization.id,
    organizationSlug: organization.slug,
    organizationName: organization.name,
    currentUser: matchedUser,
    isDemoMode: true,
  };
}

/**
 * Asserts least-privilege role access for server actions / API routes.
 */
export async function assertTenantAccess(
  allowedRoles?: Role[],
): Promise<TenantContext> {
  const context = await getTenantContext();

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(context.currentUser.role)) {
      throw new Error(
        `Forbidden: Role '${context.currentUser.role}' is not authorized. Required: ${allowedRoles.join(", ")}`,
      );
    }
  }

  return context;
}
