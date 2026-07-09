import type { DashboardStats } from "../../../types/superAdmin/dashboard";
import OrganizationCard from "../cards/OrganizationCard";

interface Props {
  dashboard: DashboardStats;
}

export default function RecentOrganizationsSection({
  dashboard,
}: Props) {
  return (
    <div>

      <h2 className="text-xl font-bold mb-6">
        Recent Organizations
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {dashboard.recentOrganizations.map((org) => (
          <OrganizationCard
            key={org.id}
            organizationName={org.organization_name}
            organizationType={org.organization_type}
            email={org.email}
            phone={org.phone}
            createdAt={org.created_at}
          />
        ))}

      </div>

    </div>
  );
}