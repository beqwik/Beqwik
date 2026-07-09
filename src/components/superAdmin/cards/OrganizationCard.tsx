interface OrganizationCardProps {
  organizationName: string;
  organizationType: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function OrganizationCard({
  organizationName,
  organizationType,
  email,
  phone,
  createdAt,
}: OrganizationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800">
            {organizationName}
          </h3>

          <p className="text-sm text-slate-500">
            {organizationType}
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p>{email}</p>
        <p>{phone}</p>
      </div>
    </div>
  );
}