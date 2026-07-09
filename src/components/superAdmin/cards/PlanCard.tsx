interface PlanCardProps {
  organizationName: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function PlanCard({
  organizationName,
  planName,
  status,
  startDate,
  endDate,
}: PlanCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">
          {organizationName}
        </h3>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-2 text-blue-600 font-semibold">
        {planName}
      </p>

      <div className="mt-4 text-sm text-slate-500">
        <p>
          {new Date(startDate).toLocaleDateString()}
        </p>

        <p>
          {new Date(endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
