import { Link, useSearchParams } from "react-router-dom";
import useOrganization from "../../hooks/useOrganization";
import usePlanAccess from "../../hooks/usePlanAccess";
import BeQwikLogo from "../BeQwikLogo";

const getNavItemsForType = (type: string) => {
  const common = [
    { tab: "overview", icon: "📊", label: "Overview" },
    { tab: "members", icon: "👥", label: "Members" },
  ];

  if (type === "Gym") {
    return [
      ...common,
      { tab: "slots", icon: "🏋️‍♂️", label: "Training Slots" },
      { tab: "trainers", icon: "👨‍🏫", label: "Trainers" },
      { tab: "equipment", icon: "🛠️", label: "Equipment" },
      { tab: "subscriptions", icon: "💳", label: "Memberships" },
      { tab: "notifications", icon: "🔔", label: "Send Alerts" },
      { tab: "settings", icon: "⚙️", label: "Settings" },
    ];
  }

  if (type === "Hostel" || type === "Mess") {
    return [
      ...common,
      { tab: "menu", icon: "🍴", label: "Weekly Menu" },
      { tab: "meals", icon: "🥣", label: "Mess Log" },
      { tab: "subscriptions", icon: "💳", label: "Hostel Subs" },
      { tab: "notifications", icon: "🔔", label: "Send Alerts" },
      { tab: "settings", icon: "⚙️", label: "Settings" },
    ];
  }

  if (type === "Academy") {
    return [
      { tab: "overview", icon: "📊", label: "Overview" },
      { tab: "students", icon: "👥", label: "Students" },
      { tab: "teachers", icon: "🎓", label: "Teachers" },
      { tab: "courses", icon: "📚", label: "Courses" },
      { tab: "timetable", icon: "📅", label: "Timetable" },
      { tab: "assignments", icon: "📝", label: "Assignments" },
      { tab: "attendance", icon: "✅", label: "Attendance" },
      { tab: "tests", icon: "🏆", label: "Tests" },
      { tab: "results", icon: "📈", label: "Results" },
      { tab: "fees", icon: "💳", label: "Fees" },
      { tab: "studyMaterial", icon: "📁", label: "Study Material" },
      { tab: "reports", icon: "📊", label: "Reports" },
      { tab: "announcements", icon: "📢", label: "Announcements" },
      { tab: "settings", icon: "⚙️", label: "Settings" },
    ];
  }

  // Fallback / default
  return [
    ...common,
    { tab: "subscriptions", icon: "💳", label: "Subscriptions" },
    { tab: "notifications", icon: "🔔", label: "Send Alerts" },
    { tab: "settings", icon: "⚙️", label: "Settings" },
  ];
};

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { organization, loading } = useOrganization();
  const { hasAccess, loading: accessLoading } = usePlanAccess();

  const orgName = organization?.organization_name || "EduLMS Platform";
  const orgCode = organization?.organization_code || "HOC002";
  const dynamicNavItems = getNavItemsForType(
    organization?.organization_type || "Academy"
  );

  return (
    <aside className="w-[260px] bg-white text-slate-700 flex flex-col fixed h-screen z-40 border-r border-slate-100/90 shadow-sm">
      {/* BRAND LOGO */}
      <div className="px-6 py-5 border-b border-slate-100">
        <BeQwikLogo size={42} />
        {!loading && orgName && (
          <p className="text-[11px] text-indigo-600 mt-1 font-bold truncate tracking-wide">
            {orgName}
          </p>
        )}
      </div>

      {/* ACCESS CODE BANNER */}
      {!loading && orgCode && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="bg-[#f8fafc] rounded-[14px] px-3.5 py-2.5 border border-slate-200/60">
            <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">
              ORG SIGNUP CODE
            </p>
            <div className="flex items-center justify-between mt-0.5 gap-2">
              <span className="font-mono text-xs font-black text-indigo-700 tracking-wider">
                {orgCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(orgCode);
                  alert("Organization code copied to clipboard!");
                }}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 transition font-extrabold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {dynamicNavItems.map((item) => {
          const isActive = activeTab === item.tab;
          const allowed = hasAccess(item.tab);

          return (
            <Link
              key={item.tab}
              to={`/admin/dashboard?tab=${item.tab}`}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {!accessLoading && !allowed && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-extrabold uppercase">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER USER BADGE */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-[14px] border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">
            A
          </div>
          <div className="truncate">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              Admin Account
            </p>
            <p className="text-[10px] font-semibold text-slate-400 truncate">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}