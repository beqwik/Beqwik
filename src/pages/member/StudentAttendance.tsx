import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getStudentAttendanceByEmail } from "../../services/organization/academyService";
import { CalendarDays, CheckCircle2, AlertTriangle, BadgePercent } from "lucide-react";

export default function StudentAttendance() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const orgId = org?.id || member?.organization_id;
      if (!orgId || !member?.email) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentAttendanceByEmail(orgId, member.email);
        setAttendance(data);
      } catch (err) {
        console.error("Error loading student attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [org?.id, member?.email]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <CalendarDays className="w-8 h-8 text-indigo-600" /> My Attendance
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Track your monthly attendance records and overall progress.
        </p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-150 p-6 shadow-sm overflow-hidden">
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-center">Total Days</th>
                  <th className="px-4 py-3 text-center text-emerald-600">Present</th>
                  <th className="px-4 py-3 text-center text-rose-500">Absent</th>
                  <th className="px-4 py-3 text-center text-amber-500">Leave</th>
                  <th className="px-4 py-3 text-center">%</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4 font-bold text-slate-900">{record.month}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-600">{record.total_working_days}</td>
                    <td className="px-4 py-4 text-center font-black text-emerald-600">{record.present_days}</td>
                    <td className="px-4 py-4 text-center font-black text-rose-600">{record.absent_days}</td>
                    <td className="px-4 py-4 text-center font-bold text-amber-600">{record.leave_days}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100 shadow-sm">
                        <BadgePercent className="w-3.5 h-3.5" />
                        {record.attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-extrabold text-slate-800">{record.status}</div>
                      {record.remarks && <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{record.remarks}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Attendance Records</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              Your attendance records haven't been uploaded yet. Check back later or contact your administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
