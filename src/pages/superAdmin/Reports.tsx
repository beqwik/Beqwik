import {
  FileBarChart,
  Download,
  IndianRupee,
  Building2,
  CreditCard,
  BellRing,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from "recharts";

import { useEffect, useState } from "react";
import { getSystemReport } from "../../services/superAdmin/reportService";
import {
  exportMonthlyFinancialReport,
  exportActiveOrganizationAudit,
} from "../../services/superAdmin/reportExportService";

export default function Reports() {

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("30d");
  

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);

    const data = await getSystemReport(dateFilter);

    setReport(data);

    setLoading(false);
  }

  const reports = [
    {
  title: "Monthly Financial Statement",
  description:
    "Breakdown of monthly subscription renewals, collections, and outstanding dues.",
  type: "PDF",
},
    {
      title: "Active Organization Audit",
      description:
        "Summary of active client workspaces, user growth trends, and activity log overview.",
      type: "CSV",
    },
    // ...rest of your reports
  ];

  return (
    <>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          System <span className="text-blue-600">Reports</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Export audits, financial stats, and system performance telemetry
        </p>
      </div>
       <div className="flex items-center justify-between mt-6">

  <select
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value as any)}
    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
  >
    <option value="7d">Last 7 Days</option>
    <option value="30d">Last 30 Days</option>
    <option value="month">This Month</option>
    <option value="year">This Year</option>
  </select>

  <div className="flex items-center gap-3">
    <button
      onClick={loadReport}
      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
    >
      Refresh
    </button>
</div>

</div>

         {!loading && report && (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

    {/* Revenue */}
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between">
        <IndianRupee className="w-6 h-6 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Revenue
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-black text-slate-900">
        INR {report.totalRevenue.toLocaleString("en-IN")}
      </h2>
    </div>

    {/* Organizations */}
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between">
        <Building2 className="w-6 h-6 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Organizations
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-black text-slate-900">
        {report.totalOrganizations}
      </h2>
    </div>

    {/* Active Plans */}
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Plans
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-black text-slate-900">
        {report.activeSubscriptions}
      </h2>
    </div>

    {/* Renewals */}
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between">
        <BellRing className="w-6 h-6 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Upcoming Renewals
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-black text-slate-900">
        {report.upcomingRenewals}
      </h2>
    </div>

  </div>
)}
{!loading && report?.recentPayments && (
  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">

    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Recent Payments
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Latest successful subscription payments
        </p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 text-sm font-semibold text-slate-500">Organisation</th>
            <th className="text-left py-3 text-sm font-semibold text-slate-500">Plan</th>
            <th className="text-left py-3 text-sm font-semibold text-slate-500">Amount</th>
            <th className="text-left py-3 text-sm font-semibold text-slate-500">Date</th>
            <th className="text-left py-3 text-sm font-semibold text-slate-500">Status</th>
          </tr>
        </thead>

        <tbody>
          {report.recentPayments.map((payment: any, index: number) => (
            <tr
              key={index}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="py-4 font-medium text-slate-800">
                {payment.organizations?.organization_name ?? "-"}
              </td>

              <td className="py-4 text-slate-600">
                {payment.organizations?.organization_subscriptions?.[0]?.subscription_plans?.name ?? "-"}
              </td>

              <td className="py-4 font-semibold text-slate-900">
                ₹{Number(payment.amount).toLocaleString("en-IN")}
              </td>

              <td className="py-4 text-slate-600">
                {payment.paid_at
                  ? new Date(payment.paid_at).toLocaleDateString("en-IN")
                  : "-"}
              </td>

              <td className="py-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Paid
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
)}
 {!loading && report && (
  <div className="grid gap-6 lg:grid-cols-2">

    {/* Revenue Trend */}
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <h3 className="text-lg font-bold text-slate-900 mb-6">
        Revenue Trend
      </h3>

     <ResponsiveContainer width="100%" height={320}>
  <AreaChart data={report.revenueTrend}>
    <defs>
      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
      </linearGradient>
    </defs>

    <CartesianGrid
      stroke="#e2e8f0"
      strokeDasharray="4 4"
      vertical={false}
    />

    <XAxis
      dataKey="month"
      tick={{ fontSize: 12 }}
      axisLine={false}
      tickLine={false}
    />

    <YAxis
      tickFormatter={(value) => `₹${value}`}
      tick={{ fontSize: 12 }}
      axisLine={false}
      tickLine={false}
    />

    <Tooltip
      formatter={(value: number) => [
        `₹${value.toLocaleString("en-IN")}`,
        "Revenue",
      ]}
    />

    <Area
      type="monotone"
      dataKey="amount"
      stroke="#2563eb"
      strokeWidth={3}
      fill="url(#revenueFill)"
    />
  </AreaChart>
</ResponsiveContainer>
    </div>

    {/* Plan Distribution */}
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <h3 className="text-lg font-bold text-slate-900 mb-6">
        Plan Distribution
      </h3>

      <ResponsiveContainer width="100%" height={320}>
  <PieChart>

    <Pie
      data={report.planDistribution}
      dataKey="value"
      nameKey="name"
      innerRadius={70}
      outerRadius={105}
      paddingAngle={3}
      cornerRadius={8}
    >
        <Label
    value={report.activeSubscriptions}
    position="center"
    className="fill-slate-900 text-3xl font-bold"
  />
      {report.planDistribution.map((_: any, index: number) => (
        <Cell
          key={index}
          fill={
            [
              "#2563eb",
              "#3b82f6",
              "#60a5fa",
              "#93c5fd",
              "#1d4ed8",
              "#0ea5e9",
            ][index % 6]
          }
        />
      ))}
    </Pie>

    <Tooltip />

    <Legend
      verticalAlign="bottom"
      height={36}
      formatter={(value) => (
        <span className="text-slate-700 font-medium">
          {value}
        </span>
      )}
    />

  </PieChart>
</ResponsiveContainer>
    </div>

  </div>
)}

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((rep) => (
          <div key={rep.title} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileBarChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{rep.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.description}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Format: {rep.type}</span>
              <button
  onClick={async () => {
  if (!report) return;

  if (rep.title === "Monthly Financial Statement") {
    await exportMonthlyFinancialReport({
      generatedOn: new Date().toLocaleDateString("en-GB"),

      reportPeriod:
        dateFilter === "7d"
          ? "Last 7 Days"
          : dateFilter === "30d"
          ? "Last 30 Days"
          : dateFilter === "month"
          ? "This Month"
          : "This Year",

      totalRevenue: report.totalRevenue,
      totalOrganizations: report.totalOrganizations,
      activeSubscriptions: report.activeSubscriptions,
      upcomingRenewals: report.upcomingRenewals,

      payments: report.recentPayments.map((payment: any) => ({
        organization: payment.organizations?.organization_name ?? "-",
        amount: Number(payment.amount),
        date: payment.paid_at ?? "",
        status: "Paid",
      })),
    });
  } else if (rep.title === "Active Organization Audit") {
   console.log(report);
    await exportActiveOrganizationAudit({
      generatedOn: new Date().toLocaleDateString("en-GB"),

      totalOrganizations: report.totalOrganizations,
      activeOrganizations: report.activeOrganizations,
      inactiveOrganizations: report.inactiveOrganizations,
      totalStudents: report.totalStudents,

      organizations: report.organizations,
    });
  }
}}
  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/10 transition cursor-pointer"
>
  <Download className="w-3.5 h-3.5" />
  <span>Export Report</span>
</button>
            </div>
          </div>
        ))}
      </div>
    </div>
   

  </>
);
}
