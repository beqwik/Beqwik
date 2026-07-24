import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Bell, Calendar, LogOut } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import { supabase } from "../../services/supabase";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organizationUser } = useOrganization();

  const activeTab = searchParams.get("tab") || "overview";

  const pageTitle =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  const fullName =
    organizationUser?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "developer";

  const initials = useMemo(() => {
    return fullName
      .split(" ")
      .map((n: string) => n.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [fullName]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <header className="h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
        {pageTitle}
      </h2>

      {/* NAVBAR RIGHT ACTIONS */}
      <div className="flex items-center gap-5">
        {/* SEARCH BOX */}
        <div className="relative hidden md:flex items-center w-64">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything... ⌘K"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-[14px] text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* NOTIFICATION BELL WITH RED DOT */}
        <button
          onClick={() => alert("No new unread notifications")}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center relative transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white" />
        </button>

        {/* DATE FILTER BUTTON */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-[14px] px-3 py-1.5 text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>This Month</span>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
            {initials}
          </div>

          <div className="hidden lg:block text-left">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">
              {fullName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {organizationUser?.role || "OWNER"}
            </p>
          </div>
        </div>

        {/* SIGN OUT BUTTON */}
        <button
          onClick={handleSignOut}
          className="px-3.5 py-1.5 rounded-[14px] border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" /> Sign Out
        </button>
      </div>
    </header>
  );
}