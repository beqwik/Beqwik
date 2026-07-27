import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Clock,
  Trash2,
  MapPin,
  Loader2,
  GraduationCap,
  Briefcase,
  UserPlus,
  Mail,
  Phone,
  Search
} from "lucide-react";
import {
  getAcademyClasses,
  createAcademyClass,
  deleteAcademyClass,
  getClassRegistrations,
  enrollStudentInClass,
  unenrollStudentFromClass,
  getStudents,
  createStudent,
  deleteStudent,
  getStaffMembers,
  createStaffMember,
  deleteStaffMember,
  type AcademyClass,
  type Student,
  type StaffMember
} from "../../../services/organization/academyService";

interface AcademySectionProps {
  organizationId: string;
  members: any[];
}

export default function AcademySection({ organizationId, members }: AcademySectionProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"classes" | "students" | "staff">("classes");

  // Data states
  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [classRegistrations, setClassRegistrations] = useState<Record<string, string[]>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // UI / Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  // Form states: Create Class
  const [className, setClassName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [timing, setTiming] = useState("10:00 - 11:00");
  const [room, setRoom] = useState("Room 101");
  const [maxCapacity, setMaxCapacity] = useState("20");

  // Form states: Enroll Student
  const [registeringClassId, setRegisteringClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Form states: Add Student
  const [studentFullName, setStudentFullName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCollegeId, setStudentCollegeId] = useState("");
  const [studentRoomNumber, setStudentRoomNumber] = useState("");
  const [studentHostelBlock, setStudentHostelBlock] = useState("");

  // Form states: Add Staff
  const [staffFullName, setStaffFullName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffDesignation, setStaffDesignation] = useState("Teacher");

  // Initial Load from Supabase Database
  useEffect(() => {
    if (!organizationId) return;

    async function fetchAllAcademyData() {
      try {
        setLoading(true);
        const [fetchedClasses, fetchedRegistrations, fetchedStudents, fetchedStaff] = await Promise.all([
          getAcademyClasses(organizationId),
          getClassRegistrations(organizationId),
          getStudents(organizationId),
          getStaffMembers(organizationId)
        ]);
        setClasses(fetchedClasses);
        setClassRegistrations(fetchedRegistrations);
        setStudents(fetchedStudents);
        setStaffMembers(fetchedStaff);
      } catch (err) {
        console.error("Error loading academy data from database:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllAcademyData();
  }, [organizationId]);

  // Combined Student List (Database students + prop members fallback)
  const combinedStudentList = [
    ...students,
    ...members
      .filter((m) =>
        !students.some((s) => s.email === m.email || s.id === m.id) &&
        !staffMembers.some((staff) => staff.email === m.email || staff.id === m.id) &&
        m.role !== "staff" && m.role !== "teacher"
      )
      .map((m) => ({
        id: m.id,
        organization_id: organizationId,
        student_code: m.member_code || `MEM-${m.id.substring(0, 5)}`,
        full_name: m.full_name,
        email: m.email,
        phone: m.phone,
        college_id: "",
        room_number: "",
        hostel_block: "",
        role: "student"
      }))
  ];

  /* =============================================================================
   * HANDLERS: CLASSES & ENROLLMENTS
   * ============================================================================= */

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setSubmitting(true);
      const newClass = await createAcademyClass(organizationId, {
        className,
        instructorName: instructorName || "Unassigned Instructor",
        dayOfWeek,
        timing,
        room,
        maxCapacity: parseInt(maxCapacity) || 20
      });

      setClasses((prev) => [...prev, newClass]);
      setShowAddClass(false);
      setClassName("");
      setInstructorName("");
      setDayOfWeek("Monday");
      setTiming("10:00 - 11:00");
      setRoom("Room 101");
      setMaxCapacity("20");
    } catch (err: any) {
      alert("Failed to create class in database: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this class?")) return;

    try {
      await deleteAcademyClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setClassRegistrations((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err: any) {
      alert("Failed to delete class: " + (err?.message || "Unknown error"));
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringClassId || !selectedStudentId || !organizationId) return;

    const currentRegs = classRegistrations[registeringClassId] || [];
    if (currentRegs.includes(selectedStudentId)) {
      alert("This student is already enrolled in this class.");
      return;
    }

    const classObj = classes.find((c) => c.id === registeringClassId);
    if (classObj && currentRegs.length >= classObj.maxCapacity) {
      alert("This class is already full.");
      return;
    }

    try {
      setSubmitting(true);
      await enrollStudentInClass(organizationId, registeringClassId, selectedStudentId);
      setClassRegistrations((prev) => ({
        ...prev,
        [registeringClassId]: [...(prev[registeringClassId] || []), selectedStudentId]
      }));
      setRegisteringClassId(null);
      setSelectedStudentId("");
      alert("Student successfully enrolled in class!");
    } catch (err: any) {
      alert("Failed to enroll student: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenrollStudent = async (classId: string, studentId: string) => {
    if (!confirm("Are you sure you want to unenroll this student?")) return;

    try {
      await unenrollStudentFromClass(classId, studentId);
      setClassRegistrations((prev) => ({
        ...prev,
        [classId]: (prev[classId] || []).filter((id) => id !== studentId)
      }));
    } catch (err: any) {
      alert("Failed to unenroll student: " + (err?.message || "Unknown error"));
    }
  };

  /* =============================================================================
   * HANDLERS: STUDENTS
   * ============================================================================= */

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setSubmitting(true);
      const newStudent = await createStudent(organizationId, {
        full_name: studentFullName,
        email: studentEmail,
        phone: studentPhone,
        college_id: studentCollegeId,
        room_number: studentRoomNumber,
        hostel_block: studentHostelBlock
      });

      setStudents((prev) => [newStudent, ...prev]);
      setShowAddStudent(false);
      setStudentFullName("");
      setStudentEmail("");
      setStudentPhone("");
      setStudentCollegeId("");
      setStudentRoomNumber("");
      setStudentHostelBlock("");
    } catch (err: any) {
      alert("Failed to create student: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudentAction = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student record?")) return;

    try {
      await deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err: any) {
      alert("Failed to delete student: " + (err?.message || "Unknown error"));
    }
  };

  /* =============================================================================
   * HANDLERS: STAFF
   * ============================================================================= */

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setSubmitting(true);
      const newStaff = await createStaffMember(organizationId, {
        full_name: staffFullName,
        email: staffEmail,
        phone: staffPhone,
        designation: staffDesignation,
        role: "staff"
      });

      setStaffMembers((prev) => [newStaff, ...prev]);
      setShowAddStaff(false);
      setStaffFullName("");
      setStaffEmail("");
      setStaffPhone("");
      setStaffDesignation("Teacher");
    } catch (err: any) {
      alert("Failed to add staff member: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaffAction = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member record?")) return;

    try {
      await deleteStaffMember(staffId);
      setStaffMembers((prev) => prev.filter((s) => s.id !== staffId));
    } catch (err: any) {
      alert("Failed to delete staff member: " + (err?.message || "Unknown error"));
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading academy records from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* NAVIGATION SUB-TABS */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("classes")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "classes"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          <BookOpen className="w-4 h-4" /> Classes & Timetable
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "students"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          <GraduationCap className="w-4 h-4" /> Students Directory ({combinedStudentList.length})
        </button>

        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "staff"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          <Briefcase className="w-4 h-4" /> Teachers & Staff ({staffMembers.length})
        </button>
      </div>

      {/* =========================================================================
       * TAB 1: CLASSES & TIMETABLE
       * ========================================================================= */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Class Schedules & Rosters</h3>
            <button
              onClick={() => setShowAddClass(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>
          </div>

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

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-505 uppercase">
                        <span>Enrolled Students</span>
                        <span>{currentEnrolledIds.length} / {cls.maxCapacity}</span>
                      </div>

                      {currentEnrolledIds.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 border border-slate-50 rounded-lg p-1.5 bg-slate-50/50">
                          {currentEnrolledIds.map((sId) => {
                            const student = combinedStudentList.find((s) => s.id === sId);
                            return (
                              <div key={sId} className="flex justify-between items-center bg-white border border-slate-100 rounded-md px-2 py-1 text-xs">
                                <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                  {student?.full_name || "Enrolled Student"}
                                </span>
                                <button
                                  onClick={() => handleUnenrollStudent(cls.id, sId)}
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
        </div>
      )}

      {/* =========================================================================
       * TAB 2: STUDENTS DIRECTORY
       * ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 text-sm w-full"
              />
            </div>

            <button
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Student
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Student Code</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">College / Room</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedStudentList
                  .filter((s) =>
                    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.student_code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600">
                        {std.student_code}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {std.full_name}
                      </td>
                      <td className="px-6 py-4 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {std.email}
                        </div>
                        {std.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {std.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {std.college_id || std.room_number ? (
                          <div>
                            {std.college_id && <p>ID: {std.college_id}</p>}
                            {std.room_number && <p>Room: {std.room_number} {std.hostel_block && `(${std.hostel_block})`}</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStudentAction(std.id)}
                          className="text-slate-400 hover:text-red-500 p-1 font-bold text-xs"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                {combinedStudentList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      No students found. Click "Add Student" to create your first student record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: TEACHERS & STAFF DIRECTORY
       * ========================================================================= */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h3 className="font-bold text-slate-800 text-lg">Academic Staff & Instructors</h3>
            <button
              onClick={() => setShowAddStaff(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Staff / Teacher
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffMembers.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {stf.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                        {stf.designation || "Instructor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {stf.email}
                      </div>
                      {stf.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {stf.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${stf.active !== false ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {stf.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteStaffAction(stf.id)}
                        className="text-slate-400 hover:text-red-500 p-1 font-bold text-xs"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {staffMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      No staff members found. Click "Add Staff / Teacher" to add instructors.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 1: CREATE CLASS
       * ========================================================================= */}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Teacher</label>
                {staffMembers.length > 0 ? (
                  <select
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- Select Registered Staff --</option>
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.full_name}>
                        {s.full_name} ({s.designation || "Staff"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="E.g., Dr. Jane Foster"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
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
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 2: ENROLL STUDENT IN CLASS
       * ========================================================================= */}
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
            <p className="text-slate-500 text-sm mb-6">Select a student to enroll in this class.</p>

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Choose Student --</option>
                  {combinedStudentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_code}) - {s.email}
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
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 3: ADD STUDENT
       * ========================================================================= */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setShowAddStudent(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New Student</h3>
            <p className="text-slate-500 text-sm mb-6">Create a student record in your database.</p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Alex Johnson"
                  value={studentFullName}
                  onChange={(e) => setStudentFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.johnson@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College ID</label>
                  <input
                    type="text"
                    placeholder="E.g., COL-992"
                    value={studentCollegeId}
                    onChange={(e) => setStudentCollegeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="E.g., 302"
                    value={studentRoomNumber}
                    onChange={(e) => setStudentRoomNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Block</label>
                  <input
                    type="text"
                    placeholder="E.g., Block B"
                    value={studentHostelBlock}
                    onChange={(e) => setStudentHostelBlock(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 4: ADD STAFF / TEACHER
       * ========================================================================= */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setShowAddStaff(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Add Staff / Teacher</h3>
            <p className="text-slate-500 text-sm mb-6">Create a teacher or staff member record.</p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Prof. Sarah Conner"
                  value={staffFullName}
                  onChange={(e) => setStaffFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.conner@academy.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0188"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Math Professor"
                    value={staffDesignation}
                    onChange={(e) => setStaffDesignation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
