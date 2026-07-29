import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getAcademyClasses, type AcademyClass } from "../../services/organization/academyService";
import { Calendar, Clock, MapPin, Users, BookOpen, CheckCircle2 } from "lucide-react";

export default function LectureSchedule() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("Today");

  useEffect(() => {
    async function loadData() {
      if (!org?.id) {
        setLoading(false);
        return;
      }
      try {
        const clsData = await getAcademyClasses(org.id);
        setClasses(clsData || []);
      } catch (err) {
        console.error("Error loading lecture schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [org?.id]);

  const teacherName = member?.full_name || "Faculty Instructor";

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            📅 Lecture Schedule & Timetable
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            View your scheduled teaching lectures at <span className="font-bold text-indigo-600">{org?.name || "the Academy"}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
          {["Today", "This Week", "All Lectures"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedDay(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedDay === filter
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* LECTURES LIST GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-indigo-500 mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-slate-800">No Scheduled Lectures</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  There are no scheduled lectures found for your faculty account. New lectures created by the administrator will automatically appear here.
                </p>
              </div>
            ) : (
              classes.map((cls, idx) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider border border-indigo-100">
                      Lecture #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1 border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Scheduled
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                      {cls.className}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 font-semibold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Instructor: {cls.instructorName || teacherName}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{cls.timing || "09:00 AM - 10:30 AM"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Lecture Hall: {cls.room || `Hall ${101 + idx}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Capacity: Up to {cls.maxCapacity || 30} Students</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-center text-[11px] font-bold text-indigo-600">
                      Duration: {cls.courseDuration || "6 Months"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
