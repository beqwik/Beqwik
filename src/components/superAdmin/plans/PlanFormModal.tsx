import { useState, useEffect } from "react";
import { X } from "lucide-react";

import type {
  SubscriptionPlanRow,
  CreatePlanPayload,
} from "../../../services/superAdmin/subscriptionService";

interface Props {
  plan: SubscriptionPlanRow | null; // null = create mode
  onClose: () => void;
  onSave: (payload: CreatePlanPayload) => Promise<void>;
}

export default function PlanFormModal({
  plan,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(
    plan?.description ?? ""
  );
  const [monthlyPrice, setMonthlyPrice] = useState(
    plan?.monthly_price?.toString() ?? ""
  );
  const [maxMembers, setMaxMembers] = useState(
    plan?.max_members?.toString() ?? ""
  );
  const [maxStaff, setMaxStaff] = useState(
    plan?.max_staff?.toString() ?? ""
  );
  const [featuresRaw, setFeaturesRaw] = useState(
    plan?.features ? plan.features.join("\n") : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync fields when switching between plans
  useEffect(() => {
    setName(plan?.name ?? "");
    setDescription(plan?.description ?? "");
    setMonthlyPrice(plan?.monthly_price?.toString() ?? "");
    setMaxMembers(plan?.max_members?.toString() ?? "");
    setMaxStaff(plan?.max_staff?.toString() ?? "");
    setFeaturesRaw(plan?.features ? plan.features.join("\n") : "");
    setError("");
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !monthlyPrice) {
      setError("Plan name and price are required.");
      return;
    }

    setSaving(true);
    setError("");

    // Split features by newline and filter out empty lines
    const features = featuresRaw
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        monthly_price: Number(monthlyPrice),
        max_members: maxMembers ? Number(maxMembers) : null,
        max_staff: maxStaff ? Number(maxStaff) : null,
        features,
      });
    } catch (err: any) {
      console.error("Save error details:", err);
      const msg =
        err?.message ||
        err?.details ||
        (typeof err === "string" ? err : "Something went wrong");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{ animation: "fadeSlideIn 0.2s ease" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {plan ? "Edit Plan" : "Create New Plan"}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {plan
                ? `Editing "${plan.name}"`
                : "Add a new subscription plan for organizations"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form Body (Scrollable) ── */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[#e05275] text-sm font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Plan Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starter, Pro, Enterprise"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this plan includes..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Monthly Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="999"
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Max Members
              </label>
              <input
                type="number"
                min="1"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
              <p className="text-xs text-slate-400 mt-1 ml-1">
                Leave blank = unlimited
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Max Staff
              </label>
              <input
                type="number"
                min="1"
                value={maxStaff}
                onChange={(e) => setMaxStaff(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
              <p className="text-xs text-slate-400 mt-1 ml-1">
                Leave blank = unlimited
              </p>
            </div>
          </div>

          {/* Checklist Points / Features */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Plan Features / Checklist (One per line)
            </label>
            <textarea
              value={featuresRaw}
              onChange={(e) => setFeaturesRaw(e.target.value)}
              placeholder="e.g.&#10;Up to 100 Members&#10;Subscription Management&#10;Attendance Tracking"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60 shadow-md shadow-blue-500/10"
            >
              {saving
                ? "Saving…"
                : plan
                ? "Save Changes"
                : "Create Plan"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
