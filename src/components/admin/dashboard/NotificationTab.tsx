interface NotificationTabProps {
  members: any[];
  recentNotifications: any[];

  alertTitle: string;
  setAlertTitle: (value: string) => void;

  alertMessage: string;
  setAlertMessage: (value: string) => void;

  sendingAlert: boolean;

  handleSendAlert: (e: React.FormEvent) => void;

  formatDate: (date: string) => string;
}

export default function NotificationTab({
  members,
  recentNotifications,
  alertTitle,
  setAlertTitle,
  alertMessage,
  setAlertMessage,
  sendingAlert,
  handleSendAlert,
  formatDate,
}: NotificationTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8 animate-fadeIn">
      {/* BROADCAST ALERT COMPONENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:col-span-1 h-fit">
        <h3 className="font-bold text-slate-800 text-lg mb-4">
          📢 Broadcast New Alert
        </h3>
        <form onSubmit={handleSendAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Alert Title
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Facility Maintenance Notice"
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the notice detail clearly to your members..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <button
            type="submit"
            disabled={sendingAlert}
            className="w-full py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
          >
            {sendingAlert ? "Broadcasting..." : "Send Announcement"}
          </button>
        </form>
      </div>

      {/* HISTORICAL BROADCAST LOGS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:col-span-2">
        <h3 className="font-bold text-slate-800 text-lg mb-4">
          History of Alerts
        </h3>
        {recentNotifications.length > 0 ? (
          <div className="space-y-4 divide-y divide-slate-100">
            {recentNotifications.map((notif) => {
              const targetMember = members.find((m) => m.id === notif.member_id);
              return (
                <div key={notif.id} className="pt-4 first:pt-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-850 text-sm">
                        {notif.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1">
                        {notif.message}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 block">
                        {formatDate(notif.created_at)}
                      </span>
                      <span className="text-[10px] text-[#b55fe6] mt-1 block">
                        Sent to: {targetMember?.full_name || "Member"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            📢 No alerts have been sent yet.
          </div>
        )}
      </div>
    </div>
  );
}
