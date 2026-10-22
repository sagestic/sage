import type { ReactNode } from "react";
import { DashboardHeader } from "../../components/layout/dashboard-header";
import { DashboardSidebar } from "../../components/layout/dashboard-sidebar";
import { sageRepo } from "../../lib/data/sage-repo";
import { getTenantContext } from "../../lib/tenant/context";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await getTenantContext();
  const incidents = sageRepo.getIncidents(context.organizationId);
  const openIncidentsCount = incidents.filter((i) => i.status !== "RESOLVED").length;
  const recommendations = sageRepo.getRecommendations(context.organizationId);
  const pendingRecsCount = recommendations.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        currentTenantSlug={context.organizationSlug}
        openIncidentsCount={openIncidentsCount}
        pendingRecsCount={pendingRecsCount}
      />
      <div className="flex flex-1 flex-col pl-64">
        <DashboardHeader
          currentUser={context.currentUser}
          incidents={incidents}
        />
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
