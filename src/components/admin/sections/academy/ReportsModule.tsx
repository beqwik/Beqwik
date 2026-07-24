import { BarChart2, TrendingUp } from "lucide-react";

export default function ReportsModule() {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" /> Academic Reports & Analytics
          </h2>
          <p className="text-slate-500 text-xs font-medium">Performance, attendance, and revenue insights</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50/70 border border-purple-200/60 p-5 rounded-[16px] space-y-2">
          <span className="text-xs font-bold text-purple-600 uppercase">Average Attendance Rate</span>
          <h3 className="text-3xl font-black text-slate-900">92.4%</h3>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +2.1% from last month</p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/60 p-5 rounded-[16px] space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase">Exam Pass Rate</span>
          <h3 className="text-3xl font-black text-slate-900">88.6%</h3>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +4.3% from last term</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/60 p-5 rounded-[16px] space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase">Fee Collection Rate</span>
          <h3 className="text-3xl font-black text-slate-900">94.8%</h3>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> On track for Q3</p>
        </div>
      </div>
    </div>
  );
}
