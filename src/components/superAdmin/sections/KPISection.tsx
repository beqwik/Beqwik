import type { DashboardStats } from "../../../types/superAdmin/dashboard";

interface Props {
  dashboard: DashboardStats;
}

export default function KPISection({
  dashboard,
}: Props) {
  const kpis = [
    {
      title: "Trial Organizations",
      value: dashboard.kpis.trialOrganizations,
    },
    {
      title: "Active Organizations",
      value: dashboard.kpis.activeOrganizations,
    },
    {
      title: "Expired Organizations",
      value: dashboard.kpis.expiredOrganizations,
    },
    {
      title: "Pending Payments",
      value: dashboard.kpis.pendingPayments,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpis.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl bg-white border border-slate-200 p-6"
        >
          <p className="text-sm text-slate-500">
            {item.title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
}