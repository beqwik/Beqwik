interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;

  newMemberName: string;
  setNewMemberName: (value: string) => void;

  newMemberEmail: string;
  setNewMemberEmail: (value: string) => void;

  newMemberPhone: string;
  setNewMemberPhone: (value: string) => void;

  newMemberPassword: string;
  setNewMemberPassword: (value: string) => void;

  addingMember: boolean;

  handleAddMember: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddMemberModal({
  open,
  onClose,
  newMemberName,
  setNewMemberName,
  newMemberEmail,
  setNewMemberEmail,
  newMemberPhone,
  setNewMemberPhone,
  newMemberPassword,
  setNewMemberPassword,
  addingMember,
  handleAddMember,
}: AddMemberModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Register Member
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Create credentials & profile for a new member inside this organization.
        </p>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Enter member's name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="E.g., member@domain.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              placeholder="Set login password"
              value={newMemberPassword}
              onChange={(e) => setNewMemberPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingMember}
              className="flex-1 py-3 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-[#e05275]/20"
            >
              {addingMember ? "Registering..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
