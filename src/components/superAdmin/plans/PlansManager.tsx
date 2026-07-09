import { useState } from "react";
import { Pencil, Trash2, Plus, Package } from "lucide-react";

import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  togglePlanActive,
  deletePlan,
} from "../../../services/superAdmin/subscriptionService";

import type {
  SubscriptionPlanRow,
  CreatePlanPayload,
} from "../../../services/superAdmin/subscriptionService";

import PlanFormModal from "./PlanFormModal";

interface Props {
  plans: SubscriptionPlanRow[];
  onRefresh: () => void;
}

// ─── Stat card helper ─────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: "orange" | "emerald" | "rose";
}) {
  const palette = {
    orange: { icon: "bg-orange-50", val: "text-slate-800" },
    emerald: { icon: "bg-emerald-50", val: "text-emerald-600" },
    rose:  { icon: "bg-blue-50",    val: "text-blue-600"  },
  } as const;
  const c = palette[color];

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <div className="mt-4">
        <h2 className={`text-3xl font-black ${c.val}`}>{value}</h2>
        <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
          {sub}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlansManager({ plans, onRefresh }: Props) {
  // "new" = create mode, SubscriptionPlanRow = edit mode, null = closed
  const [modalPlan, setModalPlan] = useState<
    SubscriptionPlanRow | "new" | null
  >(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const activePlans = plans.filter((p) => p.active);
  const prices = plans.map((p) => p.monthly_price);
  const priceRange =
    plans.length > 0
      ? `₹${Math.min(...prices).toLocaleString("en-IN")} – ₹${Math.max(...prices).toLocaleString("en-IN")}`
      : "—";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async (payload: CreatePlanPayload) => {
    if (modalPlan === "new") {
      await createSubscriptionPlan(payload);
    } else if (modalPlan) {
      await updateSubscriptionPlan(modalPlan.id, payload);
    }
    setModalPlan(null);
    onRefresh();
  };

  const handleToggle = async (plan: SubscriptionPlanRow) => {
    setTogglingId(plan.id);
    try {
      await togglePlanActive(plan.id, !plan.active);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      alert(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (plan: SubscriptionPlanRow) => {
    if (
      !confirm(
        `Delete plan "${plan.name}"?\n\nThis cannot be undone and may affect existing subscriptions.`
      )
    )
      return;

    setDeletingId(plan.id);
    try {
      await deletePlan(plan.id);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Plans"
          value={plans.length}
          sub="All created plans"
          color="orange"
        />
        <StatCard
          label="Active Plans"
          value={activePlans.length}
          sub="Visible to organizations"
          color="emerald"
        />
        <StatCard
          label="Price Range"
          value={priceRange}
          sub="Monthly pricing"
          color="rose"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Subscription Plans
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Plans shown to organizations during onboarding
            </p>
          </div>
          <button
            onClick={() => setModalPlan("new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>

        {/* Empty state */}
        {plans.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <p className="text-slate-500 font-semibold">No plans yet</p>
            <p className="text-slate-400 text-sm">
              Click "New Plan" to create your first subscription plan
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100/80">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-5 pl-8">Plan</th>
                  <th className="text-left p-5">Price / Month</th>
                  <th className="text-left p-5">Max Members</th>
                  <th className="text-left p-5">Max Staff</th>
                  <th className="text-left p-5">Status</th>
                  <th className="text-right p-5 pr-8">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-50/30 transition duration-200"
                  >
                    {/* Name + description */}
                    <td className="p-5 pl-8">
                      <div className="font-bold text-slate-800">
                        {plan.name}
                      </div>
                      {plan.description && (
                        <div className="text-xs text-slate-400 font-medium mt-0.5 max-w-xs truncate">
                          {plan.description}
                        </div>
                      )}
                    </td>

                    {/* Price */}
                    <td className="p-5">
                      <span className="font-black text-slate-800">
                        ₹{plan.monthly_price.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Members */}
                    <td className="p-5 text-sm font-medium">
                      {plan.max_members !== null ? (
                        <span className="text-slate-700">
                          {plan.max_members}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unlimited</span>
                      )}
                    </td>

                    {/* Staff */}
                    <td className="p-5 text-sm font-medium">
                      {plan.max_staff !== null ? (
                        <span className="text-slate-700">
                          {plan.max_staff}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unlimited</span>
                      )}
                    </td>

                    {/* Active toggle badge */}
                    <td className="p-5">
                      <button
                        onClick={() => handleToggle(plan)}
                        disabled={togglingId === plan.id}
                        title={
                          plan.active
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                        className="cursor-pointer disabled:opacity-50"
                      >
                        {plan.active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 hover:bg-emerald-100 transition">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 text-slate-400 text-xs font-semibold border border-slate-150 hover:bg-slate-100 transition">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Edit / Delete */}
                    <td className="p-5 pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalPlan(plan)}
                          title="Edit plan"
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          disabled={deletingId === plan.id}
                          title="Delete plan"
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-[#e05275] hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalPlan !== null && (
        <PlanFormModal
          plan={modalPlan === "new" ? null : modalPlan}
          onClose={() => setModalPlan(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
