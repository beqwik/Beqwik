import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;

  iconBgColor?: string;
  iconColor?: string;

  change?: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,

  iconBgColor = "bg-slate-100",
  iconColor = "text-slate-700",

  change,
  loading = false,
}: StatsCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] hover:shadow-md transition duration-300 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-slate-500">
          {title}
        </p>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-3xl font-black text-slate-800">
          {loading ? "..." : value}
        </h2>

        {change && (
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            {change}
          </span>
        )}
      </div>
    </div>
  );
}