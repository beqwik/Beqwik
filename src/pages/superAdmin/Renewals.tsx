import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/services/supabase";
import SubscriptionDrawer from "@/components/superAdmin/SubscriptionDrawer";

type Renewal = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;

  organizations: {
    organization_name: string;
  };

  subscription_plans: {
    name: string;
    monthly_price: number;
  };
};

export default function Renewals() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [selectedRenewal, setSelectedRenewal] = useState<any>(null);

const [drawerOpen, setDrawerOpen] = useState(false);

useEffect(() => {
  fetchRenewals();
}, []);

const fetchRenewals = async () => {
  try {
    setLoading(true);
    setError("");

    // Step 1: Find organisations that have paid
    const { data: paidPayments, error: paymentError } = await supabase
      .from("payments")
      .select("organization_id")
      .eq("payment_status", "paid");

    if (paymentError) throw paymentError;

    const organizationIds = [
      ...new Set(
        (paidPayments || [])
          .map((p) => p.organization_id)
          .filter(Boolean)
      ),
    ];

    if (organizationIds.length === 0) {
      setRenewals([]);
      return;
    }

    // Step 2: Fetch subscriptions only for paid organisations
    const { data, error } = await supabase
      .from("organization_subscriptions")
      .select(`
        id,
        status,
        start_date,
        end_date,
        auto_renew,
        organizations (
          organization_name
        ),
        subscription_plans (
          name,
          monthly_price
        )
      `)
      .in("organization_id", organizationIds)
      .order("end_date", { ascending: true });

    if (error) throw error;

    setRenewals(data || []);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      Loading renewals...
    </div>
  );
}
if (error) {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <p className="text-red-600 mb-4">{error}</p>

      <button
        onClick={fetchRenewals}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white"
      >
        Retry
      </button>
    </div>
  );
}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Renewals <span className="text-blue-600">Overview</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Monitor upcoming customer subscriptions and automatic renewals
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
  <tr>
    <th className="w-[30%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      Customer
    </th>

    <th className="w-[18%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      Plan Tier
    </th>

    <th className="w-[22%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      Next Renewal
    </th>

    <th className="w-[15%] px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
      Status
    </th>

    <th className="w-[15%] px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
      Action
    </th>
  </tr>
</thead>
            <tbody className="divide-y divide-slate-50">
  {renewals.length === 0 ? (
    <tr>
      <td
        colSpan={5}
        className="text-center py-12 text-slate-400"
      >
        No renewals found.
      </td>
    </tr>
  ) : (
    renewals.map((item) => (
      <tr key={item.id}
  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
>
        <td className="w-[30%] px-6 py-5 font-semibold text-slate-900">
          {item.organizations.organization_name}
        </td>

        <td className="px-6 py-4 text-slate-600 text-sm font-semibold">
          {item.subscription_plans.name}
        </td>

        <td className="w-[22%] px-6 py-5 text-slate-600 font-medium">
          {new Date(item.end_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>

        <td className="w-[15%] px-6 py-5">
  <div className="flex justify-center">
    
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              item.status === "active"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                : "bg-rose-50 text-rose-600 border border-rose-100/50"
            }`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
          </div>
        </td>

       <td className="w-[15%] px-6 py-5">
  <div className="flex justify-center">
          <button
  onClick={() => {
    setSelectedRenewal(item);
    setDrawerOpen(true);
  }}
  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
>
  Details
</button>
</div>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </div>
      <SubscriptionDrawer
  open={drawerOpen}
  renewal={selectedRenewal}
  onClose={() => setDrawerOpen(false)}
/>
    </div>
  );
}
