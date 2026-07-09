import { useDashboard } from "../../hooks/superAdmin/useDashboard";

import DashboardHeader from "../../components/superAdmin/sections/DashboardHeader";
import StatsSection from "../../components/superAdmin/sections/StatsSection";
import ChartsSection from "../../components/superAdmin/sections/ChartsSection";
import KPISection from "../../components/superAdmin/sections/KPISection";
import RecentOrganizationsSection from "../../components/superAdmin/sections/RecentOrganizationsSection";
import RecentPaymentsSection from "../../components/superAdmin/sections/RecentPaymentsSection";
import RecentSubscriptionsSection from "../../components/superAdmin/sections/RecentSubscriptionsSection";
import RecentActivitySection from "../../components/superAdmin/sections/RecentActivitySection";

export default function Dashboard() {
  const {
    stats,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <DashboardHeader />

      <StatsSection
        dashboard={stats}
        loading={loading}
      />

      <ChartsSection
        dashboard={stats}
      />

      <KPISection
        dashboard={stats}
      />

      <RecentOrganizationsSection
        dashboard={stats}
      />

      <RecentPaymentsSection
        dashboard={stats}
      />

      <RecentSubscriptionsSection
        dashboard={stats}
      />

      <RecentActivitySection
        dashboard={stats}
      />

    </div>
  );
}