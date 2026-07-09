import { Zap, Play, CheckCircle } from "lucide-react";

export default function Automation() {
  const tasks = [
    { name: "Renewal Reminders", trigger: "3 days before expiry", action: "Email Notification", status: "Active" },
    { name: "Overdue Suspensions", trigger: "5 days after expiry", action: "Disable Subscriptions", status: "Active" },
    { name: "Dunning Emails", trigger: "On invoice payment fail", action: "Retry + Email", status: "Active" },
    { name: "Welcome Sequence", trigger: "On new organization signup", action: "Send onboarding guide", status: "Inactive" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Automation <span className="text-blue-600">Workflows</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Automate billing cycles, notifications, and platform workflows
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.name} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{task.name}</h3>
                  <span className="text-xs font-semibold text-slate-400">Trigger: {task.trigger}</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                task.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-slate-50 text-slate-400 border border-slate-100"
              }`}>
                {task.status}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Action: <strong>{task.action}</strong></span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200/50 transition cursor-pointer">
                <Play className="w-3 h-3" />
                <span>Test Run</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
