interface SettingsTabProps {
  organization: any;

  editName: string;
  setEditName: (value: string) => void;

  editType: string;
  setEditType: (value: string) => void;

  editEmail: string;
  setEditEmail: (value: string) => void;

  editPhone: string;
  setEditPhone: (value: string) => void;

  editAddress: string;
  setEditAddress: (value: string) => void;

  savingSettings: boolean;
  settingsSuccess: boolean;

  handleSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function SettingsTab({
  organization,
  editName,
  setEditName,
  editType,
  setEditType,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editAddress,
  setEditAddress,
  savingSettings,
  settingsSuccess,
  handleSaveSettings,
}: SettingsTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8 animate-fadeIn">
      {/* ORG CODE DISPLAY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:col-span-1 h-fit text-center">
        <span className="text-4xl">🏢</span>
        <h3 className="font-extrabold text-slate-900 text-lg mt-3">
          {organization?.organization_name}
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Code: {organization?.organization_code}
        </p>

        <div className="bg-[#fff0f5] border border-[#ffd6e4] rounded-xl px-4 py-4 mt-6 text-left">
          <h4 className="font-bold text-[#e05275] text-xs uppercase tracking-wide">
            Member Invite Link
          </h4>
          <p className="text-slate-500 text-xs mt-1">
            Provide this organization code to your members so they can link accounts.
          </p>
          <div className="flex items-center justify-between bg-white border border-indigo-100 rounded-lg px-3 py-2 mt-3">
            <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
              {organization?.organization_code}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(organization?.organization_code);
                alert("Code copied!");
              }}
              className="text-xs text-[#e05275] hover:underline font-semibold"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:col-span-2">
        <h3 className="font-bold text-slate-800 text-lg mb-6">
          Organization Information
        </h3>
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Type
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40 bg-white"
              >
                <option value="Gym">Gym / Fitness Center</option>
                <option value="Hostel">Hostel / Dormitory</option>
                <option value="Club">Club / Association</option>
                <option value="Mess">Mess / Meal Service</option>
                <option value="Other">Other Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Phone
              </label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Office / Center Address
            </label>
            <textarea
              rows={3}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
            >
              {savingSettings ? "Saving..." : "Save Changes"}
            </button>
            {settingsSuccess && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                ✅ Organization settings updated!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
