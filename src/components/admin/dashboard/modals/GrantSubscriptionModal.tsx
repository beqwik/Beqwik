import React from "react";
import { type GymPlan } from "../../../../services/organization/planService";

interface GrantSubscriptionModalProps {
  open: boolean;
  onClose: () => void;

  members: any[];
  plans?: GymPlan[];

  subMemberId: string;
  setSubMemberId: (value: string) => void;

  subPlanName: string;
  setSubPlanName: (value: string) => void;

  subAmount: string;
  setSubAmount: (value: string) => void;

  subDurationMonths: string;
  setSubDurationMonths: (value: string) => void;

  subPaymentMethod: string;
  setSubPaymentMethod: (value: string) => void;

  addingSub: boolean;

  handleAddSubscription: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function GrantSubscriptionModal({
  open,
  onClose,
  members,
  plans = [],
  subMemberId,
  setSubMemberId,
  subPlanName,
  setSubPlanName,
  subAmount,
  setSubAmount,
  subDurationMonths,
  setSubDurationMonths,
  subPaymentMethod,
  setSubPaymentMethod,
  addingSub,
  handleAddSubscription,
}: GrantSubscriptionModalProps) {
  if (!open) return null;

  const handleSelectPreset = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    if (selected) {
      setSubPlanName(selected.name);
      setSubAmount(selected.price.toString());
      setSubDurationMonths(selected.duration_months.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Grant Membership Plan
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Assign a plan package or subscription tier to a member.
        </p>

        <form onSubmit={handleAddSubscription} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Member
            </label>
            <select
              required
              value={subMemberId}
              onChange={(e) => setSubMemberId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.email || m.phone || "No Contact"})
                </option>
              ))}
            </select>
          </div>

          {/* PREDEFINED PLAN SELECTOR */}
          {plans.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-indigo-600 mb-1">
                Choose Predefined Plan Tier (Optional)
              </label>
              <select
                onChange={(e) => handleSelectPreset(e.target.value)}
                defaultValue=""
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50/50 text-sm font-semibold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Custom Plan / Select Preset --</option>
                {plans.filter(p => p.is_active).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price} ({p.duration_months} Month{p.duration_months > 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Monthly Gold membership"
              value={subPlanName}
              onChange={(e) => setSubPlanName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="E.g., 1500"
                value={subAmount}
                onChange={(e) => setSubAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={subDurationMonths}
                onChange={(e) => setSubDurationMonths(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 bg-white"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={subPaymentMethod}
              onChange={(e) => setSubPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 bg-white"
            >
              <option value="manual">Paid directly (Cash/Manual - Mark Active)</option>
              <option value="online_pending">Requires Online Payment by Member</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingSub}
              className="flex-1 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
            >
              {addingSub ? "Granting Plan..." : "Grant Sub"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
