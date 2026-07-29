import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getActiveSubscription } from "../../services/member/memberSubscriptionService";
import { getUnreadCount } from "../../services/member/memberNotificationService";
import {
  getGymSlots,
  getGymBookings,
  getGymEquipment,
  bookGymSlot,
  cancelGymBooking,
} from "../../services/organization/gymService";
import {
  checkIsStaffMember,
  getAcademyClasses,
  getClassRegistrations,
  getAssignmentsList,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getTestResults,
  createTestResult,
  updateTestResult,
  deleteTestResult,
  getStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getAnnouncementsList,
  createAnnouncement,
  type AssignmentItem,
  type TestResultItem,
  type StudyMaterialItem,
  type AnnouncementItem
} from "../../services/organization/academyService";
import { 
  Calendar, Users, QrCode, Sparkles, LogIn, LogOut, CheckCircle2,
  Dumbbell, AlertTriangle, Wrench, FileText, Award, FolderDown, Plus, Pencil, Trash2
} from "lucide-react";

import CreateAssignmentModal from "../../components/admin/sections/academy/modals/CreateAssignmentModal";
import UploadResultModal from "../../components/admin/sections/academy/modals/UploadResultModal";
import CreateStudyMaterialModal from "../../components/admin/sections/academy/modals/CreateStudyMaterialModal";
import CreateAnnouncementModal from "../../components/admin/sections/academy/modals/CreateAnnouncementModal";

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MemberDashboard() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [subscription, setSubscription] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Gym Interactive States
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Record<string, string[]>>({});
  const [gymEquipment, setGymEquipment] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Academy States
  const [academyClasses, setAcademyClasses] = useState<any[]>([]);
  const [academyRegs, setAcademyRegs] = useState<Record<string, string[]>>({});
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Modals for Staff Dashboard
  const [activeModal, setActiveModal] = useState<"assignment" | "result" | "material" | "notice" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!member?.id) { setLoading(false); return; }
      try {
        const [sub, count] = await Promise.all([
          getActiveSubscription(member.id),
          getUnreadCount(member.id),
        ]);
        setSubscription(sub);
        setUnreadCount(count);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [member?.id]);

  // Fetch gym slots, bookings, and equipment
  const fetchGymData = useCallback(async () => {
    if (!org?.id) return;
    try {
      const [fetchedSlots, fetchedBookings, fetchedEquipment] = await Promise.all([
        getGymSlots(org.id),
        getGymBookings(org.id),
        getGymEquipment(org.id),
      ]);
      setSlots(fetchedSlots);
      setBookings(fetchedBookings);
      setGymEquipment(fetchedEquipment);
    } catch (e) {
      console.error("Failed to load gym data:", e);
    }
  }, [org?.id]);

  useEffect(() => {
    if (org?.organization_type === "Gym") {
      fetchGymData();
    }
  }, [org?.organization_type, fetchGymData]);

  // Fetch Academy Data (Classes, Assignments, Results, Materials)
  useEffect(() => {
    async function fetchAcademyData() {
      if (!org?.id || org?.organization_type !== "Academy") return;
      try {
        const [classes, regs, asgs, res, mats, notices] = await Promise.all([
          getAcademyClasses(org.id),
          getClassRegistrations(org.id),
          getAssignmentsList(org.id),
          getTestResults(org.id),
          getStudyMaterials(org.id),
          getAnnouncementsList(org.id)
        ]);
        setAcademyClasses(classes);
        setAcademyRegs(regs);
        setAssignments(asgs);
        setTestResults(res);
        setStudyMaterials(mats);
        setAnnouncements(notices);
      } catch (e) {
        console.error("Failed to load academy data:", e);
      }
    }
    fetchAcademyData();
  }, [org?.id, org?.organization_type]);

  const [isStaff, setIsStaff] = useState<boolean>(() => {
    const role = member?.role?.toLowerCase() || "";
    const email = member?.email?.toLowerCase() || "";
    const name = member?.full_name?.toLowerCase() || "";
    return (
      role === "staff" ||
      role === "teacher" ||
      Boolean(member?.designation) ||
      email.includes("staff") ||
      email.includes("teacher") ||
      name.includes("staff") ||
      name.includes("teacher")
    );
  });

  useEffect(() => {
    async function verifyStaff() {
      if (org?.id && member?.email) {
        const verified = await checkIsStaffMember(org.id, member.email);
        if (verified) setIsStaff(true);
      }
    }
    verifyStaff();
  }, [org?.id, member?.email]);
  const daysLeft = subscription?.end_date ? getDaysRemaining(subscription.end_date) : null;
  const planName = subscription?.subscription_plans?.name || subscription?.plan_name || null;

  const getStatusColor = () => {
    if (!daysLeft && daysLeft !== 0) return "bg-slate-100 text-slate-500";
    if (daysLeft <= 3) return "bg-red-100 text-red-650";
    if (daysLeft <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  };

  const getStatusLabel = () => {
    if (!subscription) return "No Active Plan";
    if (daysLeft === 0) return "Expired Today";
    if (daysLeft !== null && daysLeft <= 3) return `Expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}!`;
    return "Active";
  };

  const handleCheckIn = () => {
    if (checkedIn) {
      setCheckedIn(false);
      setCheckInTime(null);
    } else {
      setCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = member?.full_name?.split(" ")[0] || (isStaff ? "Teacher" : "Student");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── RENDERING STAFF PORTAL ────────────────────────────────────────────────
  const renderStaffPortal = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, {firstName} 👨‍🏫
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Faculty & Teaching Staff Dashboard at <span className="font-bold text-indigo-600">{org?.name || "the Academy"}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setEditingItem(null); setActiveModal("assignment"); }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Homework
            </button>

            <button
              onClick={() => { setEditingItem(null); setActiveModal("result"); }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload Results
            </button>

            <button
              onClick={() => { setEditingItem(null); setActiveModal("material"); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Notes
            </button>
          </div>
        </div>

        {/* Top Summary Widgets */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">📚</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold">Active</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Classes</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{academyClasses.length}</h2>
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">📝</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-extrabold">{assignments.length} Total</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Homework Published</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{assignments.length}</h2>
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">🏆</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold">{testResults.length} Scorecards</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Exam Results Uploaded</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{testResults.length}</h2>
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">📂</span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-extrabold">{studyMaterials.length} Files</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Study Notes Uploaded</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{studyMaterials.length}</h2>
            </div>
          </div>
        </div>

        {/* Section 1: Recent Homework Assignments */}
        <div className="bg-white rounded-[20px] border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Faculty Homework & Assignments
              </h3>
              <p className="text-slate-500 text-xs font-medium">Manage assignments published to student portal</p>
            </div>
            <button
              onClick={() => { setEditingItem(null); setActiveModal("assignment"); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              + Create New
            </button>
          </div>

          {assignments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-slate-50 p-4 rounded-[16px] border border-slate-200/80 space-y-2 relative group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-indigo-600">{asg.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${asg.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {asg.status}
                      </span>
                      <button
                        onClick={() => { setEditingItem(asg); setActiveModal("assignment"); }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          await deleteAssignment(asg.id, org?.id);
                          setAssignments(prev => prev.filter(a => a.id !== asg.id));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{asg.title}</h4>
                  <p className="text-slate-500 text-xs font-semibold">Class: {asg.class_name}</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                    <span>Due: {asg.due_date}</span>
                    <span className="font-bold text-slate-800">{asg.submissions_count} / {asg.total_students} Done</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-400 text-center py-6">No homework assignments created yet.</p>
          )}
        </div>

        {/* Section 2: Student Exam Results */}
        <div className="bg-white rounded-[20px] border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Student Gradebook & Exam Scorecards
              </h3>
              <p className="text-slate-500 text-xs font-medium">Record and update student marks</p>
            </div>
            <button
              onClick={() => { setEditingItem(null); setActiveModal("result"); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              + Upload Result
            </button>
          </div>

          {testResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Exam Title</th>
                    <th className="px-4 py-3">Marks Score</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {testResults.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-4 py-3 font-extrabold text-slate-900">{res.student_name}</td>
                      <td className="px-4 py-3 text-slate-600 font-semibold">{res.exam_title}</td>
                      <td className="px-4 py-3 font-black text-slate-900">{res.score} / {res.total_marks}</td>
                      <td className="px-4 py-3 font-black text-indigo-600">{res.percentage}% ({res.grade})</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${res.status === "Passed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => { setEditingItem(res); setActiveModal("result"); }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              await deleteTestResult(res.id, org?.id);
                              setTestResults(prev => prev.filter(r => r.id !== res.id));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-400 text-center py-6">No student exam scorecards recorded yet.</p>
          )}
        </div>

        {/* Staff Modals */}
        <CreateAssignmentModal
          isOpen={activeModal === "assignment"}
          onClose={() => setActiveModal(null)}
          initialData={editingItem}
          onSubmit={async (data) => {
            if (!org?.id) return;
            if (editingItem) {
              await updateAssignment(org.id, editingItem.id, data);
              setAssignments(prev => prev.map(a => a.id === editingItem.id ? { ...a, ...data } : a));
            } else {
              const created = await createAssignment(org.id, data);
              setAssignments(prev => [created, ...prev]);
            }
          }}
        />

        <UploadResultModal
          isOpen={activeModal === "result"}
          onClose={() => setActiveModal(null)}
          initialData={editingItem}
          onSubmit={async (data) => {
            if (!org?.id) return;
            if (editingItem) {
              await updateTestResult(org.id, editingItem.id, data);
              setTestResults(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...data } : r));
            } else {
              const created = await createTestResult(org.id, data);
              setTestResults(prev => [created, ...prev]);
            }
          }}
        />

        <CreateStudyMaterialModal
          isOpen={activeModal === "material"}
          onClose={() => setActiveModal(null)}
          initialData={editingItem}
          onSubmit={async (data) => {
            if (!org?.id) return;
            if (editingItem) {
              await updateStudyMaterial(org.id, editingItem.id, data);
              setStudyMaterials(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...data } : m));
            } else {
              const created = await createStudyMaterial(org.id, data);
              setStudyMaterials(prev => [created, ...prev]);
            }
          }}
        />
      </div>
    );
  };

  // ─── RENDERING ACADEMY STUDENT PORTAL ──────────────────────────────────────
  const renderAcademyPortal = () => {
    const studentId = member?.id || "";
    const enrolledList = academyClasses.filter((cls) => {
      const classRegs = academyRegs[cls.id] || [];
      return classRegs.includes(studentId);
    });

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Welcome to your student learning dashboard at <span className="font-bold text-indigo-600">{org?.name || "the Academy"}</span>.
            </p>
          </div>
        </div>

        {/* Top Summary Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: My Enrolled Courses */}
          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">🎓</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold">
                {enrolledList.length} Active
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enrolled Courses</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{enrolledList.length}</h2>
            </div>
            <Link
              to="/member/my-courses"
              className="mt-4 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              View My Courses →
            </Link>
          </div>

          {/* Card 2: Explore Available Courses */}
          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">📚</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-extrabold">
                {academyClasses.length} Total
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Courses</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{academyClasses.length}</h2>
            </div>
            <Link
              to="/member/courses"
              className="mt-4 text-xs font-extrabold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
            >
              Explore All Courses →
            </Link>
          </div>

          {/* Card 3: Notifications */}
          <div className="bg-white rounded-[22px] border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Unread Notice Alerts</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{unreadCount}</h2>
            </div>
            <Link
              to="/member/notifications"
              className="mt-4 text-xs font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
            >
              View Notice Board →
            </Link>
          </div>
        </div>

        {/* Quick Portal Modules */}
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Student Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/member/courses", icon: "🔍", label: "Explore Courses", sub: "Browse active academy courses" },
              { to: "/member/my-courses", icon: "🎓", label: "My Courses", sub: `${enrolledList.length} enrolled classes` },
              { to: "/member/notifications", icon: "🔔", label: "Notice Board", sub: `${unreadCount} unread notices` },
              { to: "/member/profile", icon: "👤", label: "My Profile", sub: "View & update profile info" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="bg-white rounded-2xl border border-slate-150 p-5 hover:shadow-md hover:border-indigo-200 transition group text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-bold text-slate-900 mt-3 text-sm group-hover:text-indigo-600 transition">
                  {item.label}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDERING CUSTOM INTERACTIVE GYM PORTAL ────────────────────────────────
  const renderGymPortal = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, {firstName} <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Ready to crush your goals today at <span className="font-bold text-blue-600">{org?.name || "the Gym"}</span>?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
              Plan: {planName || "Trial"} ({getStatusLabel()})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white rounded-[2rem] border border-slate-150 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-50 rounded-full -z-0 opacity-50" />
            
            <div className="relative z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Touchless Check-In
              </span>
              <h3 className="text-lg font-bold text-slate-800">Membership Pass</h3>

              <div className="my-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <QrCode className="w-32 h-32 text-slate-800" />
                <span className="text-[10px] font-mono text-slate-400 mt-2">MEMBER-{member?.id?.slice(0, 8).toUpperCase() || "ID"}</span>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                checkedIn
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
              }`}
            >
              {checkedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Checked In at {checkInTime} (Leave)</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Scan / Simulated Check-In</span>
                </>
              )}
            </button>
          </div>

          {subscription ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-750 rounded-[2rem] p-8 text-white shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Active Subscription</p>
                <h2 className="text-3xl font-black mt-2">{planName || "Membership Plan"}</h2>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <p className="text-blue-200 text-xs font-semibold">Start Date</p>
                    <p className="font-extrabold text-base mt-1">{subscription.start_date ? formatDate(subscription.start_date) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-semibold">End Date</p>
                    <p className="font-extrabold text-base mt-1">{subscription.end_date ? formatDate(subscription.end_date) : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-3">💳</div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">No Active Subscription</h3>
              <p className="text-slate-400 text-xs max-w-xs mb-4">View plans created by gym administration to purchase and activate your membership.</p>
              <Link
                to="/member/subscription"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 flex items-center gap-1.5"
              >
                View & Purchase Membership Plans →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── RENDERING DEFAULT PORTAL ───────────────────────────────────────────────
  const renderDefaultPortal = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's a summary of your membership at <span className="font-medium text-slate-700">{org?.name || "your organization"}</span>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <p className="text-slate-500 text-sm">Current Plan</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {planName || "No Plan"}
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <p className="text-slate-500 text-sm">Unread Notifications</p>
            <h2 className="text-4xl font-bold text-slate-900 mt-1">{unreadCount}</h2>
          </div>
        </div>
      </div>
    );
  };

  return org?.organization_type === "Gym"
    ? renderGymPortal()
    : org?.organization_type === "Academy"
    ? isStaff
      ? renderStaffPortal()
      : renderAcademyPortal()
    : renderDefaultPortal();
}
