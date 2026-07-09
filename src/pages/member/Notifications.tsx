import { useEffect, useState } from "react";
import { getCurrentMember } from "../../services/member/memberAuth";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/member/memberNotificationService";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

const typeConfig: Record<string, { icon: string; bg: string; dot: string }> = {
  warning:  { icon: "⚠️", bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-400" },
  success:  { icon: "✅", bg: "bg-green-50 border-green-200",  dot: "bg-green-500" },
  info:     { icon: "ℹ️", bg: "bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" },
  reminder: { icon: "🔔", bg: "bg-blue-50 border-blue-200",   dot: "bg-blue-500" },
};

function getConfig(type: string) {
  return typeConfig[type] || typeConfig["info"];
}

export default function MemberNotifications() {
  const member = getCurrentMember();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function fetchNotifs() {
      if (!member?.id) { setLoading(false); return; }
      try {
        const data = await getNotifications(member.id);
        setNotifications(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, [member?.id]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!member?.id) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(member.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition disabled:opacity-60"
          >
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🔕</div>
          <h3 className="font-semibold text-slate-900 mb-1">No Notifications</h3>
          <p className="text-slate-500 text-sm">You're all caught up. Nothing to see here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const cfg = getConfig(n.type || "info");
            return (
              <div
                key={n.id}
                className={`rounded-2xl border p-5 flex items-start gap-4 transition ${cfg.bg} ${
                  n.is_read ? "opacity-60" : ""
                }`}
              >
                {/* DOT */}
                <div className="flex-shrink-0 mt-1">
                  {!n.is_read && (
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  )}
                  {n.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-slate-900 text-sm ${!n.is_read ? "font-bold" : ""}`}>
                      {n.title || "Notification"}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {n.created_at ? timeAgo(n.created_at) : ""}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{n.message || n.body || ""}</p>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-indigo-600 font-medium mt-2 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
