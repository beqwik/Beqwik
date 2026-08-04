import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getActiveSubscription } from "../../services/member/memberSubscriptionService";
import { getUnreadCount } from "../../services/member/memberNotificationService";
import {
  getGymSlots,
  getGymBookings,
  getGymEquipment,
  getTrainers,
  bookGymSlot,
  cancelGymBooking,
  type Trainer,
} from "../../services/organization/gymService";
import { getGymAnnouncements, type GymAnnouncement } from "../../services/organization/gymAnnouncementsService";
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
  Dumbbell, AlertTriangle, Wrench, FileText, Award, FolderDown, Plus, Pencil, Trash2,
  UserCheck, Megaphone, Droplets, Flame, Target
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
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [gymAnnouncements, setGymAnnouncements] = useState<GymAnnouncement[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Academy States
  const [academyClasses, setAcademyClasses] = useState<any[]>([]);
  const [academyRegs, setAcademyRegs] = useState<Record<string, string[]>>({});
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [studentRecord, setStudentRecord] = useState<any>(null);
  const [staffRecord, setStaffRecord] = useState<any>(null);

  // Modals for Staff Dashboard
  const [activeModal, setActiveModal] = useState<"assignment" | "result" | "material" | "notice" | "announcement" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Daily Goals State (persisted per day per member)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayKey = `daily_goals_${member?.id || "guest"}_${todayStr}`;
  const [dailyGoals, setDailyGoals] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : { pushups: false, water: false, plank: false };
    } catch {
      return { pushups: false, water: false, plank: false };
    }
  });

  const toggleGoal = (goalKey: string) => {
    setDailyGoals((prev) => {
      const updated = { ...prev, [goalKey]: !prev[goalKey] };
      try {
        localStorage.setItem(todayKey, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

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
      const [fetchedSlots, fetchedBookings, fetchedEquipment, fetchedTrainers, fetchedAnnouncements] = await Promise.all([
        getGymSlots(org.id),
        getGymBookings(org.id),
        getGymEquipment(org.id),
        getTrainers(org.id),
        getGymAnnouncements(org.id),
      ]);
      setSlots(fetchedSlots);
      setBookings(fetchedBookings);
      setGymEquipment(fetchedEquipment);
      setTrainers(fetchedTrainers);
      setGymAnnouncements(fetchedAnnouncements);
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
      if (!org?.id) return;
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
    async function verifyStaffAndFetchRecords() {
      if (org?.id && member?.email) {
        const verified = await checkIsStaffMember(org.id, member.email);
        if (verified) setIsStaff(true);

        // Fetch student record if student
        const { data: stdData } = await supabase
          .from("academy_students")
          .select("*")
          .eq("organization_id", org.id)
          .ilike("email", member.email.trim())
          .maybeSingle();

        if (stdData) setStudentRecord(stdData);

        // Fetch staff record if staff
        const { data: stfData } = await supabase
          .from("academy_staff")
          .select("*")
          .eq("organization_id", org.id)
          .ilike("email", member.email.trim())
          .maybeSingle();

        if (stfData) setStaffRecord(stfData);
      }
    }
    verifyStaffAndFetchRecords();
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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {greeting}, {firstName} 👨‍🏫
              </h1>
              {(staffRecord?.staff_code || member?.staff_code) && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 font-mono font-bold text-xs rounded-full shadow-sm">
                  Staff ID: {staffRecord?.staff_code || member?.staff_code}
                </span>
              )}
            </div>
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

            <button
              onClick={() => { setEditingItem(null); setActiveModal("announcement"); }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" /> Post Announcement
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

        {/* Section 3: Notice Board & Announcements */}
        <div className="bg-white rounded-[20px] border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" /> Notice Board & Announcements
              </h3>
              <p className="text-slate-500 text-xs font-medium">Broadcast notices and announcements to students and teachers</p>
            </div>
            <button
              onClick={() => { setEditingItem(null); setActiveModal("announcement"); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
            >
              + Post Announcement
            </button>
          </div>

          {announcements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((anc) => (
                <div key={anc.id} className="bg-slate-50 p-4 rounded-[16px] border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-full font-black text-[9px] uppercase bg-indigo-100 text-indigo-700">
                      Target: {anc.target_audience || "All"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{anc.created_at}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{anc.title}</h4>
                  <p className="text-slate-600 text-xs font-medium line-clamp-3">{anc.content}</p>
                  <p className="text-[10px] text-slate-400 font-bold pt-1 border-t border-slate-200/60">Posted by: {anc.author || "Admin"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-400 text-center py-6">No announcements published yet.</p>
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

        <CreateAnnouncementModal
          isOpen={activeModal === "announcement"}
          onClose={() => setActiveModal(null)}
          onSubmit={async (data) => {
            if (!org?.id) return;
            const created = await createAnnouncement(org.id, {
              ...data,
              author: member?.full_name || "Faculty Staff"
            });
            setAnnouncements(prev => [created, ...prev]);
            setActiveModal(null);
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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {greeting}, {firstName} 👋
              </h1>
              {(studentRecord?.student_code || member?.student_code) && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono font-bold text-xs rounded-full shadow-sm">
                  Student ID: {studentRecord?.student_code || member?.student_code}
                </span>
              )}
            </div>
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
              { to: "/student/attendance", icon: "📅", label: "My Attendance", sub: "View monthly attendance records" },
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
          {/* DAILY FITNESS GOALS CARD */}
          <div className="bg-white rounded-[2rem] border border-slate-150 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-50 rounded-full -z-0 opacity-60" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Today's Targets
                  </span>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    Daily Fitness Goals <Target className="w-5 h-5 text-emerald-600" />
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  Object.values(dailyGoals).filter(Boolean).length === 3
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-100"
                }`}>
                  {Object.values(dailyGoals).filter(Boolean).length} / 3 Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 mb-5">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.round((Object.values(dailyGoals).filter(Boolean).length / 3) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Interactive Goals List */}
              <div className="space-y-3">
                {/* 1. 30 Pushups */}
                <button
                  type="button"
                  onClick={() => toggleGoal("pushups")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    dailyGoals.pushups
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      dailyGoals.pushups ? "bg-emerald-500 text-white" : "bg-orange-100 text-orange-600"
                    }`}>
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-black ${dailyGoals.pushups ? "line-through text-emerald-800 opacity-80" : "text-slate-900"}`}>
                        30 Pushups
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">Upper body strength & endurance</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    dailyGoals.pushups
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}>
                    {dailyGoals.pushups && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>

                {/* 2. 4L Water Intake */}
                <button
                  type="button"
                  onClick={() => toggleGoal("water")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    dailyGoals.water
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      dailyGoals.water ? "bg-emerald-500 text-white" : "bg-sky-100 text-sky-600"
                    }`}>
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-black ${dailyGoals.water ? "line-through text-emerald-800 opacity-80" : "text-slate-900"}`}>
                        4L Water Intake
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">Hydration target for peak performance</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    dailyGoals.water
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}>
                    {dailyGoals.water && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>

                {/* 3. 2 Min Planks Hold */}
                <button
                  type="button"
                  onClick={() => toggleGoal("plank")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    dailyGoals.plank
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      dailyGoals.plank ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-600"
                    }`}>
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-black ${dailyGoals.plank ? "line-through text-emerald-800 opacity-80" : "text-slate-900"}`}>
                        2 Min Planks Hold
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">Core stability & posture strength</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    dailyGoals.plank
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}>
                    {dailyGoals.plank && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              </div>
            </div>
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

        {/* Slot Booking Section */}
        <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_10px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Training Session Reservation
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                Book your training sessions. Slots are managed dynamically by gym administration.
              </p>
            </div>
          </div>

          <div className="p-6">
            {slots.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                No training slots scheduled by administration yet.
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${bookingLoading ? "opacity-60 pointer-events-none" : ""}`}>
                {slots.map((slot: any) => {
                  const enrolledIds = bookings[slot.id] || [];
                  const currentBookedCount = enrolledIds.length;
                  const isBooked = enrolledIds.includes(member?.id || "");
                  const vacancy = slot.max_capacity - currentBookedCount;

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition duration-200 relative overflow-hidden ${
                        isBooked
                          ? "border-blue-300 bg-blue-50/30 ring-2 ring-blue-600/10"
                          : vacancy <= 0
                          ? "border-amber-200 bg-amber-50/10 opacity-90"
                          : "border-slate-150 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slot.day_of_week}</span>
                          {isBooked ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
                          ) : vacancy <= 0 ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-500 text-white rounded-md">
                              FULL
                            </span>
                          ) : null}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-2">Trainer: {slot.trainer_name}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Time: {slot.start_time} - {slot.end_time}</p>
                      </div>

                      <div>
                        {/* Capacity meter */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                          <div 
                            className={`h-full transition-all ${vacancy <= 0 ? "bg-red-500" : "bg-blue-600"}`}
                            style={{ width: `${Math.min(100, Math.round((currentBookedCount / slot.max_capacity) * 100))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100/80 pt-3">
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {currentBookedCount} / {slot.max_capacity} Enrolled
                          </span>
                          <button
                            onClick={() => handleReserveSlot(slot.id)}
                            disabled={bookingLoading || (!isBooked && vacancy <= 0)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isBooked
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : vacancy <= 0
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            }`}
                          >
                            {bookingLoading ? "..." : isBooked ? "Cancel" : vacancy <= 0 ? "Class Full" : "Reserve Slot"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Equipment Status Section */}
        {gymEquipment.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_10px_30px_rgba(0,0,0,0.015)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Equipment Status</h3>
                <p className="text-sm text-slate-400 font-medium mt-0.5">Live status of gym machines and equipment.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gymEquipment.map((eq: any) => (
                  <div key={eq.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      eq.status === "Working"
                        ? "bg-emerald-50 text-emerald-600"
                        : eq.status === "Under Maintenance"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-500"
                    }`}>
                      {eq.status === "Working" ? (
                        <Dumbbell className="w-5 h-5" />
                      ) : eq.status === "Under Maintenance" ? (
                        <Wrench className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{eq.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{eq.category}</p>
                    </div>
                    <span className={`ml-auto flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      eq.status === "Working"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : eq.status === "Under Maintenance"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {eq.status === "Working" ? "✓ Working" : eq.status === "Under Maintenance" ? "Maintenance" : "✕ Broken"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TRAINERS SECTION ── */}
        <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_10px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Our Trainers</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Meet the certified fitness coaches at {org?.name || "your gym"}.</p>
            </div>
          </div>
          <div className="p-6">
            {trainers.filter(t => t.status === "Active").length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                No active trainers listed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainers.filter(t => t.status === "Active").map((trainer) => (
                  <div key={trainer.id} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 hover:border-blue-200 hover:bg-blue-50/10 transition">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {trainer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{trainer.full_name}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5 truncate">{trainer.specialization}</p>
                      {trainer.bio && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{trainer.bio}</p>
                      )}
                      {trainer.phone && (
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">📞 {trainer.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── GYM ANNOUNCEMENTS SECTION ── */}
        {gymAnnouncements.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_10px_30px_rgba(0,0,0,0.015)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-[#e05275]" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Gym Announcements</h3>
                <p className="text-sm text-slate-400 font-medium mt-0.5">Latest notices and updates from gym management.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {gymAnnouncements.slice(0, 5).map((anc) => {
                const priorityStyle =
                  anc.priority === "urgent" ? "bg-rose-100 text-rose-700 border-rose-200" :
                  anc.priority === "high"   ? "bg-amber-100 text-amber-700 border-amber-200" :
                                              "bg-blue-50 text-blue-700 border-blue-100";
                const dot =
                  anc.priority === "urgent" ? "bg-rose-500" :
                  anc.priority === "high"   ? "bg-amber-500" : "bg-blue-500";
                return (
                  <div key={anc.id} className="px-6 py-4 flex gap-4 items-start hover:bg-slate-50/50 transition">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${priorityStyle}`}>
                          {anc.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(anc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{anc.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{anc.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Navigation Cards */}
        <div>
          <h3 className="font-bold text-slate-800 text-lg mb-4">Portal Modules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: "/member/subscription", icon: "💳", label: "Membership details", sub: "View active plan" },
              { to: "/member/notifications", icon: "🔔", label: "Notifications", sub: `${unreadCount} unread` },
              { to: "/member/profile", icon: "👤", label: "My Profile", sub: "Update login details" },
              { to: "/member/dashboard", icon: "🏋️‍♂️", label: "Dashboard Overview", sub: "Interactive pass & booking" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="bg-white rounded-2xl border border-slate-150 p-5 hover:shadow-md hover:border-blue-200 transition group text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-bold text-slate-800 mt-3 text-sm group-hover:text-blue-600 transition">
                  {item.label}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
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

  const isAcademyOrg =
    org?.organization_type === "Academy" ||
    Boolean(studentRecord) ||
    Boolean(staffRecord) ||
    isStaff;

  return isStaff
    ? renderStaffPortal()
    : isAcademyOrg
    ? renderAcademyPortal()
    : org?.organization_type === "Gym"
    ? renderGymPortal()
    : renderDefaultPortal();
}
