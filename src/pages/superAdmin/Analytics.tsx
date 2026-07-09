import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../services/superAdmin/analyticsService";
import { Building2, Sparkles, TrendingUp } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#60a5fa", // brand peach
  "#2563eb", // brand coral
  "#1d4ed8", // brand purple
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

export default function Analytics() {
  const [organizationTypeData, setOrganizationTypeData] =
    useState<any[]>([]);

  const [planData, setPlanData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const data = await getAnalyticsData();

    // Organization Types
    const typeCounts: any = {};

    data.organizations.forEach((org: any) => {
      typeCounts[org.organization_type] =
        (typeCounts[org.organization_type] || 0) + 1;
    });

    const orgTypes = Object.entries(typeCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    setOrganizationTypeData(orgTypes);

    // Plan Distribution

    const planCounts: any = {};

    data.plans.forEach((plan: any) => {
      planCounts[plan.name] = 0;
    });

    data.subscriptions.forEach((sub: any) => {
      const matchingPlan = data.plans.find(
        (p: any) => p.id === sub.subscription_plan_id
      );

      if (matchingPlan) {
        planCounts[matchingPlan.name]++;
      }
    });

    setPlanData(
      Object.entries(planCounts).map(
        ([name, value]) => ({
          name,
          value,
        })
      )
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Analytics <span className="text-blue-600">Insights</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          SaaS platform insights & reports
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Organization Types
            </p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#60a5fa] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {organizationTypeData.length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Domains active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Subscription Plans
            </p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#1d4ed8] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {planData.length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Pricing tiers
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Total Subscriptions
            </p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#2563eb] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {planData.reduce(
                (sum, item) => sum + Number(item.value),
                0
              )}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Active customers
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Organization Types
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Breakdown of domains registered
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={organizationTypeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {organizationTypeData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid #f1f5f9", 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            {organizationTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 shadow-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs font-semibold text-slate-600">
                  {item.name}: <span className="text-slate-800 font-bold">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Subscription Plans
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Distribution of plans among active customers
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid #f1f5f9", 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" 
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
