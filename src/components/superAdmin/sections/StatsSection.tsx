import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import type { DashboardStats } from "../../../types/superAdmin/dashboard";

import StatsCard from "../cards/StatsCard";

interface Props {
  dashboard: DashboardStats;
  loading?: boolean;
}

export default function StatsSection({
  dashboard,
  loading = false,
}: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">

      <StatsCard
        title="Total Revenue"
        value={dashboard.revenue >= 100000 ? `₹${(dashboard.revenue / 100000).toFixed(1)}L` : `₹${dashboard.revenue.toLocaleString()}`}
        loading={loading}
        icon={<IndianRupee className="w-5 h-5" />}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        change="↑ 16.2% vs last month"
      />

      <StatsCard
        title="Total Customers"
        value={dashboard.organizations.toLocaleString()}
        loading={loading}
        icon={<Users className="w-5 h-5" />}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        change="↑ 8.4% vs last month"
      />

      <StatsCard
        title="Active Subscriptions"
        value={dashboard.subscriptions.toLocaleString()}
        loading={loading}
        icon={<Building2 className="w-5 h-5" />}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        change="↑ 6.7% vs last month"
      />

      <StatsCard
        title="Renewal Rate"
        value="87.5%"
        loading={loading}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        change="↑ 15.7% vs last month"
      />

    </div>
  );
}