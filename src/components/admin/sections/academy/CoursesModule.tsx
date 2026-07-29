import { BookOpen, Plus, Clock, Calendar, Trash2, ShieldCheck } from "lucide-react";
import type { AcademyClass } from "../../../../services/organization/academyService";

interface CoursesModuleProps {
  classes: AcademyClass[];
  registrations: Record<string, string[]>;
  onAddClass: () => void;
  onDeleteClass: (id: string) => void;
}

export default function CoursesModule({ classes, registrations, onAddClass, onDeleteClass }: CoursesModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Course Catalog
          </h2>
          <p className="text-slate-500 text-xs font-medium">Offered academic courses</p>
        </div>
        <button
          onClick={onAddClass}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => {
          const enrolled = (registrations[cls.id] || []).length;
          const pct = Math.min(100, Math.round((enrolled / cls.maxCapacity) * 100));

          return (
            <div key={cls.id} className="bg-slate-50/60 rounded-[16px] border border-slate-200/60 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase tracking-wide">
                  Duration: {cls.courseDuration || "6 Months"}
                </span>
                <button onClick={() => onDeleteClass(cls.id)} className="text-slate-400 hover:text-rose-500 transition cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{cls.className}</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Instructor: {cls.instructorName}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between font-bold">
                  <span>Enrolled Capacity</span>
                  <span>{enrolled} / {cls.maxCapacity} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold"><Clock className="w-3.5 h-3.5 text-slate-400" /> Timing: {cls.timing}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{cls.startDate || "2026-08-01"} to {cls.endDate || "2027-02-01"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
