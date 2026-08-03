type Props = {
  open: boolean;
  workflow: any;
  onClose: () => void;
};

export default function AutomationConfigModal({
  open,
  workflow,
  onClose,
}: Props) {
  if (!open || !workflow) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-xl">

        <div className="flex items-center justify-between px-8 py-6 border-b">

          <div>
            <h2 className="text-2xl font-bold">
              Configure Workflow
            </h2>

            <p className="text-slate-500 mt-1">
              {workflow.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl"
          >
            ×
          </button>

        </div>

        <div className="p-8">

          <div className="space-y-6">

  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Workflow Name
    </label>

    <input
      value={workflow.name}
      readOnly
      className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Description
    </label>

    <textarea
      value={workflow.description}
      readOnly
      rows={3}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
    />
  </div>

  <div className="grid grid-cols-2 gap-6">

    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Trigger Type
      </label>

      <input
        value={workflow.trigger_type}
        readOnly
        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Workflow Type
      </label>

      <input
        value={workflow.workflow_type}
        readOnly
        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
      />
    </div>

  </div>

</div>

        </div>

      </div>

    </div>
  );
}