import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getMemberSubscriptions } from "../../services/member/memberSubscriptionService";
import { supabase } from "../../services/supabase";

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
    case "pending": return "bg-blue-100 text-blue-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function MemberSubscription() {
  const member = getCurrentMember();
  const organization = getCurrentOrganization();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

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
  const pending = subscriptions.find((s) => s.status === "pending" || s.payment_status === "pending");
  const history = subscriptions.filter(
    (s) => s.status !== "active" && s.status !== "pending" && s.payment_status !== "pending"
  );

  const handlePay = async (sub: any) => {
    if (!sub) return;
    setPaymentLoading(true);
    try {
      // 1. Fetch public key for the organization
      const { data: keyId, error: keyError } = await supabase.rpc("get_organization_razorpay_key", {
        org_id: sub.organization_id,
      });

      if (keyError || !keyId) {
        alert("This organization has not configured online payments yet. Please contact the administrator.");
        setPaymentLoading(false);
        return;
      }

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay SDK.");
        setPaymentLoading(false);
        return;
      }

      // 3. Configure checkout options
      const options = {
        key: keyId,
        amount: Math.round(sub.amount * 100), // paise
        currency: "INR",
        name: organization?.organization_name || "Membership Payment",
        description: `${sub.plan_name || "Subscription"} payment`,
        prefill: {
          name: member?.full_name || "",
          email: member?.email || "",
          contact: member?.phone || "",
        },
        handler: async function (response: any) {
          const paymentId = response.razorpay_payment_id;
          try {
            // Invoke the Edge Function to verify payment and activate subscription
            const { data, error: verifyError } = await supabase.functions.invoke(
              "member-razorpay-verify",
              {
                body: {
                  paymentId,
                  organizationId: sub.organization_id,
                  memberId: sub.member_id,
                  subscriptionId: sub.id,
                },
              }
            );

            if (!verifyError && data && data.success) {
              alert("Payment successful! Your subscription is now active.");
              window.location.reload();
            } else {
              alert("Verification failed: " + (verifyError?.message || data?.error || "Unknown error"));
            }
          } catch (e: any) {
            alert("Error during payment verification: " + e.message);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      alert("Payment initiation failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRenew = async (activeSub: any) => {
    if (!activeSub) return;
    const confirmRenew = window.confirm(`Are you sure you want to renew your ${activeSub.plan_name} for ₹${activeSub.amount}?`);
    if (!confirmRenew) return;

    setPaymentLoading(true);
    try {
      const start = new Date(activeSub.end_date);
      const durationMs = new Date(activeSub.end_date).getTime() - new Date(activeSub.start_date).getTime();
      const end = new Date(start.getTime() + durationMs);

      const payload = {
        organization_id: activeSub.organization_id,
        member_id: activeSub.member_id,
        plan_name: activeSub.plan_name,
        amount: activeSub.amount,
        amount_paid: 0,
        status: "pending",
        payment_status: "pending",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        renewed_from: activeSub.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("subscriptions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      // Trigger checkout for the newly created pending subscription
      await handlePay(data);
    } catch (err: any) {
      console.error("Renewal initiation error:", err);
      alert("Failed to initiate renewal. " + err.message);
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>
        <p className="text-slate-500 mt-1">Manage your current plan and view history.</p>
      </div>

      {loading || paymentLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-8 h-8 border-4 border-[#e05275] border-t-transparent rounded-full animate-spin" />
          {paymentLoading && <p className="text-slate-400 text-xs font-semibold">Initiating checkout...</p>}
        </div>
      ) : (
        <>
          {/* PENDING SUBSCRIPTION */}
          {pending && (
            <div className="bg-gradient-to-br from-indigo-650 to-violet-750 rounded-2xl p-6 text-white shadow-lg animate-fadeIn border border-indigo-500/20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-indigo-200 text-sm font-medium">Pending Subscription Payment</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {pending.plan_name || "Membership Plan"}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold animate-pulse">
                  Pending Payment
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Start Date", value: pending.start_date ? formatDate(pending.start_date) : "—" },
                  { label: "End Date", value: pending.end_date ? formatDate(pending.end_date) : "—" },
                  { label: "Amount Due", value: pending.amount ? `₹${pending.amount}` : "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-indigo-100 text-xs">{item.label}</p>
                    <p className="font-semibold mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handlePay(pending)}
                  className="px-6 py-3 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  💳 Pay Online Now
                </button>
              </div>
            </div>
          )}

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

              <div className="mt-6 flex justify-between items-center border-t border-white/15 pt-4">
                <p className="text-xs text-pink-200 font-medium">
                  Need to renew or extend this subscription plan?
                </p>
                <button
                  onClick={() => handleRenew(active)}
                  className="px-5 py-2.5 bg-white text-pink-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  🔄 Renew Plan
                </button>
              </div>
            </div>
          ) : (
            !pending && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-semibold text-slate-900 mb-1">No Active Subscription</h3>
                <p className="text-slate-500 text-sm">Contact your organization to subscribe.</p>
              </div>
            )
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
