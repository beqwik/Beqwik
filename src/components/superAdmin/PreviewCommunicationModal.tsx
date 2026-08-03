import { X } from "lucide-react";
import type { CommunicationTemplate } from "../../types/communication";
import logo from "../../assets/images/Beqwik-Logo-removebg-preview.png";

type Props = {
  open: boolean;
  template: CommunicationTemplate | null;
  onClose: () => void;
};

export default function PreviewCommunicationModal({
  open,
  template,
  onClose,
}: Props) {
  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

      <div className="bg-white rounded-3xl shadow-2xl w-[900px] max-w-[90vw] h-[820px] max-h-[92vh] flex flex-col overflow-hidden">

       {/* Header */}

<div className="px-8 py-6 border-b">

  <div className="flex items-start justify-between">

    <div className="flex items-center gap-5">

      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">

        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M3 8l9 6 9-6"/>
          <rect x="3" y="5" width="18" height="14" rx="2"/>
        </svg>

      </div>

      <div>

        <h2 className="text-2xl font-bold text-slate-900">
          Email Preview
        </h2>

        <p className="text-slate-500 mt-1">
          {template.name}
        </p>

      </div>

    </div>

    <button
      onClick={onClose}
      className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
    >
      <X className="w-6 h-6"/>
    </button>

  </div>

</div>

        {/* Subject */}
        <div className="px-8 py-6 bg-slate-50 border-b">

  <div className="grid grid-cols-3 gap-5">

  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">

    <p className="text-xs uppercase text-slate-500">
      From
    </p>

    <p className="font-semibold mt-1">
      no-reply@beqwik.com
    </p>

  </div>

  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

    <p className="text-xs uppercase text-slate-500">
      To
    </p>

    <p className="font-semibold mt-1">
      preview@beqwik.com
    </p>

  </div>

  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

    <p className="text-xs uppercase text-slate-500">
      Channel
    </p>

    <p className="font-semibold mt-1">
      {template.channel}
    </p>

  </div>
</div>
</div>

       {/* Email Preview */}

<div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 via-slate-100 to-slate-200 p-10">

  <div className="flex justify-center">
    <div className="w-full max-w-[700px]">

    <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-[0_25px_80px_rgba(15,23,42,0.15)]">
        <div className="flex justify-center mb-10">

<img
  src={logo}
  alt="BeQwik"
  className="h-20 w-auto mx-auto object-contain"
/>

</div>

<div className="flex justify-between items-center pb-8 border-b border-slate-200 mb-8">

  <div>

    <p className="text-xs uppercase text-slate-400">
      From
    </p>

    <p className="font-semibold">
      BeQwik Notifications
    </p>

    <p className="text-sm text-slate-500">
      no-reply@beqwik.com
    </p>

  </div>

  <div className="text-right">

    <p className="text-xs uppercase text-slate-400">
      Date
    </p>

    <p className="font-semibold">
      Today
    </p>

  </div>

</div>
     <p className="text-xs uppercase tracking-wider text-slate-400">
Subject
</p>

<h2 className="text-3xl font-bold leading-tight mt-4 mb-12 text-slate-900">
  {template.subject}
</h2>

      <div
  className="prose prose-slate max-w-none text-[15px] leading-7"
        dangerouslySetInnerHTML={{
          __html: template.body,
        }}
      />

    </div>
</div>
  </div>

</div>

        {/* Footer */}
        <div className="border-t bg-white px-8 py-5 flex justify-end">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}