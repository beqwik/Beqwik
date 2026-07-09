import { CheckCircle2, Wallet, Receipt } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  organizations?: { organization_name?: string; organization?: string };
  subscription_plans?: { name?: string; monthly_price?: number };
}

interface Props {
  subscriptions: Subscription[];
  loading: boolean;
}

export default function OrgSubscriptionsList({
  subscriptions,
  loading,
}: Props) {
  const activeCount = subscriptions.filter(
    (s) => s.status === "active"
  ).length;

  const monthlyRevenue = subscriptions.reduce(
    (sum, s) => sum + Number(s.subscription_plans?.monthly_price || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-slate-500">
              Total Subscriptions
            </p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff9c74] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {subscriptions.length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Total issued agreements
            </span>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-slate-500">Active Plans</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-600">
              {activeCount}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Currently active plans
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-slate-500">Monthly Revenue</p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e05275] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-[#e05275]">
              ₹{monthlyRevenue.toLocaleString("en-IN")}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Expected monthly run-rate
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">
            Organization Subscription Records
          </h3>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            All active and historical org subscriptions
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            Loading subscriptions…
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No subscription records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100/80">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-5 pl-8">Organization</th>
                  <th className="text-left p-5">Plan</th>
                  <th className="text-left p-5">Price</th>
                  <th className="text-left p-5">Start Date</th>
                  <th className="text-left p-5">End Date</th>
                  <th className="text-left p-5">Auto Renew</th>
                  <th className="text-left p-5 pr-8">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/30 transition duration-200"
                  >
                    <td className="p-5 pl-8 font-bold text-slate-800">
                      {sub.organizations?.organization_name ||
                        sub.organizations?.organization ||
                        "—"}
                    </td>

                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-purple-50 text-brand-purple text-xs font-semibold border border-purple-100">
                        {sub.subscription_plans?.name ?? "—"}
                      </span>
                    </td>

                    <td className="p-5 font-bold text-slate-800">
                      {sub.subscription_plans?.monthly_price != null
                        ? `₹${Number(sub.subscription_plans.monthly_price).toLocaleString("en-IN")}`
                        : "—"}
                    </td>

                    <td className="p-5 text-sm text-slate-600">
                      {sub.start_date
                        ? new Date(sub.start_date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td className="p-5 text-sm text-slate-600">
                      {sub.end_date
                        ? new Date(sub.end_date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td className="p-5">
                      {sub.auto_renew ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-[#e05275] text-xs font-semibold border border-rose-100">
                          <span className="w-1.5 h-1.5 bg-[#e05275] rounded-full" />
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="p-5 pr-8">
                      {sub.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-[#e05275] text-xs font-semibold border border-rose-100">
                          <span className="w-1.5 h-1.5 bg-[#e05275] rounded-full" />
                          {sub.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
