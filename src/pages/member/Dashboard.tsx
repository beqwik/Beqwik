import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getActiveSubscription } from "../../services/member/memberSubscriptionService";
import { getUnreadCount } from "../../services/member/memberNotificationService";
import { 
  Calendar, Users, QrCode, Sparkles, LogIn, LogOut, CheckCircle2 
} from "lucide-react";

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

  // Gym Interactive States
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Record<string, string[]>>({});

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

  // Load real slots & bookings created by the organization
  useEffect(() => {
    if (!org?.id) return;
    
    const storedSlots = localStorage.getItem(`gym_slots_${org.id}`);
    if (storedSlots) {
      setSlots(JSON.parse(storedSlots));
    }
    
    const storedBookings = localStorage.getItem(`gym_bookings_${org.id}`);
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, [org?.id]);

  const daysLeft = subscription?.end_date ? getDaysRemaining(subscription.end_date) : null;
  const planName = subscription?.subscription_plans?.name || subscription?.plan_name || null;

  const getStatusColor = () => {
    if (!daysLeft && daysLeft !== 0) return "bg-slate-100 text-slate-500";
    if (daysLeft <= 3) return "bg-red-100 text-red-650";
    if (daysLeft <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  };

  const getStatusLabel = () => {
    if (!subscription) return "No Active Plan";
    if (daysLeft === 0) return "Expired Today";
    if (daysLeft !== null && daysLeft <= 3) return `Expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}!`;
    return "Active";
  };

  const handleCheckIn = () => {
    if (checkedIn) {
      setCheckedIn(false);
      setCheckInTime(null);
    } else {
      setCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    }
  };

  const handleReserveSlot = (slotId: string) => {
    if (!org?.id || !member?.id) return;

    const currentBookings = { ...bookings };
    const slotBookings = currentBookings[slotId] || [];
    const isBooked = slotBookings.includes(member.id);

    if (isBooked) {
      // Cancel booking
      currentBookings[slotId] = slotBookings.filter(id => id !== member.id);
    } else {
      // Reserve booking
      const slot = slots.find(s => s.id === slotId);
      if (slot && slotBookings.length >= slot.maxCapacity) {
        alert("This slot is already at full capacity.");
        return;
      }
      currentBookings[slotId] = [...slotBookings, member.id];
    }

    localStorage.setItem(`gym_bookings_${org.id}`, JSON.stringify(currentBookings));
    setBookings(currentBookings);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = member?.full_name?.split(" ")[0] || "Member";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── RENDERING CUSTOM INTERACTIVE GYM PORTAL ────────────────────────────────
  const renderGymPortal = () => {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, {firstName} <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Ready to crush your goals today at <span className="font-bold text-blue-600">{org?.name || "the Gym"}</span>?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
              Plan: {planName || "Trial"} ({getStatusLabel()})
            </span>
          </div>
        </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* DIGITAL ACCESS CARD */}
          <div className="bg-white rounded-[2rem] border border-slate-150 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-50 rounded-full -z-0 opacity-50" />
            
            <div className="relative z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Touchless Check-In
              </span>
              <h3 className="text-lg font-bold text-slate-800">Membership Pass</h3>

              {/* Barcode/QR Mock */}
              <div className="my-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <QrCode className="w-32 h-32 text-slate-800" />
                <span className="text-[10px] font-mono text-slate-400 mt-2">MEMBER-{member?.id?.slice(0, 8).toUpperCase() || "ID"}</span>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                checkedIn
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
              }`}
            >
              {checkedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Checked In at {checkInTime} (Leave)</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Scan / Simulated Check-In</span>
                </>
              )}
            </button>
          </div>

          {/* ACTIVE SUBSCRIPTION DETAILS CARD */}
          {subscription ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-750 rounded-[2rem] p-8 text-white shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Active Subscription</p>
                <h2 className="text-3xl font-black mt-2">{planName || "Membership Plan"}</h2>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <p className="text-blue-200 text-xs font-semibold">Start Date</p>
                    <p className="font-extrabold text-base mt-1">{subscription.start_date ? formatDate(subscription.start_date) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-semibold">End Date</p>
                    <p className="font-extrabold text-base mt-1">{subscription.end_date ? formatDate(subscription.end_date) : "—"}</p>
                  </div>
                  {subscription.amount && (
                    <div className="col-span-2">
                      <p className="text-blue-200 text-xs font-semibold">Amount Paid</p>
                      <p className="font-extrabold text-lg mt-1">₹{subscription.amount}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-blue-200 font-medium">Auto-renewal enabled</span>
                <Link
                  to="/member/subscription"
                  className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Manage Membership →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">No Active Subscription</h3>
              <p className="text-slate-400 text-sm max-w-xs">Contact your gym administration to get subscribed and unlock training reservations.</p>
            </div>
          )}
        </div>

        {/* Slot Booking Section */}
        <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_10px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Training Session Reservation
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                Book your training sessions. Slots are managed dynamically by gym administration.
              </p>
            </div>
          </div>

          <div className="p-6">
            {slots.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                No training slots scheduled by administration yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {slots.map((slot) => {
                  const enrolledIds = bookings[slot.id] || [];
                  const currentBookedCount = enrolledIds.length;
                  const isBooked = enrolledIds.includes(member?.id || "");
                  const vacancy = slot.maxCapacity - currentBookedCount;

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition duration-200 ${
                        isBooked
                          ? "border-blue-300 bg-blue-50/30 ring-2 ring-blue-600/10"
                          : "border-slate-100 bg-white hover:border-slate-350"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slot.dayOfWeek}</span>
                          {isBooked && <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-2">Trainer: {slot.trainerName}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Time: {slot.startTime} - {slot.endTime}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-4 mt-2">
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-450" /> {currentBookedCount} / {slot.maxCapacity} Booked
                        </span>
                        <button
                          onClick={() => handleReserveSlot(slot.id)}
                          disabled={!isBooked && vacancy <= 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                            isBooked
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-650"
                              : vacancy <= 0
                              ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isBooked ? "Cancel Slot" : vacancy <= 0 ? "Full" : "Reserve Slot"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Cards */}
        <div>
          <h3 className="font-bold text-slate-800 text-lg mb-4">Portal Modules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: "/member/subscription", icon: "💳", label: "Membership details", sub: "View active plan" },
              { to: "/member/notifications", icon: "🔔", label: "Notifications", sub: `${unreadCount} unread` },
              { to: "/member/profile", icon: "👤", label: "My Profile", sub: "Update login details" },
              { to: "/member/dashboard", icon: "🏋️‍♂️", label: "Dashboard Overview", sub: "Interactive pass & booking" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="bg-white rounded-2xl border border-slate-150 p-5 hover:shadow-md hover:border-blue-200 transition group text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-bold text-slate-800 mt-3 text-sm group-hover:text-blue-600 transition">
                  {item.label}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDERING DEFAULT PORTAL ───────────────────────────────────────────────
  const renderDefaultPortal = () => {
    const daysLeft = subscription?.end_date ? getDaysRemaining(subscription.end_date) : null;
    return (
      <div className="space-y-8">
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-150 text-sm font-medium">Active Subscription</p>
                <h2 className="text-2xl font-bold mt-1">{planName || "Membership Plan"}</h2>
                <div className="flex gap-6 mt-3">
                  <div>
                    <p className="text-blue-200 text-xs">Start Date</p>
                    <p className="font-semibold text-sm">{subscription.start_date ? formatDate(subscription.start_date) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">End Date</p>
                    <p className="font-semibold text-sm">{subscription.end_date ? formatDate(subscription.end_date) : "—"}</p>
                  </div>
                  {subscription.amount && (
                    <div>
                      <p className="text-blue-200 text-xs">Amount</p>
                      <p className="font-semibold text-sm">₹{subscription.amount}</p>
                    </div>
                  )}
                </div>
              </div>
              <Link
                to="/member/subscription"
                className="flex-shrink-0 px-5 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
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
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-100 transition group text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-slate-900 mt-3 text-sm group-hover:text-blue-600 transition">
                  {item.label}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    org?.organization_type === "Gym" ? renderGymPortal() : renderDefaultPortal()
  );
}
