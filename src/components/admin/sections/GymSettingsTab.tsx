import { useState } from "react";
import { supabase } from "../../../services/supabase";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Copy,
  Check,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

interface GymSettingsTabProps {
  organization: any;
  editName: string;
  setEditName: (v: string) => void;
  editType: string;
  setEditType: (v: string) => void;
  editEmail: string;
  setEditEmail: (v: string) => void;
  editPhone: string;
  setEditPhone: (v: string) => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  savingSettings: boolean;
  settingsSuccess: boolean;
  handleSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_HOURS: Record<string, { open: string; close: string; closed: boolean }> = {
  Monday:    { open: "06:00", close: "22:00", closed: false },
  Tuesday:   { open: "06:00", close: "22:00", closed: false },
  Wednesday: { open: "06:00", close: "22:00", closed: false },
  Thursday:  { open: "06:00", close: "22:00", closed: false },
  Friday:    { open: "06:00", close: "22:00", closed: false },
  Saturday:  { open: "07:00", close: "20:00", closed: false },
  Sunday:    { open: "07:00", close: "18:00", closed: false },
};

export default function GymSettingsTab({
  organization,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editAddress,
  setEditAddress,
  savingSettings,
  settingsSuccess,
  handleSaveSettings,
}: GymSettingsTabProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "hours" | "security">("general");

  // Operating Hours
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(DEFAULT_HOURS);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Description/Amenities (extra gym meta)
  const [editDescription, setEditDescription] = useState(organization?.description || "");
  const [editAmenities, setEditAmenities] = useState(organization?.amenities || "");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(organization?.organization_code || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleSaveHours = async () => {
    if (!organization?.id) return;
    setSavingHours(true);
    try {
      await supabase
        .from("organizations")
        .update({ operating_hours: hours, updated_at: new Date().toISOString() })
        .eq("id", organization.id);
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingHours(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.message || "Failed to change password." });
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { key: "general", label: "General Info", icon: Building2 },
    { key: "hours", label: "Operating Hours", icon: Clock },
    { key: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900">Gym Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your gym profile, hours, and account security.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: Org Card + Nav */}
        <div className="lg:col-span-1 space-y-4">
          {/* Org Identity Card */}
          <div className="bg-gradient-to-br from-[#e05275] to-[#b55fe6] rounded-2xl p-5 text-white shadow-lg shadow-[#e05275]/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black mb-3">
              🏋️
            </div>
            <h3 className="font-black text-lg leading-tight">{organization?.organization_name}</h3>
            <p className="text-white/70 text-xs mt-0.5">Gym / Fitness Center</p>
            <div className="mt-4 bg-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Invite Code</p>
                <p className="font-mono font-black text-sm tracking-widest mt-0.5">{organization?.organization_code}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                title="Copy code"
              >
                {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeSection === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveSection(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition border-b border-slate-100 last:border-b-0 ${
                    active
                      ? "bg-gradient-to-r from-[#fff0f5] to-[#f5f0ff] text-[#e05275]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#e05275]" : "text-slate-400"}`} />
                  {t.label}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e05275]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Content Panel */}
        <div className="lg:col-span-3">
          {/* GENERAL INFO */}
          {activeSection === "general" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">General Information</h3>
                <p className="text-slate-500 text-xs mt-0.5">Update your gym's public profile and contact details.</p>
              </div>
              <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Gym Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Gym Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. PowerHouse Gym"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Contact Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Gym Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Street, City, State, PIN"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition resize-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Gym Description
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Briefly describe your gym, its mission, and what makes it special..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition resize-none"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Amenities <span className="text-slate-400 font-normal">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={editAmenities}
                      onChange={(e) => setEditAmenities(e.target.value)}
                      placeholder="e.g. Free Weights, Cardio Zone, Steam Room, Parking"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                    />
                    {editAmenities && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editAmenities.split(",").filter(Boolean).map((a: string) => (
                          <span key={a.trim()} className="px-2.5 py-1 bg-[#fff0f5] text-[#e05275] text-xs font-semibold rounded-full border border-[#ffd6e4]">
                            {a.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
                  >
                    <Save className="w-4 h-4" />
                    {savingSettings ? "Saving..." : "Save Changes"}
                  </button>
                  {settingsSuccess && (
                    <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Settings saved!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* OPERATING HOURS */}
          {activeSection === "hours" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Operating Hours</h3>
                <p className="text-slate-500 text-xs mt-0.5">Set when your gym is open each day of the week.</p>
              </div>
              <div className="p-6 space-y-3">
                {DAYS.map((day) => {
                  const slot = hours[day];
                  return (
                    <div key={day} className={`flex items-center gap-4 p-4 rounded-xl border transition ${slot.closed ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-[#e05275]/40"}`}>
                      <div className="w-28">
                        <p className="text-sm font-bold text-slate-800">{day}</p>
                      </div>

                      {slot.closed ? (
                        <span className="text-xs font-semibold text-slate-400 italic">Closed</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
                          />
                          <span className="text-slate-400 text-sm font-medium">to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
                          />
                        </div>
                      )}

                      <label className="ml-auto flex items-center gap-2 cursor-pointer shrink-0">
                        <span className="text-xs font-medium text-slate-500">Closed</span>
                        <div
                          onClick={() => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }))}
                          className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${slot.closed ? "bg-slate-300" : "bg-[#e05275]"}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${slot.closed ? "translate-x-0.5" : "translate-x-5"}`} />
                        </div>
                      </label>
                    </div>
                  );
                })}

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={handleSaveHours}
                    disabled={savingHours}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
                  >
                    <Save className="w-4 h-4" />
                    {savingHours ? "Saving..." : "Save Hours"}
                  </button>
                  {hoursSaved && (
                    <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Operating hours saved!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="space-y-5">
              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Change Password</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Update your admin account password.</p>
                </div>
                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  {passwordMsg && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium border ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      {passwordMsg.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                      {passwordMsg.text}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
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
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                        />
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 transition"
                        />
                        <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
                    >
                      <Shield className="w-4 h-4" />
                      {savingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Account Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Account Info</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Organization ID", value: organization?.id?.slice(0, 12) + "..." || "—" },
                    { label: "Invite Code", value: organization?.organization_code || "—" },
                    { label: "Account Type", value: "Admin / Owner" },
                    { label: "Created", value: organization?.created_at ? new Date(organization.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</p>
                      <p className="font-bold text-slate-800 text-sm mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
