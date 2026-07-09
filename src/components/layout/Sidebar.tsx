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
      ...common,
      { tab: "classes", icon: "📚", label: "Classes & Schedule" },
      { tab: "subscriptions", icon: "💳", label: "Tuition / Fees" },
      { tab: "notifications", icon: "🔔", label: "Send Alerts" },
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
  console.log("========== SIDEBAR ==========");
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { organization, loading } = useOrganization();
  const { hasAccess, loading: accessLoading } = usePlanAccess();

  const orgName = organization?.organization_name || "Admin Panel";
  const orgCode = organization?.organization_code || "";
  const dynamicNavItems = getNavItemsForType(
    organization?.organization_type || ""
  );

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col fixed h-screen z-40 border-r border-slate-100">
      {/* BRAND LOGO */}
      <div className="px-6 py-5 border-b border-slate-100">
        <BeQwikLogo size={42} />
        {!loading && orgName && (
          <p className="text-[10px] text-indigo-600 mt-2 font-semibold truncate">
            {orgName}
          </p>
        )}
      </div>

      {/* ACCESS CODE BANNER */}
      {!loading && orgCode && (
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="bg-[#fafbfc] rounded-xl px-4 py-3 border border-slate-150">
            <p className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">
              Org Signup Code
            </p>
            <div className="flex items-center justify-between mt-1 gap-2">
              <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                {orgCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(orgCode);
                  alert("Organization code copied to clipboard!");
                }}
                className="text-[10px] text-blue-600 hover:text-blue-700 transition font-bold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {dynamicNavItems.map((item) => {
          const isActive = activeTab === item.tab;
          const isLocked = !accessLoading && !hasAccess(item.tab);
          return (
            <Link
              key={item.tab}
              to={`/admin?tab=${item.tab}`}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {isLocked && (
                <span className="text-xs text-slate-400 select-none">🔒</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER METRIC */}
      <div className="px-6 py-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
          Powered by Subsphere SaaS
        </p>
      </div>
    </aside>
  );
}