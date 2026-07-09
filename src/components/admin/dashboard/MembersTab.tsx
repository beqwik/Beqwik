interface MembersTabProps {
    filteredMembers: any[];
    memberSearch: string;
    onSearchChange: (value: string) => void;
    formatDate: (date: string) => string;
    onAddMember: () => void;
    onGrantSubscription: (memberId: string) => void;
    onToggleMember: (
        memberId: string,
        active: boolean
    ) => void;
}

export default function MembersTab({
    filteredMembers,
    memberSearch,
    onSearchChange,
    formatDate,
    onAddMember,
    onGrantSubscription,
    onToggleMember,
}: MembersTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* SEARCH AND FILTERS */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search member by name, email, phone..."
            value={memberSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
          />
        </div>
        {/* BUTTON ADD MEMBER */}
        <button
          onClick={() => onAddMember()}
          className="px-5 py-2.5 bg-gradient-to-r from-[#e05275] to-[#b55fe6] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#e05275]/20"
        >
          ➕ Register Member
        </button>
      </div>

      {/* MEMBERS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const initials = member.full_name
                    ? member.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "M";
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#fff0f5] text-[#e05275] font-bold flex items-center justify-center text-sm border border-[#ffd6e4]/50">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {member.full_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              ID: {member.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-800 text-sm">{member.email}</p>
                        <p className="text-slate-400 text-xs">{member.phone || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            member.active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {member.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onGrantSubscription(member.id)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-55 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 rounded-lg text-xs font-semibold transition"
                          >
                            💳 Grant Sub
                          </button>
                          <button
                            onClick={() =>
                              onToggleMember(member.id, member.active)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              member.active
                                ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                            }`}
                          >
                            {member.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    👥 No members found. Register a member to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
