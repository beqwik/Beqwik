import { useEffect, useState } from "react";
import { getOrganizations } from "../../services/superAdmin/organizationService";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

export default function Organizations() {
  const [organizations, setOrganizations] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    setLoading(true);

    const data =
      await getOrganizations();

    setOrganizations(data);

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Organizations <span className="text-blue-600">Registry</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage all organizations registered on Beqwik
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Total Organizations
            </p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#60a5fa] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-800">
              {organizations.length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Registered customers
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Active Organizations
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-600">
              {organizations.filter((org) => org.active).length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Running services
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-blue-600">
              Inactive Organizations
            </p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#2563eb] flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-[#2563eb]">
              {organizations.filter((org) => !org.active).length}
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Inactive/suspended
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">
            Loading organizations...
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100/80">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="text-left p-5 pl-8">Organization</th>
                <th className="text-left p-5">Type</th>
                <th className="text-left p-5">Code</th>
                <th className="text-left p-5">Email</th>
                <th className="text-left p-5">Phone</th>
                <th className="text-left p-5 pr-8">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr
                  key={org.id}
                  className="hover:bg-slate-50/30 transition duration-200"
                >
                  <td className="p-5 pl-8 font-bold text-slate-800">
                    {org.organization_name}
                  </td>
                  <td className="p-5 text-sm text-slate-600 font-medium">
                    {org.organization_type}
                  </td>
                  <td className="p-5 text-sm font-mono text-slate-500">
                    {org.organization_code}
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    {org.email}
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    {org.phone || "—"}
                  </td>
                  <td className="p-5 pr-8">
                    {org.active ? (
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