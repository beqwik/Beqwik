import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { logoutMember, getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import BeQwikLogo from "../../components/BeQwikLogo";

const navItems = [
  { to: "/member/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/member/subscription", icon: "💳", label: "Subscription" },
  { to: "/member/notifications", icon: "🔔", label: "Notifications" },
  { to: "/member/profile", icon: "👤", label: "Profile" },
];

export default function MemberLayout() {
  const navigate = useNavigate();
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const handleLogout = () => {
    logoutMember();
    navigate("/member/login");
  };

  const initials = member?.full_name
    ? member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen z-40">

        {/* LOGO */}
        <div className="px-6 py-5 border-b border-slate-100">
          <BeQwikLogo size={42} />
          <p className="text-[10px] text-slate-400 mt-2 truncate font-semibold">
            {org?.name || "Member Portal"}
          </p>
        </div>

        {/* MEMBER CARD */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-3 border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {member?.full_name || "Member"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {member?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {org?.name || "Organization"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {member?.full_name?.split(" ")[0] || "Member"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
