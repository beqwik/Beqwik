import { FileText, IndianRupee, Download } from "lucide-react";

export default function Invoices() {
  const invoices = [
    { id: "INV-2026-001", customer: "Fitness Club", amount: 2499, date: "Jun 20, 2026", status: "Paid" },
    { id: "INV-2026-002", customer: "Elite Hostel", amount: 1999, date: "Jun 20, 2026", status: "Paid" },
    { id: "INV-2026-003", customer: "Green Gym", amount: 999, date: "Jun 19, 2026", status: "Paid" },
    { id: "INV-2026-004", customer: "StayEasy PG", amount: 2499, date: "Jun 19, 2026", status: "Failed" },
    { id: "INV-2026-005", customer: "FitLife PG", amount: 1999, date: "Jun 18, 2026", status: "Paid" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Invoices <span className="text-blue-600">Ledger</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage system invoices and billing transcripts
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Billing Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-semibold">{inv.customer}</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-medium">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      inv.status === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-red-50 text-red-600 border border-red-100/50"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200/50 transition cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
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
