import { useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { updateMember } from "../../services/member/memberService";

export default function MemberProfile() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [fullName, setFullName] = useState(member?.full_name || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.id) return;
    setSaving(true);
    try {
      await updateMember(member.id, { full_name: fullName, phone });
      // Update localStorage
      const updated = { ...member, full_name: fullName, phone };
      localStorage.setItem("member", JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">View and update your personal information.</p>
      </div>

      {/* AVATAR CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#e05275] to-[#b55fe6] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{member?.full_name || "Member"}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{member?.email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-1 rounded-full bg-[#fff0f5] text-[#e05275] text-xs font-medium border border-[#ffd6e4]">
              {org?.name || "Organization"}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Active Member
            </span>
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Edit Information</h2>
        <form onSubmit={handleSave} className="space-y-5">

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={member?.email || ""}
              disabled
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
            <input
              type="text"
              value={org?.name || "—"}
              disabled
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white font-semibold text-sm transition disabled:opacity-60 shadow-md shadow-[#e05275]/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-1.5">
                ✅ Profile updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* INFO CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Member ID", value: member?.id?.slice(0, 12) + "..." || "—" },
            { label: "Organization Code", value: org?.organization_code || "—" },
            { label: "Status", value: member?.active ? "Active" : "Inactive" },
            { label: "Member Since", value: member?.created_at ? new Date(member.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
              <p className="font-semibold text-slate-900 mt-1 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
