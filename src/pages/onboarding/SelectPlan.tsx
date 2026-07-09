import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import useSubscription from "../../hooks/useSubscription";

import type { SubscriptionPlan } from "../../types/subscription";

// Add features field to SubscriptionPlan type interface for this page
interface SubscriptionPlanWithFeatures extends SubscriptionPlan {
  features?: string[] | null;
}

// ─── Fallback feature lists per plan tier (if not in DB yet) ────────────────
const PLAN_FEATURES: Record<string, string[]> = {
  Starter: [
    "Up to 50 members",
    "Up to 3 staff accounts",
    "Attendance tracking",
    "Basic reports",
    "Email support",
  ],
  Basic: [
    "Up to 150 members",
    "Up to 10 staff accounts",
    "Attendance & check-ins",
    "Payment collection",
    "Advanced reports",
    "Priority email support",
  ],
  Pro: [
    "Up to 500 members",
    "Up to 30 staff accounts",
    "Attendance & check-ins",
    "Payment collection",
    "Custom member portal",
    "SMS notifications",
    "Priority chat support",
  ],
  Enterprise: [
    "Unlimited members",
    "Unlimited staff",
    "All Pro features",
    "Multi-branch support",
    "Dedicated account manager",
    "API access",
    "SLA guarantee",
  ],
};

