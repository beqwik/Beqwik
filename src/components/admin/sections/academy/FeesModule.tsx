import { IndianRupee, Send, Mail } from "lucide-react";
import type { FeeReminderItem } from "../../../../services/organization/academyService";

interface FeesModuleProps {
  reminders: FeeReminderItem[];
  onTriggerBatchReminders: () => void;
}

export default function FeesModule({ reminders, onTriggerBatchReminders }: FeesModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" /> Fee Reminder Automation
          </h2>
          <p className="text-slate-500 text-xs font-medium">Automated email & SMS fee notifications</p>
        </div>
        <button
          onClick={onTriggerBatchReminders}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
        >
          <Send className="w-4 h-4" /> Send All Reminders
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.map(rem => (
          <div key={rem.id} className="bg-slate-50/60 rounded-[16px] border border-slate-200/60 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${rem.status === "overdue" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                {rem.status === "overdue" ? "Overdue" : "Due Soon"}
              </span>
              <span className="font-extrabold text-slate-900 text-sm">₹{rem.due_amount.toLocaleString()}</span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{rem.student_name}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{rem.class_name} • Due Date: {rem.due_date}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-medium">Last Sent: {rem.last_sent || "Never"}</span>
              <button onClick={() => alert(`Fee reminder sent to ${rem.student_name}!`)} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 rounded-[10px] font-bold">
                <Mail className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
