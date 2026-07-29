import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import {
  getAcademyClasses,
  getClassRegistrations,
  unenrollStudentFromClass,
  type AcademyClass
} from "../../services/organization/academyService";
import { GraduationCap, Clock, Calendar, Search, Trash2, ArrowRight } from "lucide-react";

export default function MyCourses() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  const studentId = member?.id || "";

  useEffect(() => {
    async function loadData() {
      if (!org?.id) { setLoading(false); return; }
      try {
        setLoading(true);
        const [fetchedClasses, fetchedRegs] = await Promise.all([
          getAcademyClasses(org.id),
          getClassRegistrations(org.id)
        ]);
        setClasses(fetchedClasses);
        setRegistrations(fetchedRegs);
      } catch (err) {
        console.error("Error loading enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [org?.id]);

  const handleUnenroll = async (classId: string) => {
    if (!org?.id || !studentId) return;

    try {
      setUnenrollingId(classId);
      await unenrollStudentFromClass(classId, studentId);
      setRegistrations(prev => ({
        ...prev,
        [classId]: (prev[classId] || []).filter(id => id !== studentId)
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUnenrollingId(null);
    }
  };

  const enrolledClasses = classes.filter(cls => {
    const classRegs = registrations[cls.id] || [];
    return classRegs.includes(studentId);
  });

  const filteredEnrolled = enrolledClasses.filter(
    cls =>
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            My Courses <GraduationCap className="w-7 h-7 text-indigo-600" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage your enrolled courses and class schedules at <span className="font-bold text-slate-700">{org?.name || "the academy"}</span>.
          </p>
        </div>

        {/* Search Input */}
        {enrolledClasses.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search my courses..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[14px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-2xs"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-bold">Loading your enrolled courses...</p>
          </div>
        </div>
      ) : enrolledClasses.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">No Enrolled Courses</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse available courses and enroll to start your learning journey!
            </p>
          </div>
          <Link
            to="/member/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold shadow-md shadow-indigo-500/20 transition"
          >
            <span>Explore Available Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrolled.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-[22px] border border-slate-200/80 p-6 flex flex-col justify-between gap-5 transition hover:shadow-md relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Duration: {cls.courseDuration || "6 Months"}
                  </span>
                  <button
                    onClick={() => handleUnenroll(cls.id)}
                    disabled={unenrollingId === cls.id}
                    title="Unenroll from course"
                    className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {cls.className}
                </h3>
                <p className="text-xs font-bold text-indigo-600">
                  Instructor: <span className="text-slate-800">{cls.instructorName}</span>
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time: <strong>{cls.timing || "09:00 - 10:30 AM"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cls.startDate || "2026-08-01"} to {cls.endDate || "2027-02-01"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  ✓ Active Registration
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Max: {cls.maxCapacity} seats
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
