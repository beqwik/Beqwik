import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import logo from "../../assets/images/Beqwik-Logo-removebg-preview.png";

interface Props {
  invoice: any;
  invoiceNumber: string;
}

const PRIMARY = "#2563eb";
const DARK = "#0f172a";
const LIGHT = "#64748b";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";
const SUCCESS_BG = "#dcfce7";
const SUCCESS = "#15803d";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 12,
    color: DARK,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 20,
    marginBottom: 35,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
  width: 85,
  height: 85,
  marginRight: 18,
},

  companyName: {
    fontSize: 30,
    fontWeight: "bold",
    color: PRIMARY,
  },

  companySub: {
    marginTop: 3,
    fontSize: 12,
    color: LIGHT,
  },

  paidBadge: {
    backgroundColor: SUCCESS_BG,
    color: SUCCESS,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 11,
  },

  invoiceTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    alignItems: "center",
  },

  invoiceTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: DARK,
  },

  invoiceNumber: {
    color: DARK,
    fontSize: 13,
    fontWeight: "bold",
  },

  topGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  card: {
    width: "47%",
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 18,
  },

  cardTitle: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  line: {
    marginBottom: 6,
    color: DARK,
    fontSize: 12,
  },

  label: {
    color: LIGHT,
    marginBottom: 3,
    fontSize: 9,
  },

  spacer: {
    height: 18,
  },

  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    color: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontWeight: "bold",
    fontSize: 11,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: "center",
  },

  colDescription: {
    width: "50%",
  },

  colQty: {
    width: "15%",
    textAlign: "center",
  },

  colPrice: {
    width: "17%",
    textAlign: "right",
  },

  colTotal: {
    width: "18%",
    textAlign: "right",
    fontWeight: "bold",
  },
});
export default function InvoicePDF({
  invoice,
  invoiceNumber,
}: Props) {

const paymentDate = invoice?.paid_at
  ? new Date(invoice.paid_at)
  : new Date();

const formattedDate = paymentDate.toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const amount = Number(invoice?.amount || 0);

return (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.logoRow}>
          <Image
            src={logo}
            style={styles.logo}
          />

          <View>
            <Text style={styles.companyName}>
              BeQwik
            </Text>

            <Text style={styles.companySub}>
              Business Management Platform
            </Text>
          </View>

        </View>

        <Text style={styles.paidBadge}>
          PAID
        </Text>

      </View>

      {/* INVOICE TITLE */}

      <View style={styles.invoiceTitleRow}>

        <Text style={styles.invoiceTitle}>
          INVOICE
        </Text>

        <Text style={styles.invoiceNumber}>
          {invoiceNumber}
        </Text>

      </View>

      {/* BILL TO & FROM */}

      <View style={styles.topGrid}>

        {/* BILL TO */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Bill To
          </Text>

          <Text style={styles.label}>Organization</Text>
          <Text style={styles.line}>
            {invoice.organizations?.organization_name || "Organization"}
          </Text>

          <Text style={styles.label}>Plan</Text>
          <Text style={styles.line}>
            {invoice.subscription_plans?.name || "BeQwik Professional Organization Subscription"}
            <Text
  style={{
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  }}
>
  Plan :
  {invoice.subscription_plans?.name || "Basic"}
</Text>
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.line}>
            {invoice.payment_status?.toUpperCase()}
          </Text>

        </View>

        {/* FROM */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            From
          </Text>

          <Text style={styles.line}>
            BeQwik Technologies
          </Text>

          <Text style={styles.line}>
            Pune, Maharashtra
          </Text>

          <Text style={styles.line}>
            support@beqwik.com
          </Text>

          <Text style={styles.line}>
            GST: XXXXXXXX
          </Text>

        </View>

      </View>

      {/* PAYMENT DETAILS */}

      <View style={styles.topGrid}>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Invoice Details
          </Text>

          <Text style={styles.label}>Invoice Number</Text>
          <Text style={styles.line}>{invoiceNumber}</Text>

          <Text style={styles.label}>Invoice Date</Text>
          <Text style={styles.line}>{formattedDate}</Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Payment Details
          </Text>

          <Text style={styles.label}>Payment ID</Text>
          <Text style={styles.line}>
            {invoice.transaction_id || "-"}
          </Text>

          <Text style={styles.label}>Payment Status</Text>
          <Text style={styles.line}>
            {invoice.payment_status}
          </Text>

        </View>

      </View>

      {/* BILLING TABLE */}

      <View style={styles.table}>

        <View style={styles.tableHeader}>

          <Text style={styles.colDescription}>
            Description
          </Text>

          <Text style={styles.colQty}>
            Qty
          </Text>

          <Text style={styles.colPrice}>
            Price
          </Text>

          <Text style={styles.colTotal}>
            Total
          </Text>

        </View>

        <View style={styles.tableRow}>

          <Text style={styles.colDescription}>
            {invoice.subscription_plans?.name || "Subscription Plan"}
          </Text>

          <Text style={styles.colQty}>
            1
          </Text>

          <Text style={styles.colPrice}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>

          <Text style={styles.colTotal}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>

        </View>

      </View>
            {/* TOTAL */}

      <View
        style={{
          alignItems: "flex-end",
          marginTop: 25,
        }}
      >
        <View
          style={{
            width: 260,
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 8,
            backgroundColor: BG,
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text>Subtotal</Text>

            <Text>
              ₹{amount.toLocaleString("en-IN")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text>Tax</Text>

            <Text>₹0</Text>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: BORDER,
              paddingTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              Total
            </Text>

            <Text
              style={{
                fontWeight: "bold",
                color: PRIMARY,
                fontSize: 12,
              }}
            >
              ₹{amount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      {/* NOTES */}

      <View
        style={{
          marginTop: 35,
          padding: 15,
          backgroundColor: "#eef5ff",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BORDER,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 6,
            color: PRIMARY,
          }}
        >
          Notes
        </Text>

        <Text
          style={{
            color: LIGHT,
            lineHeight: 1.6,
          }}
        >
          Thank you for choosing BeQwik.
          This invoice confirms that your subscription payment
          has been successfully received.
        </Text>
      </View>

      {/* FOOTER */}

      <View
        style={{
          marginTop: 25,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          paddingTop: 18,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: PRIMARY,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Thank You!
        </Text>

        <Text
          style={{
            color: LIGHT,
            marginBottom: 3,
          }}
        >
          We appreciate your business.
        </Text>

        <Text
          style={{
            color: LIGHT,
          }}
        >
          support@beqwik.com
        </Text>
      </View>

    </Page>
  </Document>
);
}