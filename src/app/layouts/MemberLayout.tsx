import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { logoutMember, getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { checkIsStaffMember, checkIsAcademyOrg } from "../../services/organization/academyService";
import BeQwikLogo from "../../components/BeQwikLogo";

export default function MemberLayout() {
  const navigate = useNavigate();
  const member = getCurrentMember();
  const org = getCurrentOrganization();

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

  const initials = member?.full_name
    ? member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

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
          { to: "/student/attendance", icon: "📅", label: "Attendance" },
          { to: "/student/results", icon: "🏆", label: "Results" },
          { to: "/student/courses", icon: "🔍", label: "Explore Courses" },
          { to: "/student/my-courses", icon: "🎓", label: "My Courses" },
          { to: "/student/notifications", icon: "🔔", label: "Notifications" },
          { to: "/student/profile", icon: "👤", label: "Profile" },
        ]
    : [
        { to: "/member/dashboard", icon: "🏠", label: "Dashboard" },
        { to: "/member/subscription", icon: "💳", label: "Subscription" },
        { to: "/member/notifications", icon: "🔔", label: "Notifications" },
        { to: "/member/profile", icon: "👤", label: "Profile" },
      ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen z-40">
        {/* LOGO */}
        <div className="px-6 py-5 border-b border-slate-100">
          <BeQwikLogo size={42} />
          <p className="text-[10px] text-slate-400 mt-2 truncate font-semibold">
            {org?.name || (isStaff ? "Faculty Portal" : "Student Portal")}
          </p>
        </div>

        {/* MEMBER / STUDENT / STAFF CARD */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 bg-indigo-50/70 rounded-xl px-3 py-3 border border-indigo-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {member?.full_name || (isStaff ? "Faculty Member" : "Student")}
                </p>
              </div>
              <p className="text-xs text-indigo-600 font-bold truncate">
                {isStaff ? (member?.designation || "Teacher / Staff") : (member?.email || "")}
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
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-bold"
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
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {member?.full_name?.split(" ")[0] || (isStaff ? "Teacher" : "Student")}
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
