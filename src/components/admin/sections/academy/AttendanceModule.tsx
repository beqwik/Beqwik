import { useState } from "react";
import { CheckCircle2, FileSpreadsheet, BadgePercent, CalendarDays, Search } from "lucide-react";
import BulkUploadAttendanceModal from "./modals/BulkUploadAttendanceModal";
import { HighlightText } from "../../../common/HighlightText";

import type { Student, FeeReminderUploadRow } from "../../../../services/organization/academyService";

interface AttendanceModuleProps {
  attendanceData: any[];
  organizationId: string;
}

export default function AttendanceModule({ attendanceData, organizationId }: AttendanceModuleProps) {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendance = attendanceData?.filter(record => 
    (record.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (record.student_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (record.student_code || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Monthly Attendance Ledger
          </h2>
          <p className="text-slate-500 text-xs font-medium">Review and upload student attendance monthly aggregates</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Upload CSV/Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Sr. No.</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Present</th>
              <th className="px-4 py-3 text-center">Absent</th>
              <th className="px-4 py-3 text-center">Leave</th>
              <th className="px-4 py-3 text-center">%</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record, index) => (
                <tr key={record.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-center text-slate-400 font-bold">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">
                      <HighlightText text={record.student_name} highlight={searchQuery} />
                    </div>
                    <div className="text-[10px] font-mono text-indigo-600 font-bold">
                      <HighlightText text={record.student_email || record.student_code} highlight={searchQuery} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-semibold">{record.month}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-600">{record.total_working_days}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">{record.present_days}</td>
                  <td className="px-4 py-3 text-center font-bold text-rose-600">{record.absent_days}</td>
                  <td className="px-4 py-3 text-center font-bold text-amber-600">{record.leave_days}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-emerald-50 text-emerald-700 font-black">
                      {record.attendance_percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-slate-700">{record.status}</div>
                    {record.remarks && <div className="text-[10px] text-slate-400">{record.remarks}</div>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No attendance records found. Upload a CSV to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BulkUploadAttendanceModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        organizationId={organizationId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
