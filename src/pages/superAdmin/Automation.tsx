import { Zap, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function Automation() {
  
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "disabled">("all");
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const [search, setSearch] = useState("");


useEffect(() => {
  fetchWorkflows();
}, []);

async function fetchWorkflows() {
  setLoading(true);
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

  const { data, error } = await supabase
    .from("automation_workflows")
    .select("*")
    .order("created_at");

  console.log("Automation Data:", data);
  console.log("Automation Error:", error);

  if (data) {
    setWorkflows(data);
  }

  setLoading(false);
}

if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-slate-500 font-medium">
        Loading workflows...
      </p>
    </div>
  );
}
const filteredWorkflows = workflows.filter((workflow) => {
  const matchesSearch =
    workflow.name?.toLowerCase().includes(search.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(search.toLowerCase()) ||
    workflow.trigger_type?.toLowerCase().includes(search.toLowerCase());

  const matchesFilter =
    filter === "all"
      ? true
      : filter === "active"
      ? workflow.enabled
      : !workflow.enabled;

  return matchesSearch && matchesFilter;
});

async function toggleWorkflow(id: string, enabled: boolean) {
  console.log("Clicked:", id, enabled);

  const { data, error } = await supabase
    .from("automation_workflows")
    .update({
      enabled: !enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  console.log("Updated Data:", data);
  console.log("Error:", error);

  if (!error) {
    fetchWorkflows();
  }
}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Automation <span className="text-blue-600">Workflows</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Automate billing cycles, notifications, and platform workflows
        </p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
    <p className="text-sm font-semibold text-slate-500">Active Workflows</p>
    <h2 className="text-3xl font-black text-slate-900 mt-2">
      {workflows.filter(w => w.enabled).length}
    </h2>
    <p className="text-xs text-emerald-600 mt-2">Currently Running</p>
  </div>

  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
    <p className="text-sm font-semibold text-slate-500">Disabled</p>
    <h2 className="text-3xl font-black text-slate-900 mt-2">
      {workflows.filter(w => !w.enabled).length}
    </h2>
    <p className="text-xs text-slate-500 mt-2">Inactive Workflows</p>
  </div>

  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
    <p className="text-sm font-semibold text-slate-500">Total Workflows</p>
    <h2 className="text-3xl font-black text-slate-900 mt-2">
      {workflows.length}
    </h2>
    <p className="text-xs text-blue-600 mt-2">Configured</p>
  </div>

  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
    <p className="text-sm font-semibold text-slate-500">Failed Runs</p>
    <h2 className="text-3xl font-black text-emerald-600 mt-2">
      0
    </h2>
    <p className="text-xs text-emerald-600 mt-2">No Failed Executions</p>
  </div>

</div>

<div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    <input
  type="text"
  placeholder="Search workflows..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full lg:w-80 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
/>

    <div className="flex gap-3">

      <button
  onClick={() => setFilter("all")}
  className={`px-4 py-2 rounded-full text-sm transition ${
    filter === "all"
      ? "bg-blue-600 text-white"
      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
  }`}
>
  All
</button>

<button
  onClick={() => setFilter("active")}
  className={`px-4 py-2 rounded-full text-sm transition ${
    filter === "active"
      ? "bg-blue-600 text-white"
      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
  }`}
>
  Active
</button>

<button
  onClick={() => setFilter("disabled")}
  className={`px-4 py-2 rounded-full text-sm transition ${
    filter === "disabled"
      ? "bg-blue-600 text-white"
      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
  }`}
>
  Disabled
</button>

    </div>

  </div>

</div>
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

  <div className="px-6 py-5 border-b border-slate-100">
    <h2 className="text-lg font-bold text-slate-900">
      Workflow Management
    </h2>
    <p className="text-sm text-slate-500">
      Manage and monitor all automation workflows.
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">

     <thead className="bg-slate-50">
  <tr className="text-left">

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Workflow
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Trigger
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Status
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Last Run
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Next Run
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Retry
    </th>

    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
      Actions
    </th>

  </tr>
</thead>

      <tbody>

        {filteredWorkflows.map((workflow) => (

          <tr
            key={workflow.id}
            className="border-t border-slate-100 hover:bg-slate-50 transition"
          >

            <td className="px-6 py-5">
              <div>
                <p className="font-semibold text-slate-800">
                  {workflow.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {workflow.description}
                </p>
              </div>
            </td>

            <td className="px-6 py-5 text-sm text-slate-600">
              {workflow.trigger_type}
            </td>

            <td className="px-6 py-5">

  <button
    onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
      workflow.enabled
        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
    }`}
  >
    {workflow.enabled ? "Enabled" : "Disabled"}
  </button>

</td>

            <td className="px-6 py-5 text-sm text-slate-600">
              {workflow.last_run
                ? new Date(workflow.last_run).toLocaleString()
                : "Never"}
            </td>
            <td className="px-6 py-5 text-sm text-slate-600">
  {workflow.next_run
    ? new Date(workflow.next_run).toLocaleString()
    : "Not Scheduled"}
</td>

<td className="px-6 py-5 text-sm font-semibold">
  {workflow.retry_attempts ?? 0}
</td>

           <td className="px-6 py-5">
  <button
    onClick={() => navigate(`/super-admin/automation/${workflow.id}`)}
    className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
  >
    Manage
  </button>
</td>

          </tr>

        ))}

      </tbody>

    </table>
  </div>

</div>
    </div>
  );
}
