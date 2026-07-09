import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

export interface OrganizationTypeData {
  organization_type: string;
  count: number;
}

interface OrganizationTypesChartProps {
  data: OrganizationTypeData[];
  totalOrganizations: number;
}

const COLORS = [
  "#2563eb", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
];

export default function OrganizationTypesChart({
  data,
  totalOrganizations,
}: OrganizationTypesChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.organization_type,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Organization Types
        </h3>

        <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
          Distribution across domains
        </p>
      </div>

      <div className="h-[180px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800">
            {totalOrganizations}
          </span>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Orgs
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-sm font-medium text-slate-600">
                {item.name}
              </span>
            </div>

            <span className="text-sm font-bold text-slate-800">
              {item.value} orgs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}