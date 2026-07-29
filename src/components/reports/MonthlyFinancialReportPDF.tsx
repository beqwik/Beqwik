import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import logo from "../../assets/images/Beqwik-Logo-removebg-preview.png";

interface Payment {
  organization: string;
  amount: number;
  date: string;
  status: string;
}

interface Props {
  generatedOn: string;
  reportPeriod: string;

  totalRevenue: number;
  totalOrganizations: number;
  activeSubscriptions: number;
  upcomingRenewals: number;

  payments: Payment[];
}

const PRIMARY = "#2563EB";
const DARK = "#111827";
const LIGHT = "#64748B";
const BORDER = "#E5E7EB";
const BG = "#F8FAFC";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 36,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: 11,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  logo: {
    width: 62,
    height: 62,
    marginRight: 16,
  },

  companySection: {
    justifyContent: "center",
  },

  company: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },

  tagline: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 3,
  },

  titleSection: {
    marginBottom: 26,
  },

  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },

  titleBlue: {
    color: "#2563EB",
  },

  underline: {
    width: 52,
    height: 3,
    backgroundColor: "#2563EB",
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 2,
  },

  description: {
    fontSize: 12,
    color: "#64748B",
  },
  infoCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 10,
  paddingVertical: 18,
  paddingHorizontal: 22,
  marginBottom: 28,
},

infoBlock: {
  flex: 1,
},

infoLabel: {
  fontSize: 10,
  fontFamily: "Helvetica-Bold",
  color: "#2563EB",
  textTransform: "uppercase",
  marginBottom: 6,
},

infoValue: {
  fontSize: 15,
  fontFamily: "Helvetica-Bold",
  color: "#111827",
},

divider: {
  width: 1,
  height: 42,
  backgroundColor: "#D1D5DB",
  marginHorizontal: 20,
},
kpiContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 22,
},

kpiCard: {
  width: "23.5%",
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 10,
  backgroundColor: "#FFFFFF",
  overflow: "hidden",
},

kpiAccent: {
  height: 5,
  backgroundColor: "#2563EB",
},

kpiContent: {
  paddingVertical: 22,
  paddingHorizontal: 16,
},

kpiLabel: {
  fontSize: 9,
  color: "#64748B",
  textTransform: "uppercase",
  marginBottom: 8,
},

kpiValue: {
  fontSize: 24,
  fontFamily: "Helvetica-Bold",
  color: "#111827",
},
tableContainer: {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 30,
},

tableHeader: {
  backgroundColor: "#2563EB",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 12,
  paddingHorizontal: 20,
},

tableTitle: {
  fontSize: 16,
  fontFamily: "Helvetica-Bold",
  color: "#FFFFFF",
},

tableCount: {
  fontSize: 12,
  fontFamily: "Helvetica-Bold",
  color: "#DBEAFE",
},

columnHeader: {
  flexDirection: "row",
  backgroundColor: "#F8FAFC",
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
  paddingVertical: 10,
  paddingHorizontal: 20,
},

columnText: {
  fontSize: 10,
  fontFamily: "Helvetica-Bold",
  color: "#64748B",
  textTransform: "uppercase",
},

row: {
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#F1F5F9",
  paddingVertical: 12,
  paddingHorizontal: 20,
},

cell: {
  fontSize: 11,
  color: "#111827",
},
amountCell: {
  fontSize: 11,
  fontFamily: "Helvetica-Bold",
  color: "#111827",
},

statusPaid: {
  color: "#16A34A",
  fontFamily: "Helvetica-Bold",
},

statusPending: {
  color: "#D97706",
  fontFamily: "Helvetica-Bold",
},
footer: {
  position: "absolute",
  left: 36,
  right: 36,
  bottom: 28,
  paddingTop: 14,
  borderTopWidth: 2,
  borderTopColor: "#2563EB",
},

footerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},

footerLeft: {
  fontSize: 10,
  color: "#64748B",
},

footerRight: {
  fontSize: 10,
  color: "#64748B",
},

pageNumber: {
  textAlign: "center",
  fontSize: 9,
  color: "#64748B",
},
});

