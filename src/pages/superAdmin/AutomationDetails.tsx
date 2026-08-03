import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../services/supabase";

export default function AutomationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    enabled: false,
    trigger_type: "",
    retry_attempts: 0,
    schedule: "",
    cron_expression: "",
    notification_template: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  async function fetchWorkflow() {
    setLoading(true);

    const { data, error } = await supabase
      .from("automation_workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Unable to load workflow.");
      setLoading(false);
      return;
    }

    setWorkflow(data);

    setFormData({
      name: data.name || "",
      description: data.description || "",
      enabled: data.enabled,
      trigger_type: data.trigger_type || "",
      retry_attempts: data.retry_attempts || 0,
      schedule: data.schedule || "",
      cron_expression: data.cron_expression || "",
      notification_template: data.notification_template || "",
    });

    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const { error } = await supabase
      .from("automation_workflows")
      .update({
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        trigger_type: formData.trigger_type,
        retry_attempts: formData.retry_attempts,
        schedule: formData.schedule,
        cron_expression: formData.cron_expression,
        notification_template: formData.notification_template,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Failed to update workflow.");
      return;
    }

    toast.success("Workflow updated successfully.");

    fetchWorkflow();
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-slate-500 text-lg">
          Loading workflow...
        </div>
      </div>
    );
  }

  function renderRenewalSettings() {
  return (
    <div className="space-y-8">

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Reminder Schedule
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Select when renewal reminders should be sent.
        </p>

        <div className="mt-5 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span>7 Days Before Expiry</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span>3 Days Before Expiry</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            <span>1 Day Before Expiry</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" />
            <span>On Expiry Date</span>
          </label>

        </div>
      </div>

      <hr />

      <div>

        <h3 className="text-lg font-semibold text-slate-900">
          Recipients
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Student
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Parent
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" />
            Organization Admin
          </label>

        </div>

      </div>

      <hr />

      <div>

        <h3 className="text-lg font-semibold text-slate-900">
          Notification Channels
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Email
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Push Notification
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" />
            SMS
          </label>

        </div>

      </div>

    </div>
  );
}

function renderPaymentSettings() {
  return (
    <div className="space-y-8">

      <div>

        <h3 className="text-lg font-semibold">
          Recipients
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Student
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Parent
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" />
            Organization Admin
          </label>

        </div>

      </div>

      <hr />

      <div>

        <h3 className="text-lg font-semibold">
          Notification Channels
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Email
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Push Notification
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" />
            SMS
          </label>

        </div>

      </div>

      <hr />

      <div className="flex items-center justify-between rounded-xl border p-5">

        <div>

          <h4 className="font-semibold">
            Generate Invoice Automatically
          </h4>

          <p className="text-sm text-slate-500">
            Automatically create an invoice after payment.
          </p>

        </div>

        <input
          type="checkbox"
          defaultChecked
        />

      </div>

    </div>
  );
}

function renderInvoiceSettings() {
  return (
    <div className="space-y-8">

      <div>
        <label className="block mb-2 text-sm font-medium">
          Invoice Prefix
        </label>

        <input
          type="text"
          defaultValue="BEQ-"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">
          Starting Invoice Number
        </label>

        <input
          type="number"
          defaultValue={1001}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div>

        <h3 className="text-lg font-semibold">
          Invoice Format
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="radio" name="invoice-format" defaultChecked />
            PDF
          </label>

          <label className="flex items-center gap-3">
            <input type="radio" name="invoice-format" />
            PDF + Email
          </label>

        </div>

      </div>

      <div className="flex items-center justify-between rounded-xl border p-5">

        <div>

          <h4 className="font-semibold">
            Auto Generate Invoice
          </h4>

          <p className="text-sm text-slate-500">
            Automatically generate invoices after successful payment.
          </p>

        </div>

        <input
          type="checkbox"
          defaultChecked
        />

      </div>

    </div>
  );
}

function renderBackupSettings() {
  return (
    <div className="space-y-8">

      <div>

        <label className="block mb-2 text-sm font-medium">
          Backup Time
        </label>

        <input
          type="time"
          defaultValue="03:00"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <div>

        <label className="block mb-2 text-sm font-medium">
          Retention Period (Days)
        </label>

        <input
          type="number"
          defaultValue={30}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <hr />

      <div>

        <h3 className="text-lg font-semibold">
          Backup Includes
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Database
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Uploaded Files
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Logs
          </label>

        </div>

      </div>

    </div>
  );
}

function renderSuspensionSettings() {
  return (
    <div className="space-y-8">

      <div>

        <label className="block mb-2 text-sm font-medium">
          Grace Period
        </label>

        <select className="w-full rounded-xl border border-slate-300 px-4 py-3">

          <option>Immediately</option>
          <option>1 Day</option>
          <option>3 Days</option>
          <option>7 Days</option>

        </select>

      </div>

      <hr />

      <div>

        <h3 className="text-lg font-semibold">
          Suspension Actions
        </h3>

        <div className="mt-4 space-y-3">

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Disable QR Access
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Block Meal Booking
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Disable Login
          </label>

        </div>


      </div>

    </div>
  );
}

