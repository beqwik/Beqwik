import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { updateTemplate } from "../../services/communicationService";
import type { CommunicationTemplate } from "../../types/communication";

type Props = {
  open: boolean;
  template: CommunicationTemplate | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditCommunicationModal({
  open,
  template,
  onClose,
  onSaved,
}: Props) {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);

useEffect(() => {
  if (template) {
    setName(template.name);
    setSubject(template.subject);
    setBody(template.body);
  }
}, [template]);
  if (!open || !template) return null;

  async function handleSave() {
  if (!template) return;

  try {
    setSaving(true);

    await updateTemplate(template.id, {
      name,
      subject,
      body,
    });

    onSaved();
    onClose();
  } catch (err) {
    console.error(err);
    alert("Failed to save template.");
  } finally {
    setSaving(false);
  }
}

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-xl">

       <div className="flex items-start justify-between pb-6 border-b border-slate-200">

  <div className="flex items-center gap-4">

    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">

      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 8l9 6 9-6" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>

    </div>

    <div>

      <h2 className="text-3xl font-bold text-slate-900">
        Edit Email Template
      </h2>

      <p className="text-slate-500 mt-1">
        Modify your communication template.
      </p>

    </div>

  </div>

  <button
    onClick={onClose}
    className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
  >
    <X className="w-6 h-6" />
  </button>

</div>
        <div className="space-y-5">

          <div>
            <label className="text-sm font-medium">
              Template Name
            </label>

            <input
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full mt-2 border rounded-xl px-4 py-3"
/>
          </div>
<div className="grid grid-cols-3 gap-4">

  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

    <p className="text-xs uppercase tracking-wide text-slate-500">
      Channel
    </p>

    <p className="mt-2 font-semibold text-slate-800">
      {template.channel}
    </p>

  </div>

  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

    <p className="text-xs uppercase tracking-wide text-slate-500">
      Slug
    </p>

    <p className="mt-2 font-semibold text-slate-800 break-all">
      {template.slug}
    </p>

  </div>

  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

    <p className="text-xs uppercase tracking-wide text-slate-500">
      Status
    </p>

    <span
      className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
        template.is_active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {template.is_active ? "Active" : "Inactive"}
    </span>

  </div>

</div>
          <div>
            <label className="text-sm font-medium">
              Subject
            </label>

           <input
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  className="w-full mt-2 border rounded-xl px-4 py-3"
/>
          </div>

          <div>
            <label className="text-sm font-medium">
              Body
            </label>

            <textarea
             value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full mt-2 border rounded-xl px-4 py-3 resize-y"
            />
            
          </div>
         <div className="flex justify-end gap-3 pt-6 mt-6 border-t">

  <button
  onClick={handleSave}
  disabled={saving}
  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
>
  {saving ? "Saving..." : "Save Changes"}
</button>

</div>
        </div>

      </div>

    </div>
  );
}