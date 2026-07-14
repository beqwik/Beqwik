import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  FileText,
  RefreshCw,
  Zap,
  FileBarChart,
  MessageSquare,
} from "lucide-react";

import {
  logoutSuperAdmin,
  getCurrentSuperAdmin,
} from "../../services/superAdmin/superAdminAuth";

import BeQwikLogo from "../../components/BeQwikLogo";

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [admin, setAdmin] =
    useState<any>(null);

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    const data =
      await getCurrentSuperAdmin();

    setAdmin(data);
  }

  const handleLogout = async () => {
    await logoutSuperAdmin();

    navigate("/super-admin/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      href: "/super-admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      href: "/super-admin/organizations",
      icon: Users,
    },
    {
      label: "Subscriptions",
      href: "/super-admin/subscriptions",
      icon: Receipt,
    },
    {
      label: "Payments",
      href: "/super-admin/payments",
      icon: CreditCard,
    },
    {
      label: "Invoices",
      href: "/super-admin/invoices",
      icon: FileText,
    },
    {
      label: "Renewals",
      href: "/super-admin/renewals",
      icon: RefreshCw,
    },
    {
      label: "Analytics",
      href: "/super-admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Automation",
      href: "/super-admin/automation",
      icon: Zap,
    },
    {
      label: "Reports",
      href: "/super-admin/reports",
      icon: FileBarChart,
    },
    {
      label: "Communication",
      href: "/super-admin/communication",
      icon: MessageSquare,
    },
    {
      label: "Settings",
      href: "/super-admin/settings",
      icon: SettingsIcon,
    },
  ];

  const currentPage = menuItems.find(
    (item) => location.pathname === item.href
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex">

      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-30">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <BeQwikLogo size={42} />
          <span className="mt-2 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Super Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                    }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile at bottom */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {admin?.full_name
                ? admin.full_name.substring(0, 2).toUpperCase()
                : "SA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {admin?.full_name ?? "Super Admin"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Platform Manager
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* â”€â”€ Main wrapper (offset by sidebar) â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">

          <div>
            <h2 className="text-base font-bold text-slate-800">
              {currentPage?.label ?? "Super Admin"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              BeQwik Control Panel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-52 transition-all"
              />
            </div>

            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {admin?.full_name
                  ? admin.full_name.substring(0, 2).toUpperCase()
                  : "SA"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {admin?.full_name ?? "Admin"}
                </p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>

        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );

}
