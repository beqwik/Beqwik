import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Bell, Calendar, LogOut, Check, Sparkles, Menu } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import { supabase } from "../../services/supabase";

const defaultNotifications = [
  {
    id: "1",
    title: "Faculty Roster Synchronized",
    message: "Academy staff and teacher codes (STF-XXXX) are active and verified in database.",
    time: "10m ago",
  },
  {
    id: "2",
    title: "Student Database Isolation Active",
    message: "Student profiles & CSV uploads targeting academy_students database tables.",
    time: "1h ago",
  },
  {
    id: "3",
    title: "System Status Normal",
    message: "Dynamic organization lookup and secure database verifications active.",
    time: "2h ago",
  }
];

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organizationUser } = useOrganization();

  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Read stored notification read IDs from localStorage
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("admin_notifications_read");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = defaultNotifications.filter(n => !readIds.includes(n.id)).length;

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

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const allIds = defaultNotifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem("admin_notifications_read", JSON.stringify(allIds));
    } catch (e) { console.error(e); }
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = Array.from(new Set([...readIds, id]));
    setReadIds(updated);
    try {
      localStorage.setItem("admin_notifications_read", JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <header className="h-[60px] sm:h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* LEFT: HAMBURGER + PAGE TITLE */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only on mobile/tablet */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
          {pageTitle}
        </h2>
      </div>

      {/* NAVBAR RIGHT ACTIONS */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
        {/* SEARCH BOX — hidden on mobile */}
        <div className="relative hidden md:flex items-center w-64">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything... ⌘K"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-[14px] text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* NOTIFICATION BELL WITH DROPDOWN POPOVER */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifPopover(prev => !prev)}
            className={`w-9 h-9 rounded-full flex items-center justify-center relative transition cursor-pointer ${
              showNotifPopover ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border-2 border-white animate-pulse" />
            )}
          </button>

          {/* NOTIFICATION POPOVER MENU */}
          {showNotifPopover && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fadeIn">
              {/* Popover Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Popover Body / Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {unreadCount === 0 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-slate-800 text-sm">All caught up!</p>
                    <p className="text-slate-400 text-xs mt-0.5">No unread notifications at this time.</p>
                  </div>
                ) : (
                  defaultNotifications.map((n) => {
                    const isRead = readIds.includes(n.id);
                    if (isRead) return null;
                    return (
                      <div
                        key={n.id}
                        className="p-4 transition flex gap-3 items-start bg-indigo-50/30 hover:bg-indigo-50/60"
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-indigo-600" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900 text-xs truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-semibold shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <button
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="text-[11px] text-indigo-600 font-bold mt-2 hover:underline inline-block cursor-pointer"
                          >
                            Mark as read
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifPopover(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DATE FILTER BUTTON — hidden on mobile */}
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
          className="px-2 sm:px-3.5 py-1.5 rounded-[14px] border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}