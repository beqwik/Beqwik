import type { DashboardStats } from "../../../types/superAdmin/dashboard";

import PlanCard from "../cards/PlanCard";

interface Props {
  dashboard: DashboardStats;
}

export default function RecentSubscriptionsSection({
  dashboard,
}: Props) {
  return (
    <div>

      <h2 className="text-xl font-bold mb-6">
        Recent Subscriptions
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {dashboard.recentSubscriptions.map((subscription) => (
          <PlanCard
            key={subscription.id}
            organizationName={subscription.organization_name}
            planName={subscription.plan_name}
            status={subscription.status}
            startDate={subscription.start_date}
            endDate={subscription.end_date}
          />
        ))}

      </div>

    </div>
  );
}