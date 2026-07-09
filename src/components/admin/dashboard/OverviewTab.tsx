interface OverviewTabProps {
  organization: any;
  orgSubscription: any;
  members: any[];
  memberSubscriptions: any[];
  recentNotifications: any[];

  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;

  onAddMember: () => void;
  onGrantSubscription: () => void;
}

export default function OverviewTab({
  organization,
  orgSubscription,
  members,
  memberSubscriptions,
  recentNotifications,
  formatCurrency,
  formatDate,
  onAddMember,
  onGrantSubscription,
}: OverviewTabProps) {
  const activeSubs = memberSubscriptions.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((acc, curr) => acc + (curr.amount || curr.amount_paid || 0), 0);
  const maxMembers = orgSubscription?.subscription_plans?.max_members || 50;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* WELCOME SECTION */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome Back, Admin 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here is a overview of{" "}
          <span className="font-semibold text-slate-700">
            {organization?.organization_name}
          </span>
          .
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL MEMBERS */}
        <div className="bg-[#fff8f5] rounded-3xl border border-orange-100/50 p-6 shadow-sm hover:shadow-md transition duration-250">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">👥</span>
            <span className="px-2.5 py-1 bg-[#ffe8e0] text-[#ff9c74] rounded-full text-xs font-bold">
              Limit: {maxMembers}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Total Members</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">
            {members.length}
          </h2>
          <div className="w-full bg-[#ffe8e0] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#e05275] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (members.length / maxMembers) * 100)}%` }}
            />
          </div>
        </div>

        {/* ACTIVE SUBSCRIPTIONS */}
        <div className="bg-[#fcf9ff] rounded-3xl border border-purple-100/50 p-6 shadow-sm hover:shadow-md transition duration-250">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">💳</span>
            <span className="px-2.5 py-1 bg-[#f3ebff] text-[#b55fe6] rounded-full text-xs font-bold animate-pulse">
              Active
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">
            Active Subscriptions
          </p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">
            {activeSubs.length}
          </h2>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            {members.length - activeSubs.length} members with no plan
          </p>
        </div>

        {/* MONTHLY RECURRING REVENUE */}
        <div className="bg-[#fff5f7] rounded-3xl border border-pink-100/50 p-6 shadow-sm hover:shadow-md transition duration-250">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📈</span>
            <span className="px-2.5 py-1 bg-[#ffeef2] text-[#e05275] rounded-full text-xs font-bold">
              MRR
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Monthly Revenue</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">
            {formatCurrency(mrr)}
          </h2>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            Avg: {formatCurrency(activeSubs.length ? mrr / activeSubs.length : 0)} /member
          </p>
        </div>

        {/* SaaS SUBSCRIPTION */}
        <div className="bg-[#f5f0ff] rounded-3xl border border-purple-100/50 p-6 shadow-sm hover:shadow-md transition duration-250">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🚀</span>
            <span className="px-2.5 py-1 bg-[#f3ebff] text-[#b55fe6] rounded-full text-xs font-bold">
              SaaS Status
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">SaaS Platform Plan</p>
          <h2 className="text-xl font-bold text-slate-800 mt-1 truncate">
            {orgSubscription?.subscription_plans?.name || "Trial Account"}
          </h2>
          <p className="text-xs text-slate-400 mt-3 truncate font-medium">
            Expires:{" "}
            {orgSubscription?.end_date ? formatDate(orgSubscription.end_date) : "—"}
          </p>
        </div>
      </div>

      {/* MAIN GRAPHICS / LISTINGS */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* QUICK ACTION CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Quick Tasks</h3>
          <div className="grid gap-3">
            <button
              onClick={() => onAddMember()}
              className="w-full py-3.5 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#e05275]/20 flex items-center justify-center gap-2"
            >
              <span>➕</span> Register New Member
            </button>
            <button
              onClick={() => onGrantSubscription()}
              className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <span>💳</span> Assign Member Plan
            </button>
          </div>
        </div>

        {/* RECENT NOTIFICATIONS / HISTORY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">
            Recent Broadcast Alerts
          </h3>
          {recentNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3 pr-2">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-slate-800">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              📢 No broadcast notifications sent yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
