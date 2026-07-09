import { useEffect, useState } from "react";
import { getCurrentMember } from "../../services/member/memberAuth";
import { getMemberSubscriptions } from "../../services/member/memberSubscriptionService";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700";
    case "expired": return "bg-red-100 text-red-600";
    case "cancelled": return "bg-slate-100 text-slate-500";
    default: return "bg-yellow-100 text-yellow-700";
  }
}

export default function MemberSubscription() {
  const member = getCurrentMember();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubs() {
      if (!member?.id) { setLoading(false); return; }
      try {
        const data = await getMemberSubscriptions(member.id);
        setSubscriptions(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSubs();
  }, [member?.id]);

  const active = subscriptions.find((s) => s.status === "active");
  const history = subscriptions.filter((s) => s.status !== "active");

  return (
    <div className="space-y-8 max-w-3xl">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>
        <p className="text-slate-500 mt-1">Manage your current plan and view history.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#e05275] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ACTIVE SUBSCRIPTION */}
          {active ? (
            <div className="bg-gradient-to-br from-[#e05275] to-[#b55fe6] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-pink-200 text-sm font-medium">Current Plan</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {active.subscription_plans?.name || active.plan_name || "Membership"}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Start Date", value: active.start_date ? formatDate(active.start_date) : "—" },
                  { label: "End Date", value: active.end_date ? formatDate(active.end_date) : "—" },
                  { label: "Days Left", value: active.end_date ? `${getDaysRemaining(active.end_date)} days` : "—" },
                  { label: "Amount", value: active.amount ? `₹${active.amount}` : "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-pink-200 text-xs">{item.label}</p>
                    <p className="font-semibold mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {active.end_date && getDaysRemaining(active.end_date) <= 7 && (
                <div className="mt-4 bg-yellow-400/20 border border-yellow-300/30 rounded-xl px-4 py-3 text-yellow-200 text-sm flex items-center gap-2">
                  ⚠️ Your subscription expires in {getDaysRemaining(active.end_date)} days. Contact your organization to renew.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-semibold text-slate-900 mb-1">No Active Subscription</h3>
              <p className="text-slate-500 text-sm">Contact your organization to subscribe.</p>
            </div>
          )}

          {/* PLAN FEATURES */}
          {active?.subscription_plans && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {active.subscription_plans.description && (
                  <div className="sm:col-span-2 text-slate-600 text-sm bg-slate-50 rounded-xl p-4">
                    {active.subscription_plans.description}
                  </div>
                )}
                {active.subscription_plans.price && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Price</p>
                    <p className="font-bold text-slate-900 mt-1 text-lg">₹{active.subscription_plans.price}</p>
                  </div>
                )}
                {active.subscription_plans.duration_days && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Duration</p>
                    <p className="font-bold text-slate-900 mt-1 text-lg">{active.subscription_plans.duration_days} Days</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBSCRIPTION HISTORY */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription History</h2>
              <div className="space-y-3">
                {history.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {sub.subscription_plans?.name || sub.plan_name || "Plan"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.start_date ? formatDate(sub.start_date) : "—"} → {sub.end_date ? formatDate(sub.end_date) : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(sub.status)}`}>
                        {sub.status}
                      </span>
                      {sub.amount && (
                        <p className="text-xs text-slate-400 mt-1">₹{sub.amount}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
