import { FileText, Calendar } from "lucide-react";
import type { AssignmentItem } from "../../../../services/organization/academyService";

interface AssignmentsModuleProps {
  assignments: AssignmentItem[];
}

export default function AssignmentsModule({ assignments }: AssignmentsModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Homework & Assignments
          </h2>
          <p className="text-slate-500 text-xs font-medium">Track student submissions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(asg => (
          <div key={asg.id} className="bg-slate-50/60 rounded-[16px] border border-slate-200/60 p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-600">{asg.subject}</span>
              <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${asg.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {asg.status}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">{asg.title}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{asg.class_name}</p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span className="flex items-center gap-1 font-medium"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {asg.due_date}</span>
              <span className="font-extrabold text-slate-900">{asg.submissions_count} / {asg.total_students} Done</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
