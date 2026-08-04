import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { logoutMember, getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { checkIsStaffMember, checkIsAcademyOrg } from "../../services/organization/academyService";
import BeQwikLogo from "../../components/BeQwikLogo";
import {
  Home,
  CreditCard,
  Bell,
  Settings,
  Menu,
  X,
  HelpCircle,
  Info,
  ShieldCheck,
  FileText,
  LogOut,
} from "lucide-react";

export default function MemberLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isStaff, setIsStaff] = useState<boolean>(() => {
    const role = member?.role?.toLowerCase() || "";
    const email = member?.email?.toLowerCase() || "";
    const name = member?.full_name?.toLowerCase() || "";
    return (
      role === "staff" ||
      role === "teacher" ||
      Boolean(member?.designation) ||
      email.includes("staff") ||
      email.includes("teacher") ||
      name.includes("staff") ||
      name.includes("teacher")
    );
  });

  const [isAcademy, setIsAcademy] = useState<boolean>(() => {
    return org?.organization_type === "Academy" || isStaff;
  });

  useEffect(() => {
    async function verifyAcademyAndStaff() {
      if (org?.id || member?.email) {
        const verifiedStaff = await checkIsStaffMember(org?.id || "", member?.email || "");
        if (verifiedStaff) setIsStaff(true);

        const verifiedAcademy = await checkIsAcademyOrg(org?.id || org?.organization_code || "", member?.email || "");
        if (verifiedAcademy || verifiedStaff) setIsAcademy(true);
      }
    }
    verifyAcademyAndStaff();
  }, [org?.id, org?.organization_code, member?.email]);

  const handleLogout = () => {
    logoutMember();
    navigate("/member/login");
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const initials = member?.full_name
    ? member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  // Sidebar primary navigation items (for desktop & Academy layout)
  const navItems = isAcademy
    ? isStaff
      ? [
          { to: "/staff/dashboard", icon: "📊", label: "Faculty Dashboard" },
          { to: "/staff/lecture-schedule", icon: "📅", label: "Lecture Schedule" },
          { to: "/staff/notifications", icon: "🔔", label: "Notices & Alerts" },
          { to: "/staff/profile", icon: "👤", label: "Profile" },
        ]
      : [
          { to: "/student/dashboard", icon: "📚", label: "Dashboard" },
          { to: "/student/courses", icon: "🔍", label: "Explore Courses" },
          { to: "/student/my-courses", icon: "🎓", label: "My Courses" },
          { to: "/student/notifications", icon: "🔔", label: "Notifications" },
          { to: "/student/profile", icon: "👤", label: "Profile" },
        ]
    : [
        { to: "/member/dashboard", icon: "🏠", label: "Dashboard" },
        { to: "/member/subscription", icon: "💳", label: "Subscription" },
        { to: "/member/notifications", icon: "🔔", label: "Notifications" },
        { to: "/member/profile", icon: "⚙️", label: "Settings & Profile" },
      ];

  // Gym Member Floating Bottom Navigation Dock items (4 items: Dashboard, Subscription, Notifications, Settings)
  const gymDockItems = [
    { to: "/member/dashboard", label: "Dashboard", icon: Home, exact: true },
    { to: "/member/subscription", label: "Subscription", icon: CreditCard },
    { to: "/member/notifications", label: "Notifications", icon: Bell },
    { to: "/member/profile", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 relative pb-safe">
      {/* BACKDROP — visible only for Academy when mobile drawer is open */}
      {sidebarOpen && isAcademy && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — Drawer for Academy mobile/tablet, Fixed on desktop (>= lg) for Gym */}
      <aside
        className={`
          w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen && isAcademy ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO + MOBILE CLOSE */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <BeQwikLogo size={42} />
            <p className="text-[10px] text-slate-400 mt-2 truncate font-semibold">
              {org?.name || (isStaff ? "Faculty Portal" : isAcademy ? "Student Portal" : "Gym Member Portal")}
            </p>
          </div>
          {isAcademy && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MEMBER / STUDENT / STAFF CARD */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 bg-blue-50/70 rounded-xl px-3 py-3 border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {member?.full_name || (isStaff ? "Faculty Member" : isAcademy ? "Student" : "Member")}
                </p>
              </div>
              <p className="text-xs text-blue-600 font-bold truncate">
                {isStaff ? (member?.designation || "Teacher / Staff") : (member?.email || "")}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
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
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full lg:w-[calc(100%-256px)]">
        {/* TOP BAR HEADER */}
        <header className="h-[60px] sm:h-[72px] bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button — ONLY visible for Academy. REMOVED for Gym Member */}
            {isAcademy && (
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium truncate">
              {org?.name || "Gym Organization"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {member?.full_name?.split(" ")[0] || (isStaff ? "Teacher" : "Member")}
            </span>
          </div>
        </header>

        {/* PAGE CONTENT — added pb-28 for Gym Member so content NEVER overlaps bottom dock */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${!isAcademy ? "pb-28 lg:pb-8" : ""}`}>
          <Outlet />
        </main>
      </div>

      {/* FLOATING BOTTOM NAVIGATION DOCK — Applied ONLY to Gym User Portal on Mobile & Tablet (< lg) */}
      {!isAcademy && (
        <nav
          className="lg:hidden fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-[24px] px-3 py-2 flex items-center justify-around transition-all duration-300"
          aria-label="Bottom Navigation"
        >
          {gymDockItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className="flex flex-col items-center justify-center transition-all duration-200 group px-2 py-1 relative"
              >
                {/* Icon Wrapper with light blue rounded background when active */}
                <div
                  className={`px-3.5 py-1.5 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                    isActive ? "bg-blue-50/90 text-blue-600 shadow-xs" : "bg-transparent text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-active:scale-90" />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-all duration-200 ${
                    isActive ? "font-bold text-blue-600" : "font-medium text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5 transition-all duration-200 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
