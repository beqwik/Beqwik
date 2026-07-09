import { useEffect, useState } from "react";
import {
  getSubscriptions,
  getSubscriptionPlans,
} from "../../services/superAdmin/subscriptionService";
import type { SubscriptionPlanRow } from "../../services/superAdmin/subscriptionService";

import OrgSubscriptionsList from "../../components/superAdmin/plans/OrgSubscriptionsList";
import PlansManager from "../../components/superAdmin/plans/PlansManager";

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState<"records" | "plans">("records");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadSubscriptions();
    loadPlans();
  }, []);

  async function loadSubscriptions() {
    setLoadingSubscriptions(true);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSubscriptions(false);
    }
  }

  async function loadPlans() {
    setLoadingPlans(true);
    try {
      const data = await getSubscriptionPlans();
      setPlans(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPlans(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Subscriptions{" "}
            <span className="text-blue-600">
              Center
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage organization plans, pricing tiers, and subscriptions history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/80 backdrop-blur p-1 rounded-2xl border border-slate-200/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("records")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "records"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            History Records
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "plans"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Manage Plans
          </button>
        </div>
      </div>

      {/* Content Panels */}
      {activeTab === "records" ? (
        <OrgSubscriptionsList
          subscriptions={subscriptions}
          loading={loadingSubscriptions}
        />
      ) : loadingPlans ? (
        <div className="p-12 text-center text-slate-500 font-medium">
          Loading subscription plans...
        </div>
      ) : (
        <PlansManager plans={plans} onRefresh={loadPlans} />
      )}
    </div>
  );
}

