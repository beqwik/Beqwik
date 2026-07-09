import { FileBarChart, Download, Calendar } from "lucide-react";

export default function Reports() {
  const reports = [
    { title: "Monthly Financial Statement", description: "Breakdown of monthly subscription renewals, collections, and outstanding dues.", type: "PDF" },
    { title: "Active Organization Audit", description: "Summary of active client workspaces, user growth trends, and activity log overview.", type: "CSV" },
    { title: "Annual Churn Report", description: "Detailed look at customer retention metrics, renewal success percentages, and downgrades.", type: "PDF" },
    { title: "Gateway Performance Overview", description: "Performance statistics for Razorpay integration, transaction status rates, and errors.", type: "CSV" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          System <span className="text-blue-600">Reports</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Export audits, financial stats, and system performance telemetry
        </p>
      </div>

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
              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/10 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
