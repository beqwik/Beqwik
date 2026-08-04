import { useState } from "react";
import { IndianRupee, Send, Mail, FileSpreadsheet, Search } from "lucide-react";
import toast from "react-hot-toast";
import type { FeeReminderItem, Student } from "../../../../services/organization/academyService";
import { triggerBatchFeeReminders } from "../../../../services/organization/academyService";
import BulkUploadFeesModal from "./modals/BulkUploadFeesModal";
import { HighlightText } from "../../../common/HighlightText";

interface FeesModuleProps {
  reminders: FeeReminderItem[];
  organizationId: string;
  students?: Student[];
  onTriggerBatchReminders: () => void;
}

export default function FeesModule({ reminders, organizationId, students = [], onTriggerBatchReminders }: FeesModuleProps) {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReminders = reminders.filter(rem => 
    (rem.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rem.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" /> Fee Reminder Automation
          </h2>
          <p className="text-slate-500 text-xs font-medium">Automated email & SMS fee notifications</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Upload CSV/Excel
          </button>
          <button
            onClick={onTriggerBatchReminders}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" /> Send All Reminders
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReminders.map(rem => (
          <div key={rem.id} className="bg-slate-50/60 rounded-[16px] border border-slate-200/60 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  <HighlightText text={rem.student_name} highlight={searchQuery} />
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  <HighlightText text={rem.email || rem.phone || "No contact info"} highlight={searchQuery} />
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${rem.due_fee > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                {rem.due_fee > 0 ? "Overdue" : "Fully Paid"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/60 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Total</p>
                <p className="text-sm font-bold text-slate-700">₹{rem.total_fees?.toLocaleString() || 0}</p>
              </div>
              <div className="border-l border-slate-200/60">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Paid</p>
                <p className="text-sm font-bold text-emerald-600">₹{rem.paid_fee?.toLocaleString() || 0}</p>
              </div>
              <div className="border-l border-slate-200/60">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Due</p>
                <p className="text-sm font-black text-rose-600">₹{rem.due_fee?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Auto-dispatch ready</span>
              <button 
                onClick={async () => {
                  const loadingToast = toast.loading(`Sending reminder to ${rem.student_name}...`);
                  try {
                    const res = await triggerBatchFeeReminders(organizationId, [rem]);
                    if (res.success) {
                      toast.success(res.message, { id: loadingToast });
                    } else {
                      toast.error(res.message, { id: loadingToast });
                    }
                  } catch (e) {
                    toast.error("Failed to send reminder", { id: loadingToast });
                  }
                }} 
                disabled={rem.due_fee <= 0} 
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 rounded-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                <Mail className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-900 mb-4">Student List & Fee Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Sr. No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Total Fee</th>
                <th className="px-4 py-3">Paid Fee</th>
                <th className="px-4 py-3 text-right">Due Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {students.length > 0 ? (
                students.map((std, index) => {
                  const feeInfo = reminders.find(f => f.student_name.toLowerCase() === std.full_name.toLowerCase()) || {
                    total_fee: 0,
                    paid_fee: 0,
                    due_fee: 0
                  };
                  return (
                    <tr key={std.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{std.full_name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">₹{feeInfo.total_fees || 0}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">₹{feeInfo.paid_fee || 0}</td>
                      <td className="px-4 py-3 font-bold text-rose-600 text-right">₹{feeInfo.due_fee || 0}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkUploadFeesModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        organizationId={organizationId}
        onSuccess={(newFees) => toast.success(`${newFees.length} fee reminders uploaded successfully! (Reload to view)`)}
      />
    </div>
  );
}
