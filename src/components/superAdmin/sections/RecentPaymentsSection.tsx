import type { DashboardStats } from "../../../types/superAdmin/dashboard";

import RevenueCard from "../cards/RevenueCard";

interface Props {
  dashboard: DashboardStats;
}

export default function RecentPaymentsSection({
  dashboard,
}: Props) {
  return (
    <div>

      <h2 className="text-xl font-bold mb-6">
        Recent Payments
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {dashboard.recentPayments.map((payment) => (
          <RevenueCard
            key={payment.id}
            organizationName={payment.organization_name}
            amount={payment.amount}
            status={payment.payment_status}
            paidAt={payment.paid_at}
          />
        ))}

      </div>

    </div>
  );
}