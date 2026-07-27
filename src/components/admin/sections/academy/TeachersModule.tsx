import { GraduationCap, UserPlus, Mail, Phone, Trash2 } from "lucide-react";
import type { StaffMember } from "../../../../services/organization/academyService";

interface TeachersModuleProps {
  teachers: StaffMember[];
  onAddTeacher: () => void;
  onDeleteTeacher: (id: string) => void;
}

export default function TeachersModule({ teachers, onAddTeacher, onDeleteTeacher }: TeachersModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" /> Teachers & Faculty
          </h2>
          <p className="text-slate-500 text-xs font-medium">Manage faculty roster and roles</p>
        </div>
        <button
          onClick={onAddTeacher}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {teachers.map(teach => (
              <tr key={teach.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900">{teach.full_name}</td>
                <td className="px-4 py-3 space-y-0.5">
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {teach.email}</div>
                  {teach.phone && <div className="flex items-center gap-1 text-slate-400"><Phone className="w-3 h-3" /> {teach.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full">
                    {teach.designation || "Teacher"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDeleteTeacher(teach.id)} className="text-slate-400 hover:text-rose-500 font-bold">
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