export default function MonthlyFinancialReportPDF(props: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

  {/* Header */}
  <View style={styles.header}>
    <Image src={logo} style={styles.logo} />

    <View style={styles.companySection}>
      <Text style={styles.company}>BeQwik</Text>

      <Text style={styles.tagline}>
        Simplify. Manage. Grow.
      </Text>
    </View>
  </View>

  {/* Report Title */}
  <View style={styles.titleSection}>
    <Text style={styles.title}>
      MONTHLY{" "}
      <Text style={styles.titleBlue}>
        FINANCIAL STATEMENT
      </Text>
    </Text>

    <View style={styles.underline} />

    <Text style={styles.description}>
      Overview of key financial metrics and recent transactions
    </Text>
  </View>
 {/* Information Card */}
  <View style={styles.infoCard}>

    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>
        Generated On
      </Text>

      <Text style={styles.infoValue}>
        {props.generatedOn}
      </Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>
        Report Period
      </Text>

      <Text style={styles.infoValue}>
        {props.reportPeriod}
      </Text>
    </View>

  </View>
  {/* KPI Cards */}

<View style={styles.kpiContainer}>

  <View style={styles.kpiCard}>
    <View style={styles.kpiAccent} />
    <View style={styles.kpiContent}>
      <Text style={styles.kpiLabel}>Revenue</Text>
      <Text style={styles.kpiValue}>
        {props.totalRevenue.toLocaleString()}
      </Text>
    </View>
  </View>

  <View style={styles.kpiCard}>
    <View style={styles.kpiAccent} />
    <View style={styles.kpiContent}>
      <Text style={styles.kpiLabel}>Organizations</Text>
      <Text style={styles.kpiValue}>
        {props.totalOrganizations}
      </Text>
    </View>
  </View>

  <View style={styles.kpiCard}>
    <View style={styles.kpiAccent} />
    <View style={styles.kpiContent}>
      <Text style={styles.kpiLabel}>Subscriptions</Text>
      <Text style={styles.kpiValue}>
        {props.activeSubscriptions}
      </Text>
    </View>
  </View>

  <View style={styles.kpiCard}>
    <View style={styles.kpiAccent} />
    <View style={styles.kpiContent}>
      <Text style={styles.kpiLabel}>Renewals</Text>
      <Text style={styles.kpiValue}>
        {props.upcomingRenewals}
      </Text>
    </View>
  </View>

</View>
{/* Recent Payments */}

<View style={styles.tableContainer}>

  {/* Table Header */}
  <View style={styles.tableHeader}>
    <Text style={styles.tableTitle}>
      Recent Payments
    </Text>

    <Text style={styles.tableCount}>
      {props.payments.length} Transactions
    </Text>
  </View>

  {/* Column Names */}
  <View style={styles.columnHeader}>

    <View style={{ width: "40%" }}>
      <Text style={styles.columnText}>Organization</Text>
    </View>

    <View style={{ width: "20%" }}>
      <Text style={styles.columnText}>Date</Text>
    </View>

    <View style={{ width: "20%" }}>
      <Text style={styles.columnText}>Status</Text>
    </View>

    <View style={{ width: "20%", alignItems: "flex-end" }}>
      <Text style={styles.columnText}>Amount</Text>
    </View>

  </View>

  {/* Rows */}

  {props.payments.map((payment, index) => (

    <View
      key={index}
      style={[
        styles.row,
        index === props.payments.length - 1
          ? { borderBottomWidth: 0 }
          : {},
      ]}
    >

      <View style={{ width: "40%" }}>
        <Text style={styles.cell}>
          {payment.organization}
        </Text>
      </View>

      <View style={{ width: "20%" }}>
        <Text style={styles.cell}>
          {new Date(payment.date).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
        </Text>
      </View>

      <View style={{ width: "20%" }}>
        <Text
          style={
            payment.status.toLowerCase() === "paid"
              ? styles.statusPaid
              : styles.statusPending
          }
        >
          {payment.status}
        </Text>
      </View>

      <View style={{ width: "20%", alignItems: "flex-end" }}>
        <Text style={styles.amountCell}>
          INR {payment.amount.toLocaleString()}
        </Text>
      </View>

    </View>

  ))}

</View>
{/* Footer */}

<View style={styles.footer}>

  <View style={styles.footerRow}>

    <Text style={styles.footerLeft}>
      Generated by BeQwik
    </Text>

    <Text style={styles.footerRight}>
      Confidential Financial Report
    </Text>

  </View>

  <Text
    style={styles.pageNumber}
    render={({ pageNumber, totalPages }) =>
      `Page ${pageNumber} of ${totalPages}`
    }
    fixed
  />

</View>
</Page>
    </Document>
  );
}