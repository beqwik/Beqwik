import { BookOpen, Plus, Clock, MapPin, Trash2 } from "lucide-react";
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
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2"
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
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px]">
                  {cls.dayOfWeek}
                </span>
                <button onClick={() => onDeleteClass(cls.id)} className="text-slate-400 hover:text-rose-500">
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

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {cls.timing}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {cls.room}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
