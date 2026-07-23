import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getMemberSubscriptions } from "../../services/member/memberSubscriptionService";
import { getGymPlans, type GymPlan } from "../../services/organization/planService";
import { supabase } from "../../services/supabase";
import { Tag, CheckCircle2, X, ShieldCheck, AlertTriangle } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
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
  if ((window as any).Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Confirmation Modal ────────────────────────────────────────────────────────
interface ConfirmModalProps {
  plan: GymPlan;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmPurchaseModal({ plan, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-fadeIn">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>

        <h2 className="text-xl font-black text-slate-900 text-center mb-1">Confirm Purchase</h2>
        <p className="text-slate-500 text-xs text-center mb-6">You are about to subscribe to the following plan</p>

        {/* Plan details */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Plan Name</span>
            <span className="text-sm font-bold text-slate-900">{plan.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Duration</span>
            <span className="text-sm font-bold text-slate-900">
              {plan.duration_months} Month{plan.duration_months > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="text-xs text-slate-500 font-medium">Amount to Pay</span>
            <span className="text-2xl font-black text-blue-600">₹{plan.price}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mb-6 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          You will be redirected to a secure payment gateway
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Renew Confirmation Modal ──────────────────────────────────────────────────
interface RenewModalProps {
  sub: any;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmRenewModal({ sub, onConfirm, onCancel }: RenewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🔄</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 text-center mb-1">Renew Membership</h2>
        <p className="text-slate-500 text-xs text-center mb-6">Extend your current active plan</p>

        <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Current End Date</span>
            <span className="text-sm font-bold text-slate-900">{sub.end_date ? formatDate(sub.end_date) : "—"}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="text-xs text-slate-500 font-medium">Renewal Amount</span>
            <span className="text-2xl font-black text-emerald-600">₹{sub.amount}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition cursor-pointer">
            No, Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg cursor-pointer">
            Yes, Renew
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MemberSubscription() {
  const member = getCurrentMember();
  const organization = getCurrentOrganization();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmPlan, setConfirmPlan] = useState<GymPlan | null>(null);
  const [confirmRenewSub, setConfirmRenewSub] = useState<any>(null);

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!member?.id) { setLoading(false); return; }
      try {
        // Resolve org ID — prefer localStorage, fall back to member_credentials
        let orgId: string | null = organization?.id ?? null;
        if (!orgId) {
          const { data: cred } = await supabase
            .from("member_credentials")
            .select("organization_id")
            .eq("member_id", member.id)
            .maybeSingle();
          orgId = cred?.organization_id ?? null;
        }
        setResolvedOrgId(orgId);

        const [subsData, plansData] = await Promise.all([
          getMemberSubscriptions(member.id),
          orgId ? getGymPlans(orgId) : Promise.resolve([]),
        ]);

        setSubscriptions(subsData || []);
        setAvailablePlans((plansData || []).filter((p) => p.is_active !== false));
      } catch (e) {
        console.error("Failed to load subscription page:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [member?.id, organization?.id]);

  const active = subscriptions.find((s) => s.status === "active");
  const pending = subscriptions.find((s) => s.status === "pending" || s.payment_status === "pending");
  const history = subscriptions.filter(
    (s) => s.status !== "active" && s.status !== "pending" && s.payment_status !== "pending"
  );

  // ── Razorpay Payment Trigger ─────────────────────────────────────────────────
  const handlePay = async (sub: any) => {
    if (!sub) return;
    setPaymentLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { alert("Failed to load Razorpay SDK."); return; }

      const { data, error } = await supabase.functions.invoke("member_create_payment_order", {
        body: { subscriptionId: sub.id },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Unable to create payment order.");

      const options = {
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: organization?.organization_name || organization?.name || "Gym Membership",
        description: "Gym Membership Subscription",
        prefill: {
          name: member?.full_name ?? "",
          email: member?.email ?? "",
          contact: member?.phone ?? "",
        },
        handler: async function (response: any) {
          try {
            const verify = await supabase.functions.invoke("member_verify_payment", {
              body: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            if (verify.error) throw verify.error;
            if (!verify.data?.success) throw new Error(verify.data?.error ?? "Payment verification failed.");

            alert("✅ Payment Successful! Your subscription is now Active.");
            window.location.reload();
          } catch (err: any) {
            console.error(err);
            alert(err.message ?? "Payment verification failed.");
          }
        },
        modal: { ondismiss: () => setPaymentLoading(false) },
        theme: { color: "#2563eb" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Unable to initiate payment.");
      setPaymentLoading(false);
    }
  };

  // ── Purchase Plan (via edge function to bypass RLS) ──────────────────────────
  const handlePurchasePlan = async (plan: GymPlan) => {
    const orgId = resolvedOrgId ?? organization?.id;
    if (!member?.id || !orgId) {
      alert("Could not determine your organization. Please log out and log back in.");
      return;
    }
    setPaymentLoading(true);
    try {
      // Create subscription record server-side (bypasses RLS)
      const { data, error } = await supabase.functions.invoke("member_purchase_plan", {
        body: {
          gymPlanId: plan.id,
          memberId: member.id,
          organizationId: orgId,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Failed to create subscription.");

      // Now trigger Razorpay with the new subscriptionId
      await handlePay({ id: data.subscriptionId, amount: plan.price });
    } catch (err: any) {
      console.error("Purchase error:", err);
      alert("Failed to initiate purchase: " + err.message);
      setPaymentLoading(false);
    }
  };

  // ── Renew Plan ───────────────────────────────────────────────────────────────
  const handleRenew = async (activeSub: any) => {
    const orgId = resolvedOrgId ?? organization?.id;
    if (!activeSub || !orgId) return;
    setPaymentLoading(true);
    try {
      const start = new Date(activeSub.end_date);
      const durationMs = new Date(activeSub.end_date).getTime() - new Date(activeSub.start_date).getTime();
      const end = new Date(start.getTime() + durationMs);

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          organization_id: orgId,
          member_id: activeSub.member_id,
          subscription_plan_id: activeSub.subscription_plan_id,
          amount: activeSub.amount,
          amount_paid: 0,
          status: "pending",
          payment_status: "pending",
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          auto_renew: false,
          renewed_from: activeSub.id,
        })
        .select()
        .single();

      if (error) throw error;
      await handlePay(data);
    } catch (err: any) {
      console.error("Renewal error:", err);
      alert("Failed to initiate renewal: " + err.message);
      setPaymentLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Confirm Purchase Modal ── */}
      {confirmPlan && (
        <ConfirmPurchaseModal
          plan={confirmPlan}
          onConfirm={() => {
            const plan = confirmPlan;
            setConfirmPlan(null);
            handlePurchasePlan(plan);
          }}
          onCancel={() => setConfirmPlan(null)}
        />
      )}

      {/* ── Confirm Renew Modal ── */}
      {confirmRenewSub && (
        <ConfirmRenewModal
          sub={confirmRenewSub}
          onConfirm={() => {
            const sub = confirmRenewSub;
            setConfirmRenewSub(null);
            handleRenew(sub);
          }}
          onCancel={() => setConfirmRenewSub(null)}
        />
      )}

      <div className="space-y-8 max-w-4xl animate-fadeIn">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Membership Subscription</h1>
          <p className="text-slate-500 mt-1">Manage your active gym plan, purchase new packages, and view history.</p>
        </div>

        {loading || paymentLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            {paymentLoading && <p className="text-slate-500 text-xs font-bold">Opening secure payment checkout...</p>}
          </div>
        ) : (
          <>
            {/* PENDING PAYMENT BANNER */}
            {pending && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl animate-fadeIn border border-indigo-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                      Payment Required
                    </span>
                    <h2 className="text-2xl font-bold mt-2">Pending Payment</h2>
                    <p className="text-slate-300 text-xs mt-1">Complete your payment to activate your gym access.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-400">₹{pending.amount}</div>
                    <button
                      onClick={() => handlePay(pending)}
                      className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      💳 Pay Online Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE SUBSCRIPTION CARD */}
            {active ? (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-blue-200 text-xs font-bold uppercase tracking-wider">Current Active Membership</span>
                    <h2 className="text-3xl font-black mt-1">Gym Pass</h2>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Plan
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Start Date", value: active.start_date ? formatDate(active.start_date) : "—" },
                    { label: "End Date", value: active.end_date ? formatDate(active.end_date) : "—" },
                    { label: "Days Left", value: active.end_date ? `${getDaysRemaining(active.end_date)} days` : "—" },
                    { label: "Amount Paid", value: active.amount ? `₹${active.amount}` : "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-2xl p-4">
                      <p className="text-blue-200 text-xs font-medium">{item.label}</p>
                      <p className="font-extrabold text-sm mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/15 pt-5 gap-4">
                  <p className="text-xs text-blue-200 font-medium">Renew or extend your active subscription anytime.</p>
                  <button
                    onClick={() => setConfirmRenewSub(active)}
                    className="px-5 py-2.5 bg-white text-blue-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    🔄 Extend / Renew Plan
                  </button>
                </div>
              </div>
            ) : (
              !pending && (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                    💳
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg mb-1">No Active Membership Subscription</h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    Select one of the gym membership plans below to purchase and start your training immediately.
                  </p>
                </div>
              )
            )}

            {/* AVAILABLE PLANS */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" /> Available Membership Plans
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Plans configured by{" "}
                  <span className="font-bold text-slate-700">
                    {organization?.organization_name || organization?.name || "Gym Management"}
                  </span>
                </p>
              </div>

              {availablePlans.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {plan.duration_months} Month{plan.duration_months > 1 ? "s" : ""} Pass
                        </span>
                        <h3 className="font-black text-slate-900 text-xl mt-3">{plan.name}</h3>
                        <div className="my-3">
                          <span className="text-3xl font-black text-blue-600">₹{plan.price}</span>
                          <span className="text-xs text-slate-400 font-semibold"> / {plan.duration_months} mo</span>
                        </div>
                        {plan.description && (
                          <p className="text-slate-500 text-xs leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl">
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => setConfirmPlan(plan)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          💳 Buy Subscription
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs italic">
                  No active membership plans posted by administration yet.
                </div>
              )}
            </div>

            {/* SUBSCRIPTION HISTORY */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Subscription History</h2>
                <div className="space-y-3">
                  {history.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Gym Pass</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sub.start_date ? formatDate(sub.start_date) : "—"} → {sub.end_date ? formatDate(sub.end_date) : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(sub.status)}`}>
                          {sub.status}
                        </span>
                        {sub.amount && (
                          <p className="text-xs font-bold text-slate-700 mt-1">₹{sub.amount}</p>
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
    </>
  );
}
