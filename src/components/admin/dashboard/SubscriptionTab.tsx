import { useState, useEffect, useCallback } from "react";
import { getGymPlans, createGymPlan, toggleGymPlanStatus, deleteGymPlan, type GymPlan } from "../../../services/organization/planService";
import { Plus, Trash2, Tag, Check, ShieldCheck } from "lucide-react";

interface SubscriptionTabProps {
  organizationId?: string;
  memberSubscriptions: any[];
  members: any[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  onGrantSubscription: () => void;
}

export default function SubscriptionTab({
  organizationId,
  memberSubscriptions,
  members,
  formatCurrency,
  formatDate,
  onGrantSubscription,
}: SubscriptionTabProps) {
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);

  // New plan form state
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [planDesc, setPlanDesc] = useState("");
  const [addingPlan, setAddingPlan] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoadingPlans(true);
      const data = await getGymPlans(organizationId);
      setPlans(data);
    } catch (err) {
      console.error("Error fetching gym plans:", err);
    } fontally: {
      setLoadingPlans(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setAddingPlan(true);
      await createGymPlan({
        organization_id: organizationId,
        name: planName,
        price: parseFloat(planPrice) || 0,
        duration_months: parseInt(planDuration) || 1,
        description: planDesc,
        is_active: true,
      });

      setShowAddPlan(false);
      setPlanName("");
      setPlanPrice("");
      setPlanDuration("1");
      setPlanDesc("");

      await fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to create membership plan tier.");
    } finally {
      setAddingPlan(false);
    }
  };

  const handleTogglePlan = async (id: string, currentStatus: boolean) => {
    try {
      await toggleGymPlanStatus(id, !currentStatus);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to update plan status.");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this membership plan tier?")) return;
    try {
      await deleteGymPlan(id);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan.");
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* SECTION 1: MEMBERSHIP PLAN TIERS BUILDER */}
      {organizationId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#e05275]" /> Predefined Membership Tier Plans
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Create reusable subscription pricing packages (e.g. Gold 1-Month, VIP Annual) for fast assignment to members.
              </p>
            </div>
            <button
              onClick={() => setShowAddPlan(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Plan Tier
            </button>
          </div>

          {/* PLANS CARDS GRID */}
          <div className="grid sm:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
                      {p.duration_months} Month{p.duration_months > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => handleTogglePlan(p.id, p.is_active)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {p.is_active ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-lg mt-2">{p.name}</h4>
                  <div className="text-2xl font-black text-[#e05275] mt-1">
                    {formatCurrency(p.price)}
                    <span className="text-xs font-normal text-slate-400"> / {p.duration_months} mo</span>
                  </div>

                  {p.description && (
                    <p className="text-slate-500 text-xs mt-2">{p.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeletePlan(p.id)}
                    className="text-slate-400 hover:text-red-500 p-1 font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Tier
                  </button>
                </div>
              </div>
            ))}

            {plans.length === 0 && !loadingPlans && (
              <div className="col-span-full py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-semibold text-xs">No preset membership plan tiers defined yet.</p>
                <p className="text-slate-400 text-[11px] mt-1">Click "Create Plan Tier" to setup your standard pricing packages.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MEMBER SUBSCRIPTION LOGS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">
            Member Active Subscriptions & Logs
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

      {/* CREATE PLAN MODAL */}
      {showAddPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setShowAddPlan(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create Membership Plan Tier</h3>
            <p className="text-slate-500 text-sm mb-6">Define a new standard plan package for members.</p>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Tier Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Gold 3-Month Pass"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="2999"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                  <select
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 bg-white"
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Yr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Benefits</label>
                <textarea
                  rows={2}
                  placeholder="E.g., Includes full gym floor access + personal trainer consultation..."
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPlan(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPlan}
                  className="flex-1 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {addingPlan ? "Saving..." : "Save Plan Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