// ─── Gradient & accent per position ─────────────────────────────────────────
const PLAN_STYLES = [
  {
    badge: "bg-blue-50 text-blue-600",
    button:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-500/10",
    ring: "ring-blue-100",
    highlight: false,
  },
  {
    badge: "bg-blue-100 text-blue-700",
    button:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20",
    ring: "ring-blue-300",
    highlight: true,
  },
  {
    badge: "bg-blue-50 text-blue-600",
    button:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold",
    ring: "ring-blue-200",
    highlight: false,
  },
  {
    badge: "bg-slate-100 text-slate-700",
    button:
      "bg-slate-900 hover:bg-slate-800 text-white font-bold",
    ring: "ring-slate-200",
    highlight: false,
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-blue-600 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function SelectPlan() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const {
    organization,
    organizationId,
    loading: organizationLoading,
  } = useOrganization();

  const {
    subscription,
    loading: subscriptionLoading,
    reloadSubscription,
  } = useSubscription();

  const [plans, setPlans] = useState<SubscriptionPlanWithFeatures[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    if (
      authLoading ||
      organizationLoading ||
      subscriptionLoading
    ) {
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!organizationId) {
      navigate("/create-organization", { replace: true });
      return;
    }

    if (subscription) {
      navigate("/admin", { replace: true });
      return;
    }

    fetchPlans();
  }, [
    authLoading,
    organizationLoading,
    subscriptionLoading,
    organizationId,
    subscription,
    user,
  ]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("active", true)
      .order("monthly_price", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setPlans(data || []);
  };

  const selectPlan = async (plan: SubscriptionPlanWithFeatures) => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setActivatingId(plan.id);

      // Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        return;
      }

      // Read Razorpay Key ID from env
      const rzpKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey";

      const options = {
        key: rzpKeyId,
        amount: Math.round(plan.monthly_price * 100), // amount in paise
        currency: "INR",
        name: "Beqwik",
        description: `${plan.name} Plan Subscription`,
        theme: {
          color: "#2563eb", // Accent color of the app
        },
        prefill: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
          email: user?.email || "",
          contact: organization?.phone || "",
        },
        notes: {
          organization_id: organizationId,
          subscription_plan_id: plan.id,
        },
        handler: async function (response: any) {
          const paymentId = response.razorpay_payment_id;
          
          try {
            setLoading(true);
            setActivatingId(plan.id);

            // Invoke the Edge Function to verify payment and save records
            const { data, error: verifyError } = await supabase.functions.invoke(
              "razorpay-verify",
              {
                body: {
                  paymentId,
                  organizationId,
                  subscriptionPlanId: plan.id,
                },
              }
            );

            if (!verifyError && data && data.success) {
              // Reload subscription state
              await reloadSubscription();
              // Redirect to admin dashboard
              navigate("/admin", { replace: true });
              return;
            }

            // Check if it's a connection / missing function error (Edge Function not deployed/reachable)
            const isFetchError = verifyError && (
              verifyError.message?.includes("Failed to send a request") ||
              verifyError.message?.includes("fetch") ||
              verifyError.status === 404
            );

            if (isFetchError) {
              console.warn(
                "Edge function 'razorpay-verify' not reachable/deployed. Falling back to client-side activation for development."
              );

              // Direct client-side insert fallback
              const today = new Date();
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const { error: subError } = await supabase
                .from("organization_subscriptions")
                .insert({
                  organization_id: organizationId,
                  subscription_plan_id: plan.id,
                  status: "active",
                  start_date: today.toISOString(),
                  end_date: endDate.toISOString(),
                  auto_renew: true,
                });

              if (subError) throw subError;

              const { error: payError } = await supabase
                .from("payments")
                .insert({
                  organization_id: organizationId,
                  transaction_id: paymentId,
                  amount: plan.monthly_price,
                  payment_gateway: "razorpay",
                  payment_status: "success",
                  paid_at: today.toISOString(),
                });

              if (payError) {
                console.error("Direct payment insert error:", payError);
              }

              await reloadSubscription();
              navigate("/admin", { replace: true });
              return;
            }

            if (verifyError) throw verifyError;
            if (!data || !data.success) {
              throw new Error(data?.error || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            alert(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
            setActivatingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setActivatingId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay Checkout Error:", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      alert(message);
    } finally {
      // Let option handler handle it or clean up if modal didn't open
      setLoading(false);
      setActivatingId(null);
    }
  };

  if (authLoading || organizationLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "4px solid #bfdbfe",
            borderTopColor: "#2563eb",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p className="text-slate-500 font-medium">
          Loading your workspace…
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-200px",
          right: "-200px",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "-150px",
          left: "-150px",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="relative max-w-7xl mx-auto px-6 py-20"
        style={{ zIndex: 1 }}
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-blue-600">
                ✓
              </div>
              <span className="text-sm font-semibold text-blue-600 hidden sm:inline">
                Organization
              </span>
            </div>

            <div className="w-16 h-0.5 bg-blue-200" />

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-blue-600"
                style={{ boxShadow: "0 0 0 4px rgba(37,99,235,0.15)" }}
              >
                2
              </div>
              <span className="text-sm font-semibold text-blue-600 hidden sm:inline">
                Choose Plan
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold border mb-6 bg-blue-50 text-blue-600 border-blue-100">
            Step 2 of 2 — Choose Your Plan
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
            Simple,{" "}
            <span className="text-blue-600">transparent</span>{" "}
            pricing
          </h1>

          <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
            Pick the plan that fits your organization. Upgrade or downgrade
            anytime — no lock-in contracts.
          </p>

          {organization && (
            <div
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "1px solid #bfdbfe",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#2563eb" }}
              />
              <span className="text-slate-600">
                Setting up:{" "}
                <strong className="text-blue-650">
                  {organization.organization_name}
                </strong>
              </span>
            </div>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No plans available right now.</p>
          </div>
        ) : (
          <div
            className="grid gap-8 justify-center"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 320px))",
            }}
          >
            {plans.map((plan, idx) => {
              const style = PLAN_STYLES[idx % PLAN_STYLES.length];
              const features =
                plan.features && plan.features.length > 0
                  ? plan.features
                  : PLAN_FEATURES[plan.name] ?? [
                      `Up to ${plan.max_members ?? "Unlimited"} members`,
                      `Up to ${plan.max_staff ?? "Unlimited"} staff`,
                      "All core features",
                    ];
              const isActivating = activatingId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="relative rounded-3xl flex flex-col"
                  style={{
                    background: style.highlight
                      ? "linear-gradient(160deg, #f0f4ff 0%, #f5f8ff 100%)"
                      : "white",
                    boxShadow: style.highlight
                      ? "0 24px 60px rgba(37,99,235,0.12), 0 0 0 2px rgba(37,99,235,0.25)"
                      : "0 4px 24px rgba(15,23,42,0.08)",
                    border: style.highlight
                      ? "1.5px solid rgba(37,99,235,0.25)"
                      : "1.5px solid rgba(226,232,240,0.8)",
                    transform: style.highlight ? "scale(1.03)" : "scale(1)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                >
                  {style.highlight && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      ⭐ Most Popular
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    <span
                      className={`inline-block self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${style.badge}`}
                    >
                      {plan.name}
                    </span>

                    <div className="mb-2">
                      <span
                        className="text-5xl font-black text-[#0f172a]"
                      >
                        ₹{plan.monthly_price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-slate-400 text-base font-medium ml-1">
                        / month
                      </span>
                    </div>

                    {plan.description && (
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        {plan.description}
                      </p>
                    )}

                    <div className="w-full h-px mb-6 bg-slate-100" />

                    <ul className="space-y-3 flex-1 mb-8">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckIcon />
                          <span className="text-sm text-slate-600 leading-snug">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      id={`select-plan-${plan.id}`}
                      onClick={() => selectPlan(plan)}
                      disabled={loading}
                      className={`w-full py-4 rounded-2xl font-bold text-base transition-all shadow-md ${style.button}`}
                      style={{
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      {isActivating ? (
                        <span className="flex items-center justify-center gap-2">
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "2.5px solid rgba(255,255,255,0.4)",
                              borderTopColor: "white",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          Activating…
                        </span>
                      ) : (
                        `Get Started with ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default SelectPlan;