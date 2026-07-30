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
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
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
    paddingBottom: 12,
    marginBottom: 18,
  },
labelBold: {
  fontFamily: "Helvetica-Bold",
  fontSize: 11,
  color: DARK,
},

value: {
  fontFamily: "Helvetica",
  fontSize: 11,
  color: DARK,
},
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
  width: 60,
  height: 60,
  marginRight: 14,
},

  companyName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },

  companySub: {
    marginTop: 2,
    fontSize: 10,
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
    marginBottom: 16,
    alignItems: "center",
  },

  invoiceTitle: {
    fontSize: 28,
   fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  invoiceNumber: {
    color: DARK,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },

  topGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  card: {
    width: "47%",
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
  },

  cardTitle: {
    color: PRIMARY,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },

 line: {
  marginBottom: 6,
  color: DARK,
  fontSize: 11,
  lineHeight: 1.5,
},

  label: {
    color: LIGHT,
    marginBottom: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
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
    textAlign: "right",
    paddingRight: 12,
},

  colPrice: {
   width: "15%",
    textAlign: "right",
    paddingRight: 12,
  },

  colTotal: {
    width: "15%",
    textAlign: "right",
    paddingRight: 12,
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

const planName =
  invoice.organizations?.organization_subscriptions?.[0]?.subscription_plans?.name ?? "-";

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

<View
  style={{
    flexDirection: "row",
    marginBottom: 6,
  }}
>
  <Text style={styles.labelBold}>Organization: </Text>

  <Text style={styles.value}>
    {invoice.organizations?.organization_name || "-"}
  </Text>
</View>

<View
  style={{
    flexDirection: "row",
    marginBottom: 6,
  }}
>
  <Text style={styles.labelBold}>Plan: </Text>

  <Text style={styles.value}>
    {planName}
  </Text>
</View>

<View
  style={{
    flexDirection: "row",
    marginBottom: 6,
  }}
>
  <Text style={styles.labelBold}>Status: </Text>

  <Text style={styles.value}>
    {invoice.payment_status?.toUpperCase() || "-"}
  </Text>
</View>
        
</View>
        {/* FROM */}

        <View style={styles.card}>

          <Text style={styles.cardTitle}>From</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Company: </Text>
  BeQwik Technologies
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Location: </Text>
  Pune, Maharashtra
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Email: </Text>
  support@beqwik.com
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>GST: </Text>
  XXXXXXXX
</Text>

        </View>

      </View>

      {/* PAYMENT DETAILS */}

      <View style={styles.topGrid}>

        <View style={styles.card}>

         <Text style={styles.cardTitle}>
  Invoice Details
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Invoice No: </Text>
  {invoiceNumber}
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Invoice Date: </Text>
  {formattedDate}
</Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
  Payment Details
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Payment ID: </Text>
  {invoice.transaction_id || "-"}
</Text>

<Text style={styles.line}>
  <Text style={{ fontWeight: "bold" }}>Status: </Text>
  {invoice.payment_status?.toUpperCase() || "-"}
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
 {planName !== "-"
  ? `${planName} Subscription`
  : "Subscription Plan"}
</Text>

          <Text style={styles.colQty}>
            1
          </Text>

          <Text style={styles.colPrice}>
            INR {amount.toLocaleString("en-IN")}
          </Text>

          <Text style={styles.colTotal}>
            INR {amount.toLocaleString("en-IN")}
          </Text>

        </View>

      </View>
            {/* TOTAL */}

      <View
        style={{
          alignItems: "flex-end",
          marginTop: 12,
        }}
      >
        <View
          style={{
            width: 260,
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 8,
            backgroundColor: BG,
            padding: 12,
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
              INR {amount.toLocaleString("en-IN")}
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

            <Text>INR 0</Text>
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
                fontFamily: "Helvetica-Bold",
                fontSize: 12,
              }}
            >
              Total
            </Text>

            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                color: PRIMARY,
                fontSize: 12,
              }}
            >
              INR {amount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      {/* NOTES */}

      <View
        style={{
          marginTop: 16,
          padding: 10,
          backgroundColor: "#eef5ff",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BORDER,
        }}
      >
        <Text
          style={{
            fontFamily: "Helvetica-Bold",
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
          marginTop: 16,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          paddingTop: 12,
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