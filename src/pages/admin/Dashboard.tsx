import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { registerMember } from "../../services/member/memberAuth";
import { dashboardService } from "../../services/dashboard/dashboardService";
import { useDashboard } from "../../hooks/useDashboard";
import GymSection from "../../components/admin/sections/GymSection";
import HostelMessSection from "../../components/admin/sections/HostelMessSection";
import AcademySection from "../../components/admin/sections/AcademySection";
import OverviewTab from "../../components/admin/dashboard/OverviewTab";
import MembersTab from "../../components/admin/dashboard/MembersTab";
import SubscriptionTab from "../../components/admin/dashboard/SubscriptionTab";
import NotificationTab from "../../components/admin/dashboard/NotificationTab";
import SettingsTab from "../../components/admin/dashboard/SettingsTab";
import AddMemberModal from "../../components/admin/dashboard/modals/AddMemberModal";
import GrantSubscriptionModal from "../../components/admin/dashboard/modals/GrantSubscriptionModal";

// Import 14 EduLMS Modules
import OverviewModule from "../../components/admin/sections/academy/OverviewModule";
import StudentsModule from "../../components/admin/sections/academy/StudentsModule";
import TeachersModule from "../../components/admin/sections/academy/TeachersModule";
import CoursesModule from "../../components/admin/sections/academy/CoursesModule";
import TimetableModule from "../../components/admin/sections/academy/TimetableModule";
import AssignmentsModule from "../../components/admin/sections/academy/AssignmentsModule";
import AttendanceModule from "../../components/admin/sections/academy/AttendanceModule";
import TestsModule from "../../components/admin/sections/academy/TestsModule";
import ResultsModule from "../../components/admin/sections/academy/ResultsModule";
import FeesModule from "../../components/admin/sections/academy/FeesModule";
import StudyMaterialModule from "../../components/admin/sections/academy/StudyMaterialModule";
import ReportsModule from "../../components/admin/sections/academy/ReportsModule";
import AnnouncementsModule from "../../components/admin/sections/academy/AnnouncementsModule";
import SettingsModule from "../../components/admin/sections/academy/SettingsModule";

import {
  getStudents,
  deleteStudent,
  getStaffMembers,
  deleteStaffMember,
  getAcademyClasses,
  createAcademyClass,
  deleteAcademyClass,
  getClassRegistrations,
  getTestExams,
  createTestExam,
  getTestResults,
  getFeeReminders,
  triggerBatchFeeReminders,
  getTimetableSlots,
  getAssignmentsList,
  getStudyMaterials,
  getAnnouncementsList,
  type AcademyClass,
  type Student,
  type StaffMember,
  type TestEngineExam,
  type TestResultItem,
  type FeeReminderItem,
  type TimetableSlot,
  type AssignmentItem,
  type StudyMaterialItem,
  type AnnouncementItem
} from "../../services/organization/academyService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Data states
  const {
    loading,
    organization,
    organizationSubscription: orgSubscription,
    members,
    subscriptions: memberSubscriptions,
    notifications: recentNotifications,
    reloadDashboard,
  } = useDashboard();

  // Modal / Form states
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"student" | "staff">("student");
  const [addingMember, setAddingMember] = useState(false);

  const [showAddSub, setShowAddSub] = useState(false);
  const [subMemberId, setSubMemberId] = useState("");
  const [subPlanName, setSubPlanName] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subDurationMonths, setSubDurationMonths] = useState("1");
  const [subPaymentMethod, setSubPaymentMethod] = useState("manual");
  const [addingSub, setAddingSub] = useState(false);

  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  // Settings Edit states
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // EduLMS States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<StaffMember[]>([]);
  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [classRegistrations, setClassRegistrations] = useState<Record<string, string[]>>({});
  const [tests, setTests] = useState<TestEngineExam[]>([]);
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [feeReminders, setFeeReminders] = useState<FeeReminderItem[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Add Course Form State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseDay, setCourseDay] = useState("Mon & Wed");
  const [courseTiming, setCourseTiming] = useState("09:00 - 10:30 AM");
  const [courseRoom, setCourseRoom] = useState("Lab 1");
  const [courseMaxCap, setCourseMaxCap] = useState("30");

  useEffect(() => {
    if (!organization) return;

    setEditName(organization.organization_name || "");
    setEditType(organization.organization_type || "");
    setEditEmail(organization.email || "");
    setEditPhone(organization.phone || "");
    setEditAddress(organization.address || "");

    // Fetch EduLMS data
    async function loadEduLMS() {
      if (!organization?.id) return;
      try {
        const [
          stus,
          teachs,
          clss,
          regs,
          tsts,
          res,
          fees,
          tt,
          asgs,
          mats,
          ancs
        ] = await Promise.all([
          getStudents(organization.id),
          getStaffMembers(organization.id),
          getAcademyClasses(organization.id),
          getClassRegistrations(organization.id),
          getTestExams(organization.id),
          getTestResults(organization.id),
          getFeeReminders(organization.id),
          getTimetableSlots(organization.id),
          getAssignmentsList(organization.id),
          getStudyMaterials(organization.id),
          getAnnouncementsList(organization.id)
        ]);

        setStudents(stus);
        setTeachers(teachs);
        setClasses(clss);
        setClassRegistrations(regs);
        setTests(tsts);
        setResults(res);
        setFeeReminders(fees);
        setTimetableSlots(tt);
        setAssignments(asgs);
        setMaterials(mats);
        setAnnouncements(ancs);
      } catch (err) {
        console.error("EduLMS load error:", err);
      }
    }

    loadEduLMS();
  }, [organization]);

  // Search filtering
  const [memberSearch, setMemberSearch] = useState("");

  // Format Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    try {
      setAddingMember(true);
      const res = await registerMember({
        organizationCode: organization.organization_code,
        fullName: newMemberName,
        email: newMemberEmail,
        phone: newMemberPhone,
        password: newMemberPassword,
        role: newMemberRole,
      });

      if (res.success) {
        alert(`Member successfully registered as ${newMemberRole === "staff" ? "Staff / Teacher" : "Student"}!`);
        setShowAddMember(false);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberPhone("");
        setNewMemberPassword("");
        setNewMemberRole("student");
        reloadDashboard();
      } else {
        alert("Registration failed: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setAddingMember(false);
    }
  };

  const handleToggleMember = async (memberId: string, currentActive: boolean) => {
    try {
      const confirmAction = confirm(
        `Are you sure you want to ${
          currentActive ? "deactivate" : "activate"
        } this member?`
      );
      if (!confirmAction) return;

      const { error } = await supabase
        .from("members")
        .update({
          active: !currentActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memberId);

      if (error) throw error;
      reloadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle member status");
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !subMemberId) return;

    try {
      setAddingSub(true);
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + parseInt(subDurationMonths));

      const isOnlinePending = subPaymentMethod === "online_pending";

      const payload = {
        organization_id: organization.id,
        member_id: subMemberId,
        plan_name: subPlanName,
        amount: parseFloat(subAmount) || 0,
        amount_paid: isOnlinePending ? 0 : (parseFloat(subAmount) || 0),
        status: isOnlinePending ? "pending" : "active",
        payment_status: isOnlinePending ? "pending" : "success",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("subscriptions").insert(payload);

      if (error) throw error;

      alert(isOnlinePending ? "Subscription payment request created successfully!" : "Subscription granted successfully!");
      setShowAddSub(false);
      setSubMemberId("");
      setSubPlanName("");
      setSubAmount("");
      setSubDurationMonths("1");
      setSubPaymentMethod("manual");
      reloadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to grant subscription");
    } finally {
      setAddingSub(false);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || members.length === 0) {
      alert("No members in organization to alert.");
      return;
    }

    try {
      setSendingAlert(true);
      const memberIds = members.map((m) => m.id);
      await dashboardService.sendNotification(
        organization.id,
        memberIds,
        alertTitle,
        alertMessage
      );

      alert(`Alert broadcasted to ${members.length} member${members.length !== 1 ? "s" : ""}!`);
      setAlertTitle("");
      setAlertMessage("");
      reloadDashboard();
    } catch (err: any) {
      console.error("Broadcast alert error:", err);
      alert(`Failed to send broadcast alert: ${err?.message || "Unknown error"}`);
    } finally {
      setSendingAlert(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    try {
      setSavingSettings(true);
      const { error } = await supabase
        .from("organizations")
        .update({
          organization_name: editName,
          organization_type: editType,
          email: editEmail,
          phone: editPhone,
          address: editAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", organization.id);

      if (error) throw error;

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      reloadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !organization) return;

    const newCourse = await createAcademyClass(organization.id, {
      className: courseName,
      instructorName: courseInstructor || "Faculty Member",
      dayOfWeek: courseDay,
      timing: courseTiming,
      room: courseRoom,
      maxCapacity: parseInt(courseMaxCap) || 30
    });

    setClasses(prev => [...prev, newCourse]);
    setShowAddCourseModal(false);
    setCourseName("");
  };

  // Filter members
  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const navigateTab = (tab: string) => {
    navigate(`/admin/dashboard?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const type = organization?.organization_type || "Academy";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── ACADEMY / EDULMS FULL-PAGE MODULE ROUTING ── */}
      {type === "Academy" ? (
        <>
          {activeTab === "overview" && (
            <OverviewModule
              studentsCount={students.length}
              teachersCount={teachers.length}
              coursesCount={classes.length}
              onNavigateTab={navigateTab}
              onOpenTestEngine={() => navigateTab("tests")}
              onOpenFeeAutomation={() => navigateTab("fees")}
              onOpenAddStudent={() => setShowAddMember(true)}
              onOpenCreateAnnouncement={() => navigateTab("announcements")}
            />
          )}

          {activeTab === "students" && (
            <StudentsModule
              students={students}
              onAddStudent={() => setShowAddMember(true)}
              onDeleteStudent={async (id) => {
                await deleteStudent(id);
                setStudents(prev => prev.filter(s => s.id !== id));
              }}
            />
          )}

          {activeTab === "teachers" && (
            <TeachersModule
              teachers={teachers}
              onAddTeacher={() => {
                setNewMemberRole("staff");
                setShowAddMember(true);
              }}
              onDeleteTeacher={async (id) => {
                await deleteStaffMember(id);
                setTeachers(prev => prev.filter(t => t.id !== id));
              }}
            />
          )}

          {activeTab === "courses" && (
            <CoursesModule
              classes={classes}
              registrations={classRegistrations}
              onAddClass={() => setShowAddCourseModal(true)}
              onDeleteClass={async (id) => {
                await deleteAcademyClass(id);
                setClasses(prev => prev.filter(c => c.id !== id));
              }}
            />
          )}

          {activeTab === "timetable" && (
            <TimetableModule slots={timetableSlots} />
          )}

          {activeTab === "assignments" && (
            <AssignmentsModule assignments={assignments} />
          )}

          {activeTab === "attendance" && (
            <AttendanceModule students={students} />
          )}

          {activeTab === "tests" && (
            <TestsModule
              tests={tests}
              onCreateTest={async (testData) => {
                const newTest = await createTestExam(organization?.id || "", testData);
                setTests(prev => [newTest, ...prev]);
              }}
            />
          )}

          {activeTab === "results" && (
            <ResultsModule results={results} />
          )}

          {activeTab === "fees" && (
            <FeesModule
              reminders={feeReminders}
              onTriggerBatchReminders={async () => {
                const res = await triggerBatchFeeReminders(organization?.id || "");
                alert(res.message);
              }}
            />
          )}

          {activeTab === "studyMaterial" && (
            <StudyMaterialModule materials={materials} />
          )}

          {activeTab === "reports" && (
            <ReportsModule />
          )}

          {activeTab === "announcements" && (
            <AnnouncementsModule
              announcements={announcements}
              onCreateAnnouncement={(anc) => {
                const newAnc: AnnouncementItem = {
                  id: `anc-${Date.now()}`,
                  ...anc,
                  created_at: "Just now",
                  author: "Admin"
                };
                setAnnouncements(prev => [newAnc, ...prev]);
                alert("Announcement created successfully!");
              }}
            />
          )}

          {activeTab === "settings" && (
            <SettingsModule />
          )}

          {activeTab === "classes" && (
            <AcademySection
              organizationId={organization?.id || ""}
              members={members}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              filteredMembers={filteredMembers}
              memberSearch={memberSearch}
              onSearchChange={setMemberSearch}
              formatDate={formatDate}
              onAddMember={() => setShowAddMember(true)}
              onGrantSubscription={(memberId) => {
                setSubMemberId(memberId);
                setShowAddSub(true);
              }}
              onToggleMember={handleToggleMember}
            />
          )}
        </>
      ) : (
        /* ── NON-ACADEMY DASHBOARD (GYM / HOSTEL) ── */
        <>
          {activeTab === "overview" && (
            <OverviewTab
              organization={organization}
              orgSubscription={orgSubscription}
              members={members}
              memberSubscriptions={memberSubscriptions}
              recentNotifications={recentNotifications}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onAddMember={() => setShowAddMember(true)}
              onGrantSubscription={() => setShowAddSub(true)}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              filteredMembers={filteredMembers}
              memberSearch={memberSearch}
              onSearchChange={setMemberSearch}
              formatDate={formatDate}
              onAddMember={() => setShowAddMember(true)}
              onGrantSubscription={(memberId) => {
                setSubMemberId(memberId);
                setShowAddSub(true);
              }}
              onToggleMember={handleToggleMember}
            />
          )}

          {activeTab === "subscriptions" && (
            <SubscriptionTab
              organizationId={organization?.id}
              memberSubscriptions={memberSubscriptions}
              members={members}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onGrantSubscription={() => setShowAddSub(true)}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationTab
              members={members}
              recentNotifications={recentNotifications}
              alertTitle={alertTitle}
              setAlertTitle={setAlertTitle}
              alertMessage={alertMessage}
              setAlertMessage={setAlertMessage}
              sendingAlert={sendingAlert}
              handleSendAlert={handleSendAlert}
              formatDate={formatDate}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              organization={organization}
              editName={editName}
              setEditName={setEditName}
              editType={editType}
              setEditType={setEditType}
              editEmail={editEmail}
              setEditEmail={setEditEmail}
              editPhone={editPhone}
              setEditPhone={setEditPhone}
              editAddress={editAddress}
              setEditAddress={setEditAddress}
              savingSettings={savingSettings}
              settingsSuccess={settingsSuccess}
              handleSaveSettings={handleSaveSettings}
            />
          )}

          {type === "Gym" && (
            <GymSection
              activeTab={activeTab}
              organizationId={organization?.id || ""}
              members={members}
            />
          )}

          {(type === "Hostel" || type === "Mess") && (
            <HostelMessSection
              activeTab={activeTab}
              organizationId={organization?.id || ""}
              members={members}
            />
          )}
        </>
      )}

      {/* ── ADD MEMBER MODAL ── */}
      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberEmail={newMemberEmail}
        setNewMemberEmail={setNewMemberEmail}
        newMemberPhone={newMemberPhone}
        setNewMemberPhone={setNewMemberPhone}
        newMemberPassword={newMemberPassword}
        setNewMemberPassword={setNewMemberPassword}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        addingMember={addingMember}
        handleAddMember={handleAddMember}
      />

      {/* ── ASSIGN SUBSCRIPTION MODAL ── */}
      <GrantSubscriptionModal
        open={showAddSub}
        onClose={() => setShowAddSub(false)}
        members={members}
        subMemberId={subMemberId}
        setSubMemberId={setSubMemberId}
        subPlanName={subPlanName}
        setSubPlanName={setSubPlanName}
        subAmount={subAmount}
        setSubAmount={setSubAmount}
        subDurationMonths={subDurationMonths}
        setSubDurationMonths={setSubDurationMonths}
        subPaymentMethod={subPaymentMethod}
        setSubPaymentMethod={setSubPaymentMethod}
        addingSub={addingSub}
        handleAddSubscription={handleAddSubscription}
      />

      {/* ── ADD COURSE MODAL ── */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Create New Course</h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Biology 202"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Instructor</label>
                  <input
                    type="text"
                    placeholder="Instructor Name"
                    value={courseInstructor}
                    onChange={e => setCourseInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Schedule Days</label>
                  <input
                    type="text"
                    value={courseDay}
                    onChange={e => setCourseDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Timing</label>
                  <input
                    type="text"
                    value={courseTiming}
                    onChange={e => setCourseTiming(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Room</label>
                  <input
                    type="text"
                    value={courseRoom}
                    onChange={e => setCourseRoom(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Capacity</label>
                  <input
                    type="number"
                    value={courseMaxCap}
                    onChange={e => setCourseMaxCap(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddCourseModal(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}