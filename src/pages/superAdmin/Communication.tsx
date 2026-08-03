import { useEffect, useState } from "react";

import { getTemplates } from "../../services/communicationService";
import type { CommunicationTemplate } from "../../types/communication";
import EditCommunicationModal from "../../components/superAdmin/EditCommunicationModal";
import PreviewCommunicationModal from "../../components/superAdmin/PreviewCommunicationModal";

export default function Communication() {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] =useState<CommunicationTemplate | null>(null);

const [isEditOpen, setIsEditOpen] =useState(false);
const [search, setSearch] = useState("");
const [channelFilter, setChannelFilter] = useState("all");
const [isPreviewOpen, setIsPreviewOpen] = useState(false);


  useEffect(() => {
  loadTemplates();
}, []);

async function loadTemplates() {
  try {
    const data = await getTemplates();
    setTemplates(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
const filteredTemplates = templates.filter((template) => {
  const matchesSearch = template.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesChannel =
    channelFilter === "all" ||
    template.channel === channelFilter;

  return matchesSearch && matchesChannel;
});

const totalTemplates = templates.length;

const activeTemplates = templates.filter(
  (t) => t.is_active
).length;

const emailTemplates = templates.filter(
  (t) => t.channel === "email"
).length;

const totalChannels = new Set(
  templates.map((t) => t.channel)
).size;

if (loading) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-slate-500">Loading templates...</p>
    </div>
  );
}

  return (
    <div className="space-y-8">
      <div>
       <h1 className="text-3xl font-black text-slate-900 tracking-tight">
  Communication <span className="text-blue-600">Center</span>
</h1>

<p className="text-slate-500 font-medium mt-1">
  Manage email templates, broadcasts, automation and system communications.
</p>
      </div>

     <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <p className="text-sm text-slate-500">Templates</p>
    <h2 className="text-4xl font-bold mt-2">{totalTemplates}</h2>
  </div>

  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <p className="text-sm text-slate-500">Active</p>
    <h2 className="text-4xl font-bold mt-2">{activeTemplates}</h2>
  </div>

  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <p className="text-sm text-slate-500">Email</p>
    <h2 className="text-4xl font-bold mt-2">{emailTemplates}</h2>
  </div>

  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <p className="text-sm text-slate-500">Channels</p>
    <h2 className="text-4xl font-bold mt-2">{totalChannels}</h2>
  </div>

</div>

<div className="flex flex-col md:flex-row justify-between gap-4">

  <input
    type="text"
    placeholder="Search templates..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full md:w-96 px-4 py-3 border border-slate-200 rounded-xl"
  />

  <select
    value={channelFilter}
    onChange={(e) => setChannelFilter(e.target.value)}
    className="px-4 py-3 border border-slate-200 rounded-xl"
  >
    <option value="all">All Channels</option>
    <option value="email">Email</option>
    <option value="push">Push</option>
    <option value="sms">SMS</option>
  </select>

</div>

   <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden max-w-6xl mx-auto">

  <div className="overflow-x-auto flex justify-center">

    <table className="table-fixed w-[1150px]">

      <thead className="bg-slate-50">

        <tr className="text-left">

         <th className="w-[25%] px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
  Template
</th>

<th className="w-[12%] px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
  Channel
</th>

<th className="w-[12%] px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
  Status
</th>

<th className="w-[14%] px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
  Updated
</th>

<th className="w-[20%] px-30 py-4 text-xs font-semibold text-slate-500 uppercase">
  Actions
</th>

        </tr>

      </thead>

      <tbody>

        {filteredTemplates.map((tpl) => (

          <tr
            key={tpl.id}
            className="border-t border-slate-100 hover:bg-slate-50 transition"
          >

            <td className="px-6 py-4">

              <div className="font-semibold text-slate-800">
                {tpl.name}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {tpl.subject}
              </div>

            </td>

            <td className="px-6 py-5 capitalize">
              {tpl.channel}
            </td>

            <td className="px-6 py-5">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tpl.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {tpl.is_active ? "Active" : "Inactive"}
              </span>

            </td>

            <td className="px-6 py-5 text-sm text-slate-500">
              {new Date(tpl.updated_at).toLocaleDateString()}
            </td>

            <td className="px-6 py-5">

              <div className="flex items-center justify-end gap-2 whitespace-nowrap">

                <button
  onClick={() => {
    setSelectedTemplate(tpl);
    setIsPreviewOpen(true);
  }}
  className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50"
>
  Preview
</button>

               <button
  onClick={() => {
    setSelectedTemplate(tpl);
    setIsEditOpen(true);
  }}
  className="px-3 py-2 text-xs rounded-lg border hover:bg-slate-50"
>
  Edit
</button>

                <button className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Send Test
                </button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>
</div>
<EditCommunicationModal
  open={isEditOpen}
  template={selectedTemplate}
  onClose={() => {
    setIsEditOpen(false);
    setSelectedTemplate(null);
  }}
  onSaved={() => {
    loadTemplates();
  }}
/>
<PreviewCommunicationModal
  open={isPreviewOpen}
  template={selectedTemplate}
  onClose={() => {
    setIsPreviewOpen(false);
    setSelectedTemplate(null);
  }}
/>
</div>
);
}