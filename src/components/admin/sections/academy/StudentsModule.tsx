import { useState } from "react";
import { Users, UserPlus, Mail, Phone, Trash2, FileSpreadsheet, Search } from "lucide-react";
import type { Student } from "../../../../services/organization/academyService";
import { HighlightText } from "../../../common/HighlightText";

interface StudentsModuleProps {
  students: Student[];
  onAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
  onUploadStudentsList?: () => void;
}

export default function StudentsModule({ students, onAddStudent, onDeleteStudent, onUploadStudentsList }: StudentsModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(std => 
    (std.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (std.student_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (std.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" /> Student Roster
          </h2>
          <p className="text-slate-500 text-xs font-medium">Manage student registrations</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>
          {onUploadStudentsList && (
            <button
              onClick={onUploadStudentsList}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Upload List (CSV/Excel)
            </button>
          )}
          <button
            onClick={onAddStudent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Sr. No.</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((std, index) => (
                <tr key={std.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 text-center text-slate-400 font-bold">{index + 1}</td>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                  <HighlightText text={std.student_code} highlight={searchQuery} />
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  <HighlightText text={std.full_name} highlight={searchQuery} />
                </td>
                <td className="px-4 py-3 space-y-0.5">
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> <HighlightText text={std.email} highlight={searchQuery} /></div>
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
            ))
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
  );
}
