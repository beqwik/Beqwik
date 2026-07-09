import { RefreshCw, CheckCircle, Clock } from "lucide-react";

export default function Renewals() {
  const renewals = [
    { id: 1, customer: "Fitness Club", plan: "Pro Plan (Monthly)", nextRenewal: "Jul 20, 2026", status: "Active" },
    { id: 2, customer: "Elite Hostel", plan: "Premium Plan (Monthly)", nextRenewal: "Jul 20, 2026", status: "Active" },
    { id: 3, customer: "Green Gym", plan: "Basic Plan (Monthly)", nextRenewal: "Jul 19, 2026", status: "Active" },
    { id: 4, customer: "StayEasy PG", plan: "Pro Plan (Monthly)", nextRenewal: "Jul 19, 2026", status: "Expired" },
    { id: 5, customer: "FitLife PG", plan: "Premium Plan (Monthly)", nextRenewal: "Jul 18, 2026", status: "Active" },
  ];

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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Plan Tier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Next Renewal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renewals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-bold text-sm">{item.customer}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-semibold">{item.plan}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-medium">{item.nextRenewal}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-rose-50 text-rose-600 border border-rose-100/50"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl border border-blue-200/50 transition cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Process</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
