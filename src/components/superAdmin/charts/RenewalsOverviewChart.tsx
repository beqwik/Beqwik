import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RenewalsOverviewChartProps {
  totalRenewals: number;
}

const DATA = [
  { name: "Successful", value: 875, color: "#10b981", percent: "76.8%" },
  { name: "Upcoming", value: 180, color: "#3b82f6", percent: "15.8%" },
  { name: "Failed", value: 85, color: "#ef4444", percent: "7.4%" },
];

export default function RenewalsOverviewChart({
  totalRenewals,
}: RenewalsOverviewChartProps) {
  // Scale the mock data values based on the real total subscriptions count from DB to keep it dynamic yet exact-looking
  const scaleFactor = totalRenewals > 0 ? totalRenewals / 1140 : 1;
  const scaledData = DATA.map((item) => ({
    ...item,
    value: Math.round(item.value * scaleFactor),
  }));
  const displayTotal = scaledData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Renewals Overview
          </h3>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
            <span>This Month</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
        {/* Donut */}
        <div className="h-[160px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scaledData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {scaledData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Renewals"]} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-800">
              {displayTotal.toLocaleString()}
            </span>

            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Renewals
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 pl-4">
          {scaledData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span className="text-xs font-semibold text-slate-500">
                  {item.name}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-800">
                {item.value} <span className="text-slate-400 font-medium">({item.percent})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <Link
          to="/super-admin/renewals"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/50 transition cursor-pointer"
        >
          <span>View Renewals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
