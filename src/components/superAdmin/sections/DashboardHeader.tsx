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