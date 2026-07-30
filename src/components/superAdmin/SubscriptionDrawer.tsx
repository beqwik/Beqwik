import {
  X,
  CreditCard,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  renewal: any;
}

export default function SubscriptionDrawer({
  open,
  onClose,
  renewal,
}: Props) {
  if (!open || !renewal) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(renewal.end_date).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-[560px] bg-white z-50 shadow-2xl overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start px-6 py-6 border-b border-slate-200 bg-slate-50">
          <div>
  <h2 className="text-2xl font-black text-slate-900">
    Subscription Details
  </h2>

  <p className="mt-2 text-lg font-semibold text-slate-800">
    {renewal.organizations?.organization_name}
  </p>

  <p className="text-sm text-slate-500">
    {renewal.subscription_plans?.name} Plan
  </p>

  <span className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
    {renewal.status}
  </span>
</div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

       {/* Content */}
<div className="p-6 space-y-6">

  {/* Hero Card */}
  <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 text-white shadow-xl">

  <p className="text-blue-100 text-sm uppercase tracking-widest">
    Active Subscription
  </p>

  <h2 className="text-4xl font-black mt-2 tracking-tight">
    {renewal.subscription_plans?.name}
  </h2>

  <p className="text-xl font-semibold mt-2">
    ₹{Number(
      renewal.subscription_plans?.monthly_price ?? 0
    ).toLocaleString("en-IN")}
    <span className="text-lg font-normal text-blue-100">
      {" "}
      / month
    </span>
  </p>

  <div className="mt-6 flex justify-between">

    <div>
      <p className="text-blue-100 text-xs uppercase">
        Status
      </p>

      <p className="font-bold mt-1">
        {renewal.status}
      </p>
    </div>

    <div>
      <p className="text-blue-100 text-xs uppercase">
        Days Left
      </p>

      <p className="font-bold mt-1">
        {daysLeft}
      </p>
    </div>

  </div>

</div>

  {/* Subscription Card */}
  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-7">

    <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6">
  <CreditCard className="w-5 h-5 text-blue-600" />
  Subscription
</h3>

    <div className="space-y-4">

      <InfoRow
        label="Plan"
        value={renewal.subscription_plans?.name}
      />

      <InfoRow
        label="Amount"
        value={`₹${Number(
          renewal.subscription_plans?.monthly_price ?? 0
        ).toLocaleString("en-IN")}`}
      />

      <InfoRow
        label="Auto Renew"
        value={renewal.auto_renew ? "Enabled" : "Disabled"}
      />

      <InfoRow
        label="Status"
        value={renewal.status}
      />

    </div>

  </div>

  {/* Renewal Card */}
  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-7">

    <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6">
  <CalendarDays className="w-5 h-5 text-blue-600" />
  Renewal
</h3>
<div className="space-y-0">

  <InfoRow
    label="Start Date"
    value={new Date(renewal.start_date).toLocaleDateString()}
  />

  <InfoRow
    label="End Date"
    value={new Date(renewal.end_date).toLocaleDateString()}
  />

  <InfoRow
    label="Days Remaining"
    value={
      <span className="text-blue-600 font-bold">
        {daysLeft} Days
      </span>
    }
  />

  <div className="pt-5">

    <div className="flex justify-between text-sm mb-2">

      <span className="text-slate-500 font-medium">
        Subscription Progress
      </span>

      <span className="text-slate-900 font-semibold">
        {Math.min(Math.round((daysLeft / 30) * 100), 100)}%
      </span>

    </div>

    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">

      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
        style={{
          width: `${Math.min((daysLeft / 30) * 100, 100)}%`,
        }}
      />

    </div>

  </div>

</div>

  </div>

</div>

       </div>
  </> 
  );
}
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">

      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}   