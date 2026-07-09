import {
  CalendarDays,
  ChevronDown,
} from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Overview of your membership business
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          <CalendarDays className="h-4 w-4 text-slate-500" />

          <span>May 20 - Jun 20, 2025</span>

          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-emerald-700">
            Live
          </span>
        </div>
      </div>
    </div>
  );
}