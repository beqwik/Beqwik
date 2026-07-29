import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import MonthlyFinancialReportPDF from "../../components/reports/MonthlyFinancialReportPDF";
import ActiveOrganizationAuditPDF from "../../components/reports/ActiveOrganizationAuditPDF";

interface Payment {
  organization: string;
  amount: number;
  date: string;
  status: string;
}

interface ReportData {
  generatedOn: string;
  reportPeriod: string;

  totalRevenue: number;
  totalOrganizations: number;
  activeSubscriptions: number;
  upcomingRenewals: number;

  payments: Payment[];
}
interface Organization {
  name: string;
  plan: string;
  students: number;
  staff: number;
  lastActivity: string;
  status: "Active" | "Inactive";
}

interface AuditReportData {
  generatedOn: string;

  totalOrganizations: number;
  activeOrganizations: number;
  inactiveOrganizations: number;
  totalStudents: number;

  organizations: Organization[];
}

export async function exportMonthlyFinancialReport(
  report: ReportData
) {
  const blob = await pdf(
    <MonthlyFinancialReportPDF
      generatedOn={report.generatedOn}
      reportPeriod={report.reportPeriod}
      totalRevenue={report.totalRevenue}
      totalOrganizations={report.totalOrganizations}
      activeSubscriptions={report.activeSubscriptions}
      upcomingRenewals={report.upcomingRenewals}
      payments={report.payments}
    />
  ).toBlob();

  saveAs(blob, "Monthly-Financial-Statement.pdf");
}
export async function exportActiveOrganizationAudit(
  report: AuditReportData
) {
  const blob = await pdf(
    <ActiveOrganizationAuditPDF
      generatedOn={report.generatedOn}
      totalOrganizations={report.totalOrganizations}
      activeOrganizations={report.activeOrganizations}
      inactiveOrganizations={report.inactiveOrganizations}
      totalStudents={report.totalStudents}
      organizations={report.organizations}
    />
  ).toBlob();

  saveAs(blob, "Active-Organization-Audit.pdf");
}