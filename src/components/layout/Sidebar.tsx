import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useOrganization from "../../hooks/useOrganization";
import usePlanAccess from "../../hooks/usePlanAccess";
import BeQwikLogo from "../BeQwikLogo";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserCheck,
  Wrench,
  CreditCard,
  BellRing,
  Megaphone,
  Settings,
  Utensils,
  FileText,
  GraduationCap,
  BookOpen,
  FileSignature,
  CheckSquare,
  Trophy,
  LineChart,
  FolderOpen,
  X
} from "lucide-react";

const getNavItemsForType = (type: string) => {
  const common = [
    { tab: "overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: "Overview" },
    { tab: "members", icon: <Users className="w-[18px] h-[18px]" />, label: "Members" },
  ];

  if (type === "Gym") {
    return [
      ...common,
      { tab: "slots", icon: <CalendarDays className="w-[18px] h-[18px]" />, label: "Training Slots" },
      { tab: "trainers", icon: <UserCheck className="w-[18px] h-[18px]" />, label: "Trainers" },
      { tab: "equipment", icon: <Wrench className="w-[18px] h-[18px]" />, label: "Equipment" },
      { tab: "subscriptions", icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Memberships" },
      { tab: "notifications", icon: <BellRing className="w-[18px] h-[18px]" />, label: "Send Alerts" },
      { tab: "announcements", icon: <Megaphone className="w-[18px] h-[18px]" />, label: "Announcements" },
      { tab: "settings", icon: <Settings className="w-[18px] h-[18px]" />, label: "Settings" },
    ];
  }

  if (type === "Hostel" || type === "Mess") {
    return [
      ...common,
      { tab: "menu", icon: <Utensils className="w-[18px] h-[18px]" />, label: "Weekly Menu" },
      { tab: "meals", icon: <FileText className="w-[18px] h-[18px]" />, label: "Mess Log" },
      { tab: "subscriptions", icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Hostel Subs" },
      { tab: "notifications", icon: <BellRing className="w-[18px] h-[18px]" />, label: "Send Alerts" },
      { tab: "settings", icon: <Settings className="w-[18px] h-[18px]" />, label: "Settings" },
    ];
  }

  if (type === "Academy") {
    return [
      { tab: "overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: "Overview" },
      { tab: "students", icon: <Users className="w-[18px] h-[18px]" />, label: "Students" },
      { tab: "teachers", icon: <GraduationCap className="w-[18px] h-[18px]" />, label: "Teachers" },
      { tab: "courses", icon: <BookOpen className="w-[18px] h-[18px]" />, label: "Courses" },
      { tab: "timetable", icon: <CalendarDays className="w-[18px] h-[18px]" />, label: "Timetable" },
      { tab: "assignments", icon: <FileSignature className="w-[18px] h-[18px]" />, label: "Assignments" },
      { tab: "attendance", icon: <CheckSquare className="w-[18px] h-[18px]" />, label: "Attendance" },
      { tab: "tests", icon: <Trophy className="w-[18px] h-[18px]" />, label: "Tests" },
      { tab: "results", icon: <LineChart className="w-[18px] h-[18px]" />, label: "Results" },
      { tab: "fees", icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Fees" },
      { tab: "studyMaterial", icon: <FolderOpen className="w-[18px] h-[18px]" />, label: "Study Material" },
      { tab: "reports", icon: <FileText className="w-[18px] h-[18px]" />, label: "Reports" },
      { tab: "announcements", icon: <Megaphone className="w-[18px] h-[18px]" />, label: "Announcements" },
      { tab: "settings", icon: <Settings className="w-[18px] h-[18px]" />, label: "Settings" },
    ];
  }

  // Fallback / default
  return [
    ...common,
    { tab: "subscriptions", icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Subscriptions" },
    { tab: "notifications", icon: <BellRing className="w-[18px] h-[18px]" />, label: "Send Alerts" },
    { tab: "settings", icon: <Settings className="w-[18px] h-[18px]" />, label: "Settings" },
  ];
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { organization, loading } = useOrganization();
  const { hasAccess, loading: accessLoading } = usePlanAccess();

  const [copied, setCopied] = useState(false);

  const orgName = organization?.organization_name || "EduLMS Platform";
  const orgCode = organization?.organization_code || "HOC002";
  const dynamicNavItems = getNavItemsForType(
    organization?.organization_type || "Academy"
  );

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(orgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavClick = () => {
    // Close the drawer on mobile after clicking a nav item
    if (onClose) onClose();
  };

  return (
    <>
      {/* BACKDROP — visible only on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          w-[260px] bg-white text-slate-700 flex flex-col fixed h-screen z-50 border-r border-slate-100/90 shadow-sm
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* BRAND LOGO + MOBILE CLOSE */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <BeQwikLogo size={42} />
          {/* Close button — visible only on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!loading && orgName && (
          <div className="px-6 pb-0 pt-1">
            <p className="text-[11px] text-blue-600 font-bold truncate tracking-wide">
              {orgName}
            </p>
          </div>
        )}

        {/* ACCESS CODE BANNER */}
        {!loading && orgCode && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="bg-[#f8fafc] rounded-xl px-4 py-3 border border-slate-200/60 shadow-inner">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                ORG SIGNUP CODE
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-black text-blue-700 tracking-wider">
                  {orgCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition font-bold flex items-center gap-1 cursor-pointer ${
                    copied ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                  }`}
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {dynamicNavItems.map((item) => {
            const isActive = activeTab === item.tab;
            const allowed = hasAccess(item.tab);

            return (
              <Link
                key={item.tab}
                to={`/admin/dashboard?tab=${item.tab}`}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {!accessLoading && !allowed && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-extrabold uppercase tracking-wide border border-slate-200">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER USER BADGE */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow transition-shadow">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-black border border-blue-100">
              A
            </div>
            <div className="truncate flex-1">
              <p className="text-[13px] font-bold text-slate-900 truncate">
                Admin Account
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate">Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}