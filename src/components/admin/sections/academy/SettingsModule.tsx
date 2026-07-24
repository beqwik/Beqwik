import { Settings, Save } from "lucide-react";

export default function SettingsModule() {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" /> EduLMS Preferences & Settings
          </h2>
          <p className="text-slate-500 text-xs font-medium">Configure passing marks scale and fee reminder schedules</p>
        </div>
        <button onClick={() => alert("Settings saved!")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
        <div className="space-y-3 p-4 bg-slate-50 rounded-[16px] border border-slate-200/60">
          <h3 className="font-extrabold text-slate-900 text-sm">Grading & Exam Scale</h3>
          <div>
            <label className="block text-slate-500 mb-1">Default Passing Percentage (%)</label>
            <input type="number" defaultValue={40} className="w-full px-3 py-2 border border-slate-200 rounded-[12px] bg-white font-bold" />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Grade A Cutoff (%)</label>
            <input type="number" defaultValue={85} className="w-full px-3 py-2 border border-slate-200 rounded-[12px] bg-white font-bold" />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-slate-50 rounded-[16px] border border-slate-200/60">
          <h3 className="font-extrabold text-slate-900 text-sm">Automated Fee Reminders</h3>
          <div>
            <label className="block text-slate-500 mb-1">Reminder Schedule</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-[12px] bg-white font-bold">
              <option>Send 3 Days Before Due Date</option>
              <option>Send On Due Date</option>
              <option>Send Weekly Until Paid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
