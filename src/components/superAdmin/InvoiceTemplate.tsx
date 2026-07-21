import React, { forwardRef } from "react";

interface InvoiceTemplateProps {
  invoice: any;
  invoiceNumber: string;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
({ invoice, invoiceNumber }, ref) => {
  return (
    <div
  ref={ref}
  id="invoice-template"
  className="w-[794px] bg-[#f6f8fc] p-10"
>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

        {/* Header */}

        <div className="px-10 pt-10 pb-8">

          <div className="flex justify-between items-start">

            <div>

              <div className="flex items-center gap-4">

  <img
    src="/images/beqwik-logo.png"
    alt="BeQwik"
    className="h-14 w-auto"
  />

  <div>

    <h1 className="text-4xl font-black text-slate-900">
      BeQwik
    </h1>

    <p className="text-slate-500 text-sm">
      Business Management Platform
    </p>

  </div>

</div>

            </div>

            <div className="text-right">

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-5 py-2">

<div className="h-3 w-3 rounded-full bg-emerald-500"></div>

<span className="font-bold text-emerald-700">

PAID

</span>

</div>

              <h2 className="text-xl font-bold mt-5 text-slate-900">
                {invoiceNumber}
              </h2>

            </div>

          </div>

          <div className="border-b border-slate-200 mt-8"></div>

        </div>

        {/* Information */}

        <div className="grid grid-cols-2 gap-14 px-10 py-8">

          {/* Left */}

          <div>

            <h3 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-5">

              Bill To

            </h3>

            <h2 className="text-2xl font-bold text-slate-900">

              {invoice.organizations?.organization_name || "Organization"}

            </h2>

            <div className="space-y-3 mt-6 text-slate-600">

              <div>

                <span className="font-semibold">
                  Organization
                </span>

                <p>
                  {invoice.organizations?.organization_name}
                </p>

              </div>

              <div>

                <span className="font-semibold">
                  Email
                </span>

                <p>
                  support@beqwik.com
                </p>

              </div>

              <div>

                <span className="font-semibold">
                  Contact
                </span>

                <p>
                  +91 XXXXX XXXXX
                </p>

              </div>

            </div>

          </div>

          {/* Right */}

          <div>

            <h3 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-5">

              Invoice Details

            </h3>

            <div className="space-y-4">

              <Detail
                title="Invoice Number"
                value={invoiceNumber}
              />

              <Detail
                title="Invoice Date"
                value={new Date(invoice.paid_at).toLocaleDateString()}
              />

              <Detail
                title="Payment Method"
                value="Razorpay"
              />

              <Detail
                title="Payment Status"
                value={invoice.payment_status}
                success
              />

              <Detail
                title="Payment ID"
                value={invoice.transaction_id}
              />
<Detail
    title="Transaction ID"
    value={invoice.transaction_id}
/>
            </div>

          </div>

                </div>

        {/* Billing Table */}

        <div className="px-10">

          <table className="w-full border border-slate-200 rounded-xl overflow-hidden">

            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left px-5 py-3">Subscription Plan</th>
                <th className="text-center px-5 py-3">Qty</th>
                <th className="text-right px-5 py-3">Unit Price</th>
                <th className="text-right px-5 py-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-5 py-4 border-t">
                  BeQwik Professional Organization Subscription
                </td>

                <td className="text-center border-t">
                  1
                </td>

                <td className="text-right px-5 border-t">
                  ₹{Number(invoice.amount).toLocaleString("en-IN")}
                </td>

                <td className="text-right px-5 border-t font-semibold">
                  ₹{Number(invoice.amount).toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>

          </table>

        </div>

        {/* Totals */}

        <div className="flex justify-end px-10 mt-8">

          <div className="w-80">

            <div className="flex justify-between py-2">
              <span>Subtotal</span>
              <span>₹{Number(invoice.amount).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between py-2">
    <span>GST</span>
    <span>₹0.00</span>
</div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 flex justify-between">

              <span className="font-bold text-blue-700">
                Total Amount
              </span>

              <span className="font-black text-blue-700">
                ₹{Number(invoice.amount).toLocaleString("en-IN")}
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="px-10 py-10">

          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">

            <h3 className="text-blue-700 font-bold text-lg">
              Thank you for choosing BeQwik.This invoice confirms that your subscription payment
has been successfully received.
            </h3>

            <p className="text-slate-500 mt-2">
            Need assistance?
              <span className="text-blue-600 font-semibold">
                {" "}support@beqwik.com
              </span>
            </p>

          </div>

        </div>

      </div>

    </div>

    );
});

function Detail({
  title,
  value,
  success = false,
}: {
  title: string;
  value: any;
  success?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-3">

      <span className="font-semibold text-slate-500">

        {title}

      </span>

      <span
        className={`font-bold ${
          success
            ? "text-emerald-600"
            : "text-slate-800"
        }`}
      >
        {value}
      </span>

    </div>
       
  );
}

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;