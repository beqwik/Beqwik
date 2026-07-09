import { MessageSquare, Send, Mail } from "lucide-react";

export default function Communication() {
  const templates = [
    { title: "Subscription Active Confirmation", channel: "Email", count: "1,200 sent" },
    { title: "Renewal Failure Warning", channel: "Email", count: "89 sent" },
    { title: "Overdue Account Suspended", channel: "Email", count: "12 sent" },
    { title: "New Feature Announcement", channel: "Push", count: "0 sent" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          System <span className="text-blue-600">Communication</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage system notification templates and email dispatches
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((tpl) => (
          <div key={tpl.title} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{tpl.title}</h3>
                <span className="text-xs text-slate-400 font-semibold">Channel: {tpl.channel}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{tpl.count}</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200/50 transition cursor-pointer">
                <Send className="w-3.5 h-3.5" />
                <span>Trigger Mail</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
