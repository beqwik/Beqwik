import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RevenueTrendPoint {
  name: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueTrendPoint[];
}

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          Revenue Overview
        </h3>

        <p className="text-xs text-slate-400 font-medium mt-1">
          Monthly system-wide revenue growth
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              left: -15,
              right: 10,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="colorRevenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.25}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => `₹${value}L`}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value ?? 0)}L`,
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow:
                  "0 10px 20px rgba(0,0,0,0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}