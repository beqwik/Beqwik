import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { registerMember } from "../../services/member/memberAuth";
import { useDashboard } from "../../hooks/useDashboard";
import GymSection from "../../components/admin/sections/GymSection";
import HostelMessSection from "../../components/admin/sections/HostelMessSection";
import AcademySection from "../../components/admin/sections/AcademySection";
import DefaultSection from "../../components/admin/sections/DefaultSection";
import OverviewTab from "../../components/admin/dashboard/OverviewTab";
import MembersTab from "../../components/admin/dashboard/MembersTab";
import SubscriptionTab from "../../components/admin/dashboard/SubscriptionTab";
import NotificationTab from "../../components/admin/dashboard/NotificationTab";
import SettingsTab from "../../components/admin/dashboard/SettingsTab";
import AddMemberModal from "../../components/admin/dashboard/modals/AddMemberModal";
import GrantSubscriptionModal from "../../components/admin/dashboard/modals/GrantSubscriptionModal";
import usePlanAccess from "../../hooks/usePlanAccess";
import UpgradePrompt from "../../components/admin/dashboard/UpgradePrompt";

export default function AdminDashboard() {
  console.log("========== DASHBOARD ==========");
  
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { hasAccess } = usePlanAccess();

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
  const [addingMember, setAddingMember] = useState(false);

  const [showAddSub, setShowAddSub] = useState(false);
  const [subMemberId, setSubMemberId] = useState("");
  const [subPlanName, setSubPlanName] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subDurationMonths, setSubDurationMonths] = useState("1");
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

  useEffect(() => {
  if (!organization) return;

  setEditName(organization.organization_name || "");
  setEditType(organization.organization_type || "");
  setEditEmail(organization.email || "");
  setEditPhone(organization.phone || "");
  setEditAddress(organization.address || "");
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

  // Actions
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
      });

      if (res.success) {
        alert("Member successfully registered!");
        setShowAddMember(false);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberPhone("");
        setNewMemberPassword("");
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

      const payload = {
        organization_id: organization.id,
        member_id: subMemberId,
        plan_name: subPlanName,
        amount: parseFloat(subAmount) || 0,
        amount_paid: parseFloat(subAmount) || 0, // Write both to cover schema variance
        status: "active",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("subscriptions").insert(payload);

      if (error) throw error;

      alert("Subscription granted successfully!");
      setShowAddSub(false);
      setSubMemberId("");
      setSubPlanName("");
      setSubAmount("");
      setSubDurationMonths("1");
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
      
      // Send notification to each member
      const inserts = members.map((member) => ({
        member_id: member.id,
        title: alertTitle,
        message: alertMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("member_notifications").insert(inserts);

      if (error) throw error;

      alert(`Alert broadcasted to ${members.length} members!`);
      setAlertTitle("");
      setAlertMessage("");
      reloadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast alert");
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

  // Filter members
  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Render Custom Organization Vertical Sections
  const renderSectionTabs = () => {
    const type = organization?.organization_type || "";

    const customTabs = ["slots", "equipment", "menu", "meals", "classes"];
    if (customTabs.includes(activeTab) && !hasAccess(activeTab)) {
      const featureNames: Record<string, string> = {
        slots: "Training Slots",
        equipment: "Equipment Management",
        menu: "Weekly Menu Planner",
        meals: "Mess Log",
        classes: "Classes & Schedule",
      };
      return (
        <UpgradePrompt
          featureName={featureNames[activeTab] || activeTab}
          requiredPlan="Pro"
        />
      );
    }

    if (type === "Gym") {
      if (activeTab === "slots" || activeTab === "equipment") {
        return (
          <GymSection
            activeTab={activeTab}
            organizationId={organization?.id || ""}
            members={members}
          />
        );
      }
    }

    if (type === "Hostel" || type === "Mess") {
      if (activeTab === "menu" || activeTab === "meals") {
        return (
          <HostelMessSection
            activeTab={activeTab}
            organizationId={organization?.id || ""}
            members={members}
          />
        );
      }
    }

    if (type === "Academy") {
      if (activeTab === "classes") {
        return (
          <AcademySection
            organizationId={organization?.id || ""}
            members={members}
          />
        );
      }
    }

    // DefaultSection fallback if needed or if page tab is other custom tab
    if (customTabs.includes(activeTab)) {
      return (
        <DefaultSection
          activeTab={activeTab}
          organizationId={organization?.id || ""}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#e05275] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── OVERVIEW TAB ── */}
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

      {/* ── MEMBERS TAB ── */}
      {activeTab === "members" && (
        hasAccess("members") ? (
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
        ) : (
          <UpgradePrompt featureName="Members Management" requiredPlan="Basic" />
        )
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === "subscriptions" && (
        hasAccess("subscriptions") ? (
          <SubscriptionTab
            memberSubscriptions={memberSubscriptions}
            members={members}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onGrantSubscription={() => setShowAddSub(true)}
          />
        ) : (
          <UpgradePrompt featureName="Subscription Records" requiredPlan="Basic" />
        )
      )}

      {/* ── ALERTS TAB ── */}
      {activeTab === "notifications" && (
        hasAccess("notifications") ? (
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
        ) : (
          <UpgradePrompt featureName="Send Alerts & Announcements" requiredPlan="Pro" />
        )
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === "settings" && (
        hasAccess("settings") ? (
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
        ) : (
          <UpgradePrompt featureName="Settings" requiredPlan="Basic" />
        )
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
        addingSub={addingSub}
        handleAddSubscription={handleAddSubscription}
      />
      
      {/* ── DYNAMIC SECTION TABS ── */}
      {renderSectionTabs()}
    </div>
  );
}