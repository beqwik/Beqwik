import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  Trash2, 
  MapPin
} from "lucide-react";

interface AcademySectionProps {
  organizationId: string;
  members: any[];
}

interface AcademyClass {
  id: string;
  className: string;
  instructorName: string;
  dayOfWeek: string;
  timing: string;
  room: string;
  maxCapacity: number;
}

export default function AcademySection({ organizationId, members }: AcademySectionProps) {
  // State
  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [classRegistrations, setClassRegistrations] = useState<Record<string, string[]>>({});
  const [showAddClass, setShowAddClass] = useState(false);
  const [className, setClassName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [timing, setTiming] = useState("10:00 - 11:00");
  const [room, setRoom] = useState("Room 101");
  const [maxCapacity, setMaxCapacity] = useState("20");

  const [registeringClassId, setRegisteringClassId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  // Load from localStorage scoped by organization
  useEffect(() => {
    if (!organizationId) return;

    const storedClasses = localStorage.getItem(`academy_classes_${organizationId}`);
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    } else {
      // Default classes
      const defaultClasses: AcademyClass[] = [
        { id: "1", className: "Intermediate Mathematics", instructorName: "Prof. Einstein", dayOfWeek: "Monday", timing: "09:00 - 10:30", room: "Hall A", maxCapacity: 25 },
        { id: "2", className: "Introduction to Physics", instructorName: "Dr. Newton", dayOfWeek: "Wednesday", timing: "11:00 - 12:30", room: "Lab 2", maxCapacity: 20 },
        { id: "3", className: "Creative Writing 101", instructorName: "Ms. Rowling", dayOfWeek: "Friday", timing: "14:00 - 15:30", room: "Room 204", maxCapacity: 15 }
      ];
      setClasses(defaultClasses);
      localStorage.setItem(`academy_classes_${organizationId}`, JSON.stringify(defaultClasses));
    }

    const storedRegistrations = localStorage.getItem(`academy_registrations_${organizationId}`);
    if (storedRegistrations) {
      setClassRegistrations(JSON.parse(storedRegistrations));
    } else {
      setClassRegistrations({});
    }
  }, [organizationId]);

  // Save helpers
  const saveClasses = (updated: AcademyClass[]) => {
    setClasses(updated);
    localStorage.setItem(`academy_classes_${organizationId}`, JSON.stringify(updated));
  };

  const saveRegistrations = (updated: Record<string, string[]>) => {
    setClassRegistrations(updated);
    localStorage.setItem(`academy_registrations_${organizationId}`, JSON.stringify(updated));
  };

  // Add Class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: AcademyClass = {
      id: Date.now().toString(),
      className,
      instructorName,
      dayOfWeek,
      timing,
      room,
      maxCapacity: parseInt(maxCapacity) || 20
    };
    const updated = [...classes, newClass];
    saveClasses(updated);
    setShowAddClass(false);
    setClassName("");
    setInstructorName("");
    setDayOfWeek("Monday");
    setTiming("10:00 - 11:00");
    setRoom("Room 101");
    setMaxCapacity("20");
  };

  // Delete Class
  const handleDeleteClass = (id: string) => {
    if (!confirm("Are you sure you want to cancel this class?")) return;
    const updated = classes.filter((c) => c.id !== id);
    saveClasses(updated);
    const updatedRegs = { ...classRegistrations };
    delete updatedRegs[id];
    saveRegistrations(updatedRegs);
  };

  // Register student
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringClassId || !selectedMemberId) return;

    const currentRegs = classRegistrations[registeringClassId] || [];
    if (currentRegs.includes(selectedMemberId)) {
      alert("This member is already enrolled in this class.");
      return;
    }

    const classObj = classes.find((c) => c.id === registeringClassId);
    if (classObj && currentRegs.length >= classObj.maxCapacity) {
      alert("This class is already full.");
      return;
    }

    const updatedRegs = {
      ...classRegistrations,
      [registeringClassId]: [...currentRegs, selectedMemberId]
    };
    saveRegistrations(updatedRegs);
    setRegisteringClassId(null);
    setSelectedMemberId("");
    alert("Student successfully enrolled in class!");
  };

  // Unenroll student
  const handleUnenrollStudent = (classId: string, memberId: string) => {
    if (!confirm("Are you sure you want to unenroll this student?")) return;
    const current = classRegistrations[classId] || [];
    const updatedRegs = {
      ...classRegistrations,
      [classId]: current.filter((id) => id !== memberId)
    };
    saveRegistrations(updatedRegs);
  };

  // Stats calculations
  const totalStudentsEnrolled = Object.values(classRegistrations).reduce((acc, curr) => acc + curr.length, 0);
  const totalClassCapacity = classes.reduce((acc, curr) => acc + curr.maxCapacity, 0);
  const enrollmentRate = totalClassCapacity > 0 ? Math.round((totalStudentsEnrolled / totalClassCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* STATS HEADER */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Classes</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{classes.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Enrollments</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalStudentsEnrolled}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Fill Rate</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{enrollmentRate}%</h3>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center gap-4">
        <h3 className="font-bold text-slate-800 text-lg">Class Schedules & Course Rosters</h3>
        <button
          onClick={() => setShowAddClass(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Class
        </button>
      </div>

      {/* CLASSES LIST GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const currentEnrolledIds = classRegistrations[cls.id] || [];
          const remainingSpots = cls.maxCapacity - currentEnrolledIds.length;

          return (
            <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                    {cls.dayOfWeek}
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">{cls.className}</h4>
                  <p className="text-slate-500 text-xs mt-1">Instructor: <span className="font-medium text-slate-700">{cls.instructorName}</span></p>
                  
                  <div className="flex items-center gap-4 mt-3 text-slate-550 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {cls.timing}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {cls.room}
                    </span>
                  </div>
                </div>

                {/* ROSTER */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-505 uppercase">
                    <span>Enrolled Students</span>
                    <span>{currentEnrolledIds.length} / {cls.maxCapacity}</span>
                  </div>

                  {currentEnrolledIds.length > 0 ? (
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 border border-slate-50 rounded-lg p-1.5 bg-slate-50/50">
                      {currentEnrolledIds.map((mId) => {
                        const student = members.find((m) => m.id === mId);
                        return (
                          <div key={mId} className="flex justify-between items-center bg-white border border-slate-100 rounded-md px-2 py-1 text-xs">
                            <span className="font-medium text-slate-700 truncate max-w-[150px]">
                              {student?.full_name || "Unknown Student"}
                            </span>
                            <button
                              onClick={() => handleUnenrollStudent(cls.id, mId)}
                              className="text-slate-400 hover:text-red-500 font-bold"
                              title="Unenroll"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50/20 border border-dashed border-slate-200 rounded-lg">
                      No students enrolled yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-4">
                <span className={`text-xs font-bold uppercase ${remainingSpots > 0 ? "text-green-600" : "text-red-500"}`}>
                  {remainingSpots > 0 ? `${remainingSpots} seats left` : "Class Full"}
                </span>
                <button
                  onClick={() => setRegisteringClassId(cls.id)}
                  disabled={remainingSpots <= 0}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Enroll Student
                </button>
              </div>
            </div>
          );
        })}

        {classes.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-450 italic">
            No classes scheduled yet. Click "Create Class" to define one.
          </div>
        )}
      </div>

      {/* CREATE CLASS MODAL */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setShowAddClass(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Class</h3>
            <p className="text-slate-500 text-sm mb-6">Schedule regular classes, workshops, or training sessions.</p>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Chemistry Advanced Level"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Teacher Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Dr. Jane Foster"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class Timings</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., 10:00 - 11:30"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Room 102"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {registeringClassId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setRegisteringClassId(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Enroll Student</h3>
            <p className="text-slate-500 text-sm mb-6">Select a registered member to enroll in this class.</p>

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Member</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisteringClassId(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Confirm Enrollment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );
}
