import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CreditCard, 
  IndianRupee, 
  Calendar, 
  UserPlus, 
  Dumbbell, 
  UserCheck, 
  Bell, 
  Plus, 
  ArrowUpRight,
  ChevronRight,
  Activity
} from "lucide-react";
import { getGymSlots, getGymBookings } from "../../../services/organization/gymService";

interface OverviewTabProps {
  organization: any;
  orgSubscription: any;
  members: any[];
  memberSubscriptions: any[];
  recentNotifications: any[];

  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;

  onAddMember: () => void;
  onGrantSubscription: () => void;
}

export default function OverviewTab({
  organization,
  orgSubscription,
  members,
  memberSubscriptions,
  recentNotifications,
  formatCurrency,
  formatDate,
  onAddMember,
  onGrantSubscription,
}: OverviewTabProps) {
  const navigate = useNavigate();

  // Real Gym Slots & Bookings data state
  const [totalSlotsCount, setTotalSlotsCount] = useState<number>(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState<number>(0);

  useEffect(() => {
    if (!organization?.id) return;
    let mounted = true;

    async function loadGymMetrics() {
      try {
        const [slots, bookings] = await Promise.all([
          getGymSlots(organization.id),
          getGymBookings(organization.id),
        ]);
        if (mounted) {
          setTotalSlotsCount(slots.length);
          const bookingsSum = Object.values(bookings).reduce((acc, curr) => acc + curr.length, 0);
          setTotalBookingsCount(bookingsSum);
        }
      } catch (err) {
        console.error("Error loading overview gym metrics:", err);
      }
    }

    loadGymMetrics();
    return () => {
      mounted = false;
    };
  }, [organization?.id]);

  // 100% Real Metrics Calculations
  const activeSubs = memberSubscriptions.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((acc, curr) => acc + (Number(curr.amount) || Number(curr.amount_paid) || 0), 0);
  const maxMembers = orgSubscription?.subscription_plans?.max_members || 50;
  const activeMembersCount = members.filter((m) => m.active !== false).length;

  // Real Plan Distribution (Strictly from database memberSubscriptions)
  const planCounts: Record<string, number> = {};
  memberSubscriptions.forEach((sub) => {
    if (sub.status === "active" || sub.status === "pending") {
      const planName = sub.plan_name || "Gym Membership";
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    }
  });

  const totalPlanSubs = Object.values(planCounts).reduce((a, b) => a + b, 0);

  // Real 6 Months Growth calculation (Strictly from members.created_at)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    last6Months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }

  const growthCounts = last6Months.map((m) => {
    return members.filter((member) => {
      if (!member.created_at) return false;
      const created = new Date(member.created_at);
      return created.getMonth() === m.month && created.getFullYear() === m.year;
    }).length;
  });

  const maxGrowth = Math.max(...growthCounts, 1);

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── WELCOME & TOP BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, Admin <span className="inline-block">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening at{" "}
            <span className="font-bold text-slate-800">
              {organization?.organization_name || "your Gym"}
            </span>{" "}
            today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Today, {currentDateFormatted}</span>
          </div>

          <button
            onClick={() => onAddMember()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Quick Action
          </button>
        </div>
      </div>

      {/* ── TOP 4 REAL METRIC CARDS ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL MEMBERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Active: {activeMembersCount}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Total Members</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{members.length}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Capacity</span>
              <span>{members.length} / {maxMembers}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (members.length / maxMembers) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ACTIVE SUBSCRIPTIONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {members.length > 0 ? `${Math.round((activeSubs.length / members.length) * 100)}%` : "0%"}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Active Subscriptions</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{activeSubs.length}</h2>
          <p className="text-xs text-slate-400 font-medium mt-3">
            {members.length - activeSubs.length} member{members.length - activeSubs.length !== 1 ? "s" : ""} without active plan
          </p>
        </div>

        {/* MONTHLY REVENUE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              MRR
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Monthly Revenue</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(mrr)}</h2>
          <p className="text-xs text-slate-400 font-medium mt-3">
            Avg: {formatCurrency(activeSubs.length ? mrr / activeSubs.length : 0)} /member
          </p>
        </div>

        {/* TRAINING SESSIONS / SLOTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Bookings: {totalBookingsCount}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Training Sessions</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{totalSlotsCount}</h2>
          <p className="text-xs text-slate-400 font-medium mt-3">
            Active session slots
          </p>
        </div>
      </div>

      {/* ── MIDDLE ROW: REAL CHARTS & QUICK ACTIONS ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* REAL MEMBER GROWTH CHART */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Member Growth</h3>
              <p className="text-slate-400 text-xs mt-0.5">Registration trends</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Last 6 Months
            </span>
          </div>

          {/* REAL BAR CHART */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {last6Months.map((mObj, idx) => {
              const count = growthCounts[idx];
              const heightPct = count > 0 ? Math.max(15, Math.min(100, (count / maxGrowth) * 100)) : 0;

              return (
                <div key={mObj.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-7 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
                    {count} member{count !== 1 ? "s" : ""}
                  </div>
                  <div className="w-full bg-slate-100/70 rounded-t-xl h-36 flex items-end overflow-hidden">
                    {count > 0 ? (
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{mObj.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* REAL MEMBERSHIP PLAN DISTRIBUTION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Membership Distribution</h3>
              <p className="text-slate-400 text-xs mt-0.5">Active plan breakdown</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {totalPlanSubs} Total
            </span>
          </div>

          {totalPlanSubs > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
              {/* DONUT CHART VISUAL */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray="100, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900">{totalPlanSubs}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Plans</span>
                </div>
              </div>

              {/* LEGEND */}
              <div className="w-full space-y-2.5">
                {Object.entries(planCounts).map(([planName, count], idx) => {
                  const colors = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-purple-600"];
                  const pct = Math.round((count / totalPlanSubs) * 100);

                  return (
                    <div key={planName} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                        <span className="text-slate-700 truncate max-w-[120px]">{planName}</span>
                      </div>
                      <span className="text-slate-500 font-bold">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="my-auto py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-semibold">No active subscriptions assigned.</p>
              <button
                onClick={onGrantSubscription}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-1"
              >
                + Assign First Plan
              </button>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Quick Actions</h3>
            <p className="text-slate-400 text-xs mb-4">Fast shortcuts for gym management</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onAddMember()}
                className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition mt-1">Add Member</span>
              </button>

              <button
                onClick={() => navigate("/admin/dashboard?tab=slots")}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition mt-1">Create Slot</span>
              </button>

              <button
                onClick={() => navigate("/admin/dashboard?tab=trainers")}
                className="p-3.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition mt-1">Add Trainer</span>
              </button>

              <button
                onClick={() => navigate("/admin/dashboard?tab=equipment")}
                className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition mt-1">Add Equipment</span>
              </button>

              <button
                onClick={() => onGrantSubscription()}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition mt-1">Assign Plan</span>
              </button>

              <button
                onClick={() => navigate("/admin/dashboard?tab=notifications")}
                className="p-3.5 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded-2xl transition text-left group flex flex-col items-start gap-1"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-pink-600 transition mt-1">Send Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: RECENT MEMBERS, RECENT ALERTS, TODAY'S OVERVIEW ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT MEMBERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Recent Members</h3>
            <button
              onClick={() => navigate("/admin/dashboard?tab=members")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {members.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {members.slice(0, 4).map((member) => (
                <div key={member.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {member.full_name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{member.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{member.email || member.phone || "No contact"}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    member.active !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {member.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              👥 No members registered yet.
            </div>
          )}
        </div>

        {/* RECENT ALERTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Recent Alerts</h3>
            <button
              onClick={() => navigate("/admin/dashboard?tab=notifications")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentNotifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800 truncate max-w-[180px]">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              📢 No announcements sent yet.
            </div>
          )}
        </div>

        {/* TODAY'S OVERVIEW METRICS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base">Today's Overview</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Active Members
                </span>
                <span className="text-slate-800">{activeMembersCount} / {maxMembers}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (activeMembersCount / maxMembers) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Active Subscriptions
                </span>
                <span className="text-slate-800">{activeSubs.length} / {maxMembers}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (activeSubs.length / maxMembers) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Training Slots Logged
              </span>
              <span className="text-slate-900 font-extrabold text-sm">{totalSlotsCount}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-purple-500" /> Revenue
              </span>
              <span className="text-slate-900 font-extrabold text-sm">{formatCurrency(mrr)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
