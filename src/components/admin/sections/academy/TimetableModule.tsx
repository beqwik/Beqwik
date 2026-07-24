import { Calendar } from "lucide-react";
import type { TimetableSlot } from "../../../../services/organization/academyService";

interface TimetableModuleProps {
  slots: TimetableSlot[];
}

export default function TimetableModule({ slots }: TimetableModuleProps) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Weekly Timetable
          </h2>
          <p className="text-slate-500 text-xs font-medium">Class period schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => {
          const daySlots = slots.filter(s => s.day === day);
          return (
            <div key={day} className="bg-slate-50/70 rounded-[16px] border border-slate-200/60 p-4 space-y-3">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider text-indigo-600">{day}</h3>
              {daySlots.length > 0 ? (
                daySlots.map(slot => (
                  <div key={slot.id} className={`p-3 rounded-[12px] border ${slot.color} space-y-1`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span>{slot.subject}</span>
                      <span className="text-[10px] opacity-80">{slot.time}</span>
                    </div>
                    <p className="text-[11px] font-medium opacity-90">{slot.teacher} • {slot.room}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-3 text-center">No classes scheduled</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
