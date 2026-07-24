import { Users, UserPlus, Mail, Phone, Trash2 } from "lucide-react";
import type { Student } from "../../../../services/organization/academyService";

interface StudentsModuleProps {
  students: Student[];
  onAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentsModule({ students, onAddStudent, onDeleteStudent }: StudentsModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" /> Student Roster
          </h2>
          <p className="text-slate-500 text-xs font-medium">Manage student registrations</p>
        </div>
        <button
          onClick={onAddStudent}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {students.map(std => (
              <tr key={std.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">{std.student_code}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{std.full_name}</td>
                <td className="px-4 py-3 space-y-0.5">
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {std.email}</div>
                  {std.phone && <div className="flex items-center gap-1 text-slate-400"><Phone className="w-3 h-3" /> {std.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold uppercase text-[9px]">Student</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDeleteStudent(std.id)} className="text-slate-400 hover:text-rose-500 font-bold">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
