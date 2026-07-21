import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "../../components/superAdmin/InvoicePDF";

export async function downloadInvoice(
  invoice: any,
  invoiceNumber: string
) {
  const blob = await pdf(
    <InvoicePDF
      invoice={invoice}
      invoiceNumber={invoiceNumber}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoiceNumber}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}