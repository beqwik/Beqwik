import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getActiveSubscription } from "../../services/member/memberSubscriptionService";
import { getUnreadCount } from "../../services/member/memberNotificationService";

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MemberDashboard() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [subscription, setSubscription] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!member?.id) { setLoading(false); return; }
      try {
        const [sub, count] = await Promise.all([
          getActiveSubscription(member.id),
          getUnreadCount(member.id),
        ]);
        setSubscription(sub);
        setUnreadCount(count);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [member?.id]);

  const daysLeft = subscription?.end_date ? getDaysRemaining(subscription.end_date) : null;
  const planName = subscription?.subscription_plans?.name || subscription?.plan_name || null;

  const getStatusColor = () => {
    if (!daysLeft && daysLeft !== 0) return "bg-slate-100 text-slate-500";
    if (daysLeft <= 3) return "bg-red-100 text-red-600";
    if (daysLeft <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusLabel = () => {
    if (!subscription) return "No Active Plan";
    if (daysLeft === 0) return "Expired Today";
    if (daysLeft !== null && daysLeft <= 3) return `Expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}!`;
    return "Active";
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = member?.full_name?.split(" ")[0] || "Member";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#e05275] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">~

      {/* GREETING */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here's a summary of your membership at <span className="font-medium text-slate-700">{org?.name || "your organization"}</span>.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* SUBSCRIPTION STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">💳</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Current Plan</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {planName || "No Plan"}
          </h2>
          {subscription?.end_date && (
            <p className="text-xs text-slate-400 mt-2">
              Expires: {formatDate(subscription.end_date)}
            </p>
          )}
        </div>

        {/* DAYS REMAINING */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📅</span>
            {daysLeft !== null && daysLeft <= 7 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                Renew Soon
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">Days Remaining</p>
          <h2 className={`text-4xl font-bold mt-1 ${daysLeft !== null && daysLeft <= 3 ? "text-red-500" : "text-slate-900"}`}>
            {daysLeft !== null ? daysLeft : "—"}
          </h2>
          {subscription?.start_date && (
            <p className="text-xs text-slate-400 mt-2">
              Since: {formatDate(subscription.start_date)}
            </p>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fff0f5] text-[#e05275]">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">Unread Notifications</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-1">{unreadCount}</h2>
          <p className="text-xs text-slate-400 mt-2">
            {unreadCount === 0 ? "You're all caught up!" : "Click to view"}
          </p>
        </div>

      </div>

      {/* SUBSCRIPTION DETAILS CARD */}
      {subscription ? (
        <div className="bg-gradient-to-br from-[#e05275] to-[#b55fe6] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-pink-200 text-sm font-medium">Active Subscription</p>
              <h2 className="text-2xl font-bold mt-1">{planName || "Membership Plan"}</h2>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-indigo-300 text-xs">Start Date</p>
                  <p className="font-semibold text-sm">{subscription.start_date ? formatDate(subscription.start_date) : "—"}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-xs">End Date</p>
                  <p className="font-semibold text-sm">{subscription.end_date ? formatDate(subscription.end_date) : "—"}</p>
                </div>
                {subscription.amount && (
                  <div>
                    <p className="text-pink-200 text-xs">Amount</p>
                    <p className="font-semibold text-sm">₹{subscription.amount}</p>
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/member/subscription"
              className="flex-shrink-0 px-5 py-3 bg-white text-[#e05275] rounded-xl font-semibold text-sm hover:bg-pink-50 transition"
            >
              Manage →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-semibold text-slate-900 mb-1">No Active Subscription</h3>
          <p className="text-slate-500 text-sm">Contact your organization to get subscribed.</p>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/member/subscription", icon: "💳", label: "View Subscription", sub: "Check plan & dates" },
            { to: "/member/notifications", icon: "🔔", label: "Notifications", sub: `${unreadCount} unread` },
            { to: "/member/profile", icon: "👤", label: "My Profile", sub: "Update your info" },
            { to: "/member/dashboard", icon: "📊", label: "Overview", sub: "Activity summary" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#ffd6e4] transition group"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="font-semibold text-slate-900 mt-3 text-sm group-hover:text-[#e05275] transition">
                {item.label}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
