import { useEffect, useState } from "react";
import { getPayments } from "../../services/superAdmin/paymentService";
import { IndianRupee, CheckCircle2, XCircle } from "lucide-react";

export default function Payments() {
  const [payments, setPayments] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const data =
      await getPayments();

    setPayments(data);

    setLoading(false);
  }

  const totalRevenue =
    payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

  const successfulPayments =
    payments.filter(
      (payment) =>
        payment.payment_status ===
        "success"
    ).length;

  const failedPayments =
    payments.filter(
      (payment) =>
        payment.payment_status ===
        "failed"
    ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Payments <span className="text-blue-600">Ledger</span>
        </h1>
        <p className="mt-1 text-slate-500 font-medium">
          Payment history across all organizations
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Total Revenue
            </p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#60a5fa] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              ₹{totalRevenue.toLocaleString()}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Earned platform-wide
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Successful Payments
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-600">
              {successfulPayments}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Cleared transactions
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Failed Payments
            </p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#2563eb] flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-[#2563eb]">
              {failedPayments}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Declined/canceled
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">
            Loading payments...
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100/80">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="text-left p-5 pl-8">Transaction ID</th>
                <th className="text-left p-5">Amount</th>
                <th className="text-left p-5">Gateway</th>
                <th className="text-left p-5">Status</th>
                <th className="text-left p-5 pr-8">Paid At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-slate-50/30 transition duration-200"
                >
                  <td className="p-5 pl-8 font-mono text-xs text-slate-500 font-medium">
                    {payment.transaction_id || "—"}
                  </td>
                  <td className="p-5 font-bold text-slate-800">
                    ₹{payment.amount}
                  </td>
                  <td className="p-5 text-sm font-semibold text-slate-500 uppercase">
                    {payment.payment_gateway}
                  </td>
                  <td className="p-5">
                    {payment.payment_status === "success" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-[#2563eb] text-xs font-semibold border border-rose-100">
                        <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="p-5 pr-8 text-sm text-slate-600">
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
