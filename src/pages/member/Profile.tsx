import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { updateMember } from "../../services/member/memberService";
import { checkIsStaffMember } from "../../services/organization/academyService";
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Building2,
  Eye,
  EyeOff,
  Check,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function MemberProfile() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

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

  const [studentRecord, setStudentRecord] = useState<any>(null);
  const [staffRecord, setStaffRecord] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Profile
  const [fullName, setFullName] = useState(member?.full_name || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notifications Preferences (persisted in localStorage)
  const notifKey = `notif_prefs_${member?.id}`;
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);
  const [notifSchedule, setNotifSchedule] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifPrefSaved, setNotifPrefSaved] = useState(false);

  useEffect(() => {
    async function verifyAndFetch() {
      if (org?.id && member?.email) {
        const verified = await checkIsStaffMember(org.id, member.email);
        if (verified) setIsStaff(true);

        const { data: stdData } = await supabase
          .from("academy_students")
          .select("*")
          .eq("organization_id", org.id)
          .ilike("email", member.email.trim())
          .maybeSingle();
        if (stdData) setStudentRecord(stdData);

        const { data: stfData } = await supabase
          .from("academy_staff")
          .select("*")
          .eq("organization_id", org.id)
          .ilike("email", member.email.trim())
          .maybeSingle();
        if (stfData) setStaffRecord(stfData);
      }
    }
    verifyAndFetch();
  }, [org?.id, member?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(notifKey);
      if (raw) {
        const prefs = JSON.parse(raw);
        setNotifPromo(prefs.promo ?? true);
        setNotifAnnouncements(prefs.announcements ?? true);
        setNotifSchedule(prefs.schedule ?? true);
        setNotifPayment(prefs.payment ?? true);
      }
    } catch { /* ignore */ }
  }, [notifKey]);

  const isAcademy =
    org?.organization_type === "Academy" ||
    Boolean(studentRecord) ||
    Boolean(staffRecord) ||
    isStaff;

  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.id) return;
    setSaving(true);
    try {
      await updateMember(member.id, { full_name: fullName, phone });
      const updated = { ...member, full_name: fullName, phone };
      localStorage.setItem("member", JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.message || "Failed to change password." });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifPrefs = () => {
    try {
      localStorage.setItem(notifKey, JSON.stringify({
        promo: notifPromo,
        announcements: notifAnnouncements,
        schedule: notifSchedule,
        payment: notifPayment,
      }));
      setNotifPrefSaved(true);
      setTimeout(() => setNotifPrefSaved(false), 3000);
    } catch { /* ignore */ }
  };

  const tabs = [
    { key: "profile", label: "My Profile", icon: User },
    { key: "security", label: "Security", icon: Shield },
    { key: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  const displayId = isStaff
    ? (staffRecord?.staff_code || member?.staff_code || member?.id?.slice(0, 12) + "...")
    : isAcademy
    ? (studentRecord?.student_code || member?.student_code || member?.id?.slice(0, 12) + "...")
    : (member?.id?.slice(0, 12) + "...");

  const themeClass = isStaff
    ? "from-purple-600 via-indigo-600 to-indigo-800 shadow-purple-500/20"
    : isAcademy
    ? "from-indigo-600 via-indigo-700 to-purple-700 shadow-blue-500/20"
    : "from-blue-600 via-blue-700 to-indigo-700 shadow-blue-500/20";

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${themeClass} rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-center gap-4 shadow-lg text-center sm:text-left`}>
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white">
            {member?.full_name || (isStaff ? "Faculty Member" : isAcademy ? "Academy Student" : "Gym Member")}
          </h1>
          <p className="text-white/80 text-sm mt-0.5 truncate">{member?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1">
              {isStaff ? "👨‍🏫" : isAcademy ? "🎓" : "🏋️"} {org?.name || (isAcademy ? "The Academy" : "Gym")}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-white text-xs font-bold">
              {isStaff
                ? `Faculty (${staffRecord?.designation || member?.designation || "Teacher"})`
                : isAcademy
                ? "Active Student"
                : "Active Member"}
            </span>
            {displayId && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-mono text-xs font-extrabold">
                {isStaff ? "Staff ID: " : isAcademy ? "Student ID: " : "Member ID: "}
                {displayId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-full">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Account Details Card */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Account Details</h3>
            {[
              {
                icon: User,
                label: isStaff ? "Staff ID" : isAcademy ? "Student ID" : "Member ID",
                value: displayId
              },
              {
                icon: Building2,
                label: isAcademy ? "Academy Code" : "Gym Code",
                value: org?.organization_code || "—"
              },
              { icon: Mail, label: "Email", value: member?.email || "—" },
              { icon: Phone, label: "Phone", value: member?.phone || "—" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAcademy ? "bg-indigo-50" : "bg-blue-50"}`}>
                    <Icon className={`w-4 h-4 ${isAcademy ? "text-indigo-600" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 break-all font-mono">{item.value}</p>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isStaff ? "Faculty Joined Date" : isAcademy ? "Student Registered Since" : "Member Since"}
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {member?.created_at
                  ? new Date(member.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </p>
            </div>

            {!isAcademy && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Support & Legal</p>
                <div className="space-y-1 text-xs font-medium text-slate-600">
                  <a href="#help" onClick={(e) => { e.preventDefault(); alert("Help & Support: Reach us at support@beqwik.com or +91 1800 123 4567"); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition">
                    ❓ Help & Support
                  </a>
                  <a href="#about" onClick={(e) => { e.preventDefault(); alert("About Gym: Powered by BeQwik Member Portal v2.4.0"); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition">
                    ℹ️ About Gym
                  </a>
                  <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Your member records and payment details are encrypted and secure."); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition">
                    🔒 Privacy Policy
                  </a>
                  <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms & Conditions: Please adhere to gym safety guidelines and slot timings."); }} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition">
                    📄 Terms & Conditions
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Profile</h3>
              <p className="text-slate-500 text-xs mt-0.5">Update your personal profile information.</p>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      value={member?.email || ""}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>

                {/* Org (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isAcademy ? "Academy / Institution" : "Gym / Organization"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={org?.name || org?.organization_name || "—"}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md ${
                    isAcademy
                      ? "bg-blue-600 hover:opacity-90 shadow-blue-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                {saved && (
                  <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Profile updated!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="max-w-lg space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Change Password</h3>
              <p className="text-slate-500 text-xs mt-0.5">Keep your account secure with a strong password.</p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordMsg && (
                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium border ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  {passwordMsg.type === "error"
                    ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    : <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? newPassword.length >= 12 ? "bg-emerald-500"
                              : newPassword.length >= 8 ? "bg-yellow-400"
                              : "bg-rose-400"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {newPassword.length < 6 ? "Too short" : newPassword.length < 8 ? "Weak" : newPassword.length < 12 ? "Moderate" : "Strong"}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md ${
                    isAcademy
                      ? "bg-blue-600 hover:opacity-90 shadow-blue-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Notification Preferences</h3>
              <p className="text-slate-500 text-xs mt-0.5">Choose which notifications you want to receive.</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  key: "announcements",
                  label: isAcademy ? "Academy Notices & Announcements" : "Gym Announcements",
                  desc: isAcademy ? "Official notices from faculty and academy administration" : "New announcements from your gym admin",
                  icon: "📢",
                  value: notifAnnouncements,
                  setter: setNotifAnnouncements,
                },
                {
                  key: "schedule",
                  label: isAcademy ? "Class Timetable & Schedule" : "Training Schedule",
                  desc: isAcademy ? "Reminders about upcoming classes, lectures, and exams" : "Reminders about upcoming sessions and bookings",
                  icon: "📅",
                  value: notifSchedule,
                  setter: setNotifSchedule,
                },
                {
                  key: "payment",
                  label: isAcademy ? "Fee & Payment Updates" : "Payment & Subscription",
                  desc: isAcademy ? "Alerts about tuition fees, dues, and payment status" : "Alerts about subscription renewals and payment status",
                  icon: "💳",
                  value: notifPayment,
                  setter: setNotifPayment,
                },
                {
                  key: "promo",
                  label: isAcademy ? "Academic Updates & Events" : "Promotions & Offers",
                  desc: isAcademy ? "Updates about workshops, academic events, and seminars" : "Special discounts and gym promotions",
                  icon: "🎁",
                  value: notifPromo,
                  setter: setNotifPromo,
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div
                    onClick={() => item.setter((v: boolean) => !v)}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${item.value ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.value ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <button
                  onClick={handleSaveNotifPrefs}
                  className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold transition shadow-md ${
                    isAcademy
                      ? "bg-blue-600 hover:opacity-90 shadow-blue-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
                {notifPrefSaved && (
                  <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Preferences saved!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
