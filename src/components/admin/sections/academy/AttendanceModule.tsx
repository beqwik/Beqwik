import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Student } from "../../../../services/organization/academyService";

interface AttendanceModuleProps {
  students: Student[];
}

export default function AttendanceModule({ students }: AttendanceModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Daily Attendance Marking
          </h2>
          <p className="text-slate-500 text-xs font-medium">Mark present/absent register</p>
        </div>
        <button onClick={() => alert("Attendance register saved!")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-xs font-bold transition">
          Save Register
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {students.map(std => (
              <tr key={std.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900">{std.full_name}</td>
                <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{std.student_code}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1.5">
                    <button className="px-3 py-1 rounded-[10px] bg-emerald-100 text-emerald-700 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Present
                    </button>
                    <button className="px-3 py-1 rounded-[10px] bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Absent
                    </button>
                    <button className="px-3 py-1 rounded-[10px] bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Late
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
