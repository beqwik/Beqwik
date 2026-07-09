import type { DashboardStats } from "../../../types/superAdmin/dashboard";

interface Props {
  dashboard: DashboardStats;
}

export default function RecentActivitySection({
  dashboard,
}: Props) {
  return (
    <div>

      <h2 className="text-xl font-bold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {dashboard.activityLogs.map((activity) => (
          <div
            key={activity.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="font-semibold">
              {activity.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {activity.description}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}