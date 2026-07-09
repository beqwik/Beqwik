import { useEffect, useState } from "react";
import { getMembers } from "../../services/superAdmin/memberService";
import { Users, UserCheck, UserMinus } from "lucide-react";

export default function Members() {
  const [members, setMembers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);

    const data = await getMembers();

    setMembers(data);

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Members <span className="text-blue-600">Directory</span>
        </h1>
        <p className="mt-1 text-slate-500 font-medium">
          Manage all members across organizations
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Total Members
            </p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#60a5fa] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {members.length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              All registered users
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Active Members
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-600">
              {members.filter((member) => member.active).length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Currently active users
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Inactive Members
            </p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#2563eb] flex items-center justify-center">
              <UserMinus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-[#2563eb]">
              {members.filter((member) => !member.active).length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Suspended/inactive users
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">
            Loading members...
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100/80">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="text-left p-5 pl-8">Name</th>
                <th className="text-left p-5">Email</th>
                <th className="text-left p-5">Phone</th>
                <th className="text-left p-5">Gender</th>
                <th className="text-left p-5 pr-8">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/30 transition duration-200"
                >
                  <td className="p-5 pl-8 font-bold text-slate-800">
                    {member.full_name}
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    {member.email}
                  </td>
                  <td className="p-5 text-sm text-slate-600 font-medium">
                    {member.phone || "—"}
                  </td>
                  <td className="p-5 text-sm text-slate-500 font-semibold capitalize">
                    {member.gender || "—"}
                  </td>
                  <td className="p-5 pr-8">
                    {member.active ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-[#2563eb] text-xs font-semibold border border-rose-100">
                        <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