function renderWorkflowSettings() {
  if (!workflow) return null;

  switch (workflow.workflow_type) {
    case "renewal":
      return renderRenewalSettings();

    case "payment":
      return renderPaymentSettings();

    case "invoice":
      return renderInvoiceSettings();

    case "backup":
      return renderBackupSettings();

    case "suspension":
      return renderSuspensionSettings();

    default:
      return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-700">
            No Settings Available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            This automation doesn't have configurable settings yet.
          </p>
        </div>
      );
  }
}
function getStatusColor() {
  return workflow?.enabled
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

return (
  <div className="space-y-8">

    <button
      onClick={() => navigate(-1)}
      className="text-blue-600 font-semibold hover:text-blue-700"
    >
      ← Back
    </button>

    <div className="flex items-start justify-between">

      <div>
        <h1 className="text-4xl font-black text-slate-900">
          {workflow?.name}
        </h1>

        <p className="mt-2 text-slate-500">
          {workflow?.description}
        </p>
      </div>

      <span
        className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor()}`}
      >
        {workflow?.enabled ? "Active" : "Disabled"}
      </span>

    </div>

    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* LEFT */}
      <div className="xl:col-span-3">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold">
            {workflow?.name} Settings
          </h2>

          <p className="mt-2 text-slate-500">
            Configure the settings for this workflow.
          </p>

          <div className="mt-8">
            {renderWorkflowSettings()}
          </div>

          <div className="mt-8 border-t pt-6 flex justify-end gap-4">

            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div className="xl:col-span-1">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold">
            Automation Overview
          </h2>

          <div className="mt-8 space-y-5">

            <div>
              <p className="text-sm text-slate-500">Workflow Type</p>
              <p className="font-semibold capitalize">
                {workflow?.workflow_type}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Trigger Type</p>
              <p className="font-semibold capitalize">
                {workflow?.trigger_type}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-semibold">
                {workflow?.enabled ? "Active" : "Disabled"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Retry Attempts</p>
              <p className="font-semibold">
                {workflow?.retry_attempts}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Schedule</p>
              <p className="font-semibold">
                {workflow?.schedule || "-"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
);

}

// function renderPaymentSettings() {
//   return (
//     <div className="space-y-8">

//       {/* Recipients */}
//       <div>
//         <h3 className="text-lg font-semibold text-slate-900">
//           Recipients
//         </h3>

//         <p className="text-sm text-slate-500 mb-4">
//           Select who should receive the payment confirmation.
//         </p>

//         <div className="space-y-3">

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             <span>Student</span>
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             <span>Parent</span>
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" />
//             <span>Organization Admin</span>
//           </label>

//         </div>
//       </div>

//       <hr />

//       {/* Channels */}
//       <div>
//         <h3 className="text-lg font-semibold text-slate-900">
//           Notification Channels
//         </h3>

//         <p className="text-sm text-slate-500 mb-4">
//           Choose how notifications will be sent.
//         </p>

//         <div className="space-y-3">

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             <span>Email</span>
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             <span>Push Notification</span>
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" />
//             <span>SMS</span>
//           </label>

//         </div>
//       </div>

//       <hr />

//       {/* Invoice */}
//       <div className="flex items-center justify-between rounded-xl border p-5">

//         <div>
//           <h4 className="font-semibold">
//             Generate Invoice Automatically
//           </h4>

//           <p className="text-sm text-slate-500">
//             Automatically create an invoice after every successful payment.
//           </p>
//         </div>

//         <input
//           type="checkbox"
//           defaultChecked
//         />

//       </div>

//     </div>
//   );
// }

// function renderInvoiceSettings() {
//   return (
//     <div className="space-y-8">

//       {/* Invoice Prefix */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Invoice Prefix
//         </label>

//         <input
//           type="text"
//           defaultValue="BEQ-"
//           className="w-full rounded-xl border border-slate-300 px-4 py-3"
//         />
//       </div>

//       {/* Starting Number */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Starting Invoice Number
//         </label>

//         <input
//           type="number"
//           defaultValue={1001}
//           className="w-full rounded-xl border border-slate-300 px-4 py-3"
//         />
//       </div>

//       {/* Invoice Format */}
//       <div>
//         <h3 className="text-lg font-semibold mb-4">
//           Invoice Format
//         </h3>

//         <label className="flex items-center gap-3 mb-3">
//           <input type="radio" name="format" defaultChecked />
//           PDF
//         </label>

//         <label className="flex items-center gap-3">
//           <input type="radio" name="format" />
//           PDF + Email
//         </label>
//       </div>

//       {/* Auto Generate */}
//       <div className="flex items-center justify-between border rounded-xl p-5">

//         <div>
//           <h4 className="font-semibold">
//             Auto Generate Invoice
//           </h4>

//           <p className="text-sm text-slate-500">
//             Automatically generate an invoice after payment.
//           </p>
//         </div>

//         <input
//           type="checkbox"
//           defaultChecked
//         />

//       </div>

//     </div>
//   );
// }

// function renderBackupSettings() {
//   return (
//     <div className="space-y-8">

//       {/* Backup Time */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Backup Time
//         </label>

//         <input
//           type="time"
//           defaultValue="03:00"
//           className="w-full rounded-xl border border-slate-300 px-4 py-3"
//         />
//       </div>

//       {/* Retention */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Retention Period (Days)
//         </label>

//         <input
//           type="number"
//           defaultValue={30}
//           className="w-full rounded-xl border border-slate-300 px-4 py-3"
//         />
//       </div>

//       <hr />

//       <div>
//         <h3 className="text-lg font-semibold mb-4">
//           Backup Includes
//         </h3>

//         <div className="space-y-3">

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Database
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Uploaded Files
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Logs
//           </label>

//         </div>
//       </div>

//     </div>
//   );
// }

// function renderSuspensionSettings() {
//   return (
//     <div className="space-y-8">

//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Grace Period
//         </label>

//         <select
//           className="w-full rounded-xl border border-slate-300 px-4 py-3"
//         >
//           <option>Immediately</option>
//           <option>1 Day</option>
//           <option>3 Days</option>
//           <option>7 Days</option>
//         </select>
//       </div>

//       <hr />

//       <div>

//         <h3 className="text-lg font-semibold mb-4">
//           Suspension Actions
//         </h3>

//         <div className="space-y-3">

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Disable QR Access
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Block Meal Booking
//           </label>

//           <label className="flex items-center gap-3">
//             <input type="checkbox" defaultChecked />
//             Disable Login
//           </label>

//         </div>

//       </div>

//     </div>
//   );
// }

// function renderWorkflowSettings() {
//   switch (workflow?.workflow_type) {
//     case "renewal":
//       return renderRenewalSettings();

//     case "payment":
//       return renderPaymentSettings();

//     case "invoice":
//       return renderInvoiceSettings();

//     case "backup":
//       return renderBackupSettings();

//     case "suspension":
//       return renderSuspensionSettings();

//     default:
//   return (
//     <div className="text-slate-500">
//       No settings available for this workflow.
//     </div>
//   );
//   }
// }


// return (
//   <div className="space-y-8">
//     {/* Back Button */}
//     <button
//       onClick={() => navigate(-1)}
//       className="text-blue-600 font-semibold hover:text-blue-700"
//     >
//       ← Back
//     </button>

//     {/* Header */}
//     <div className="flex items-start justify-between">
//       <div>
//         <h1 className="text-4xl font-black text-slate-900">
//           {workflow?.name}
//         </h1>

//         <p className="text-slate-500 mt-2">
//           {workflow?.description}
//         </p>
//       </div>

//       <span
//         className={`px-4 py-2 rounded-full text-sm font-semibold ${
//           workflow?.enabled
//             ? "bg-green-100 text-green-700"
//             : "bg-red-100 text-red-700"
//         }`}
//       >
//         {workflow?.enabled ? "Active" : "Disabled"}
//       </span>
//     </div>

//     {/* Main Layout */}
//     <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

//       {/* LEFT */}
//       <div className="lg:col-span-3">

//         <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

//           <h2 className="text-2xl font-bold">
//   {workflow?.name} Settings
// </h2>

// <p className="text-slate-500 mt-1">
//   Configure the settings for this automation workflow.
// </p>

//           <div className="mt-8">
//   {renderWorkflowSettings()}
// </div>

// <div className="border-t border-slate-200 mt-8 pt-6 flex justify-end gap-4">

//   <button
//     onClick={() => navigate(-1)}
//     className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
//   >
//     Cancel
//   </button>

//   <button
//     onClick={handleSave}
//     disabled={saving}
//     className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//   >
//     {saving ? "Saving..." : "Save Changes"}
//   </button>

// </div>
//  </div>
       
//       {/* RIGHT */}
//       <div className="xl:col-span-1">

//         <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

//           <h2 className="text-xl font-bold">
//            Automation Overview
//           </h2>

//           <div className="mt-8 space-y-6">

//             <div>
//               <p className="text-sm text-slate-500">
//                 Workflow Type
//               </p>

//               <p className="font-semibold capitalize mt-1">
//                 {workflow?.workflow_type}
//               </p>
//             </div>

//             <div>
//               <p className="text-sm text-slate-500">
//                 Trigger Type
//               </p>

//               <p className="font-semibold capitalize mt-1">
//                 {workflow?.trigger_type}
//               </p>
//             </div>

//             <div>
//               <p className="text-sm text-slate-500">
//                 Status
//               </p>

//               <p className="font-semibold mt-1">
//                 {workflow?.enabled ? "Active" : "Disabled"}
//               </p>
//             </div>

//             <div>
//               <p className="text-sm text-slate-500">
//                 Retry Attempts
//               </p>

//               <p className="font-semibold mt-1">
//                 {workflow?.retry_attempts}
//               </p>
//             </div>

//             <div>
//               <p className="text-sm text-slate-500">
//                 Schedule
//               </p>

//               <p className="font-semibold mt-1">
//                 {workflow?.schedule || "-"}
//               </p>
//             </div>

//           </div>

//         </div>

//       </div>
//     </div>
// );
// }