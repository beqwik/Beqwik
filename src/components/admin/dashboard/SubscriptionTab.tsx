interface SubscriptionTabProps {
  memberSubscriptions: any[];
  members: any[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  onGrantSubscription: () => void;
}

export default function SubscriptionTab({
  memberSubscriptions,
  members,
  formatCurrency,
  formatDate,
  onGrantSubscription,
}: SubscriptionTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">
          Member Subscription Logs
        </h3>
        <button
          onClick={onGrantSubscription}
          className="px-5 py-2.5 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#e05275]/20"
        >
          ➕ Grant Subscription
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Plan Details</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {memberSubscriptions.length > 0 ? (
                memberSubscriptions.map((sub) => {
                  const memberObj = members.find((m) => m.id === sub.member_id);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {memberObj?.full_name || "Unknown Member"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {memberObj?.email || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {sub.plan_name || "Internal Plan"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-xs">
                          {formatDate(sub.start_date)} → {formatDate(sub.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(sub.amount || sub.amount_paid || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            sub.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {sub.status === "active" ? "Active" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    💳 No member subscriptions registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
