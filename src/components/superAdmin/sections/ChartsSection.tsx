import type { DashboardStats } from "../../../types/superAdmin/dashboard";

import RevenueChart from "../charts/RevenueChart";
import OrganizationTypesChart from "../charts/OrganizationTypesChart";

interface ChartsSectionProps {
  dashboard: DashboardStats;
}

export default function ChartsSection({
  dashboard,
}: ChartsSectionProps) {
  return (
    <div className="grid gap-8 xl:grid-cols-3">
      {/* Revenue Chart */}
      <div className="xl:col-span-2">
        <RevenueChart
          data={dashboard.revenueTrend}
        />
      </div>

      {/* Organization Types */}
      <OrganizationTypesChart
        data={dashboard.organizationTypes}
        totalOrganizations={dashboard.organizations}
      />
    </div>
  );
}