import React, { useState } from "react";
import { Dumbbell, Home, GraduationCap, UserCheck, Briefcase, Users, Search, Plus, CreditCard } from "lucide-react";

interface MembersTabProps {
  orgType?: string;
  filteredMembers: any[];
  memberSearch: string;
  onSearchChange: (value: string) => void;
  formatDate: (date: string) => string;
  onAddMember: () => void;
  onGrantSubscription: (memberId: string) => void;
  onToggleMember: (memberId: string, active: boolean) => void;
}

export default function MembersTab({
  orgType = "Academy",
  filteredMembers,
  memberSearch,
  onSearchChange,
  formatDate,
  onAddMember,
  onGrantSubscription,
  onToggleMember,
}: MembersTabProps) {
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "staff">("all");

  // Separate Counts
  const totalCount = filteredMembers.length;
  const studentCount = filteredMembers.filter(
    (m) => m.role === "student" || !m.role
  ).length;
  const staffCount = filteredMembers.filter((m) => m.role === "staff").length;

  // Filtered by selected role tab
  const displayedMembers = filteredMembers.filter((m) => {
    if (roleFilter === "student") return m.role === "student" || !m.role;
    if (roleFilter === "staff") return m.role === "staff";
    return true;
  });

  const isGym = orgType === "Gym";
  const isHostelMess = orgType === "Hostel" || orgType === "Mess";

  const studentPlural = isGym ? "Gym Members" : isHostelMess ? "Residents" : "Students";
  const studentIcon = isGym ? <Dumbbell className="w-4 h-4" /> : isHostelMess ? <Home className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />;
  const studentSingular = isGym ? "Gym Member" : isHostelMess ? "Resident" : "Student";

  const staffPlural = isGym ? "Trainers / Staff" : isHostelMess ? "Staff Members" : "Staff / Teachers";
  const staffIcon = isGym ? <UserCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />;
  const staffSingular = isGym ? "Trainer / Staff" : isHostelMess ? "Staff Member" : "Staff";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* SEPARATE COUNTS HEADER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-lg">
            <Users className="w-5 h-5 inline-block" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{studentPlural}</p>
            <h3 className="text-2xl font-extrabold text-[#e05275] mt-1">{studentCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fff0f5] text-[#e05275] font-bold flex items-center justify-center text-lg">
            {studentIcon}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{staffPlural}</p>
            <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{staffCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-lg">
            {staffIcon}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* SEARCH AND ROLE FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-3 text-slate-400"><Search className="w-4 h-4" /></span>
            <input
              type="text"
              placeholder="Search member by name, email, phone..."
              value={memberSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e05275]/40"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto flex-nowrap whitespace-nowrap">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setRoleFilter("student")}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === "student"
                  ? "bg-white text-[#e05275] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {studentPlural} ({studentCount})
            </button>
            <button
              onClick={() => setRoleFilter("staff")}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === "staff"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {staffPlural} ({staffCount})
            </button>
          </div>
        </div>

        {/* BUTTON ADD MEMBER */}
        <button
          onClick={() => onAddMember()}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 inline-block mr-1" /> Register {isGym ? "Gym User" : "Member"}
        </button>
      </div>

      {/* MEMBERS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 sm:px-6 py-4">Member Info</th>
                <th className="px-4 sm:px-6 py-4">Role</th>
                <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Contact</th>
                <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Joined Date</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedMembers.length > 0 ? (
                displayedMembers.map((member) => {
                  const initials = member.full_name
                    ? member.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "M";

                  const isStaff = member.role === "staff";

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border ${
                            isStaff 
                              ? "bg-purple-50 text-purple-700 border-purple-200" 
                              : "bg-[#fff0f5] text-[#e05275] border-[#ffd6e4]"
                          }`}>
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
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                          isStaff 
                            ? "bg-purple-50 text-purple-700 border border-purple-100" 
                            : "bg-pink-50 text-pink-700 border border-pink-100"
                        }`}>
                          {isStaff ? <><span className="mr-1 inline-flex">{staffIcon}</span> {staffSingular}</> : <><span className="mr-1 inline-flex">{studentIcon}</span> {studentSingular}</>}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <p className="text-slate-800 text-sm">{member.email}</p>
                        <p className="text-slate-400 text-xs">{member.phone || "—"}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
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
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isStaff && (
                            <button
                              onClick={() => onGrantSubscription(member.id)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-55 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 rounded-lg text-xs font-semibold transition"
                            >
                              <CreditCard className="w-4 h-4 mr-1 inline" /> Grant Sub
                            </button>
                          )}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-5 h-5 inline-block" /> No members found for this filter.
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
