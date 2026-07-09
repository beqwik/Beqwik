interface RevenueCardProps {
  organizationName: string;
  amount: number;
  status: string;
  paidAt: string;
}

export default function RevenueCard({
  organizationName,
  amount,
  status,
  paidAt,
}: RevenueCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
      <div className="flex justify-between">
        <h3 className="font-bold text-slate-800">
          {organizationName}
        </h3>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            status === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-bold">
        ₹{amount.toLocaleString()}
      </h2>

      <p className="text-sm text-slate-500 mt-2">
        {new Date(paidAt).toLocaleDateString()}
      </p>
    </div>
  );
}