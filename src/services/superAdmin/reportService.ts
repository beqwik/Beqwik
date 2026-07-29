import { supabase } from "../supabase";

export async function getSystemReport(
  range: "7d" | "30d" | "month" | "year" = "30d"
) {
     const startDate = new Date();
  switch (range) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "month":
      startDate.setDate(1);
      break;

    case "year":
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
  }

  // Total Revenue
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("payment_status", "paid")
    .gte("paid_at", startDate.toISOString());

  const totalRevenue =
    payments?.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    ) ?? 0;

  // Total Organizations
  const { count: totalOrganizations } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true });

  // Active Subscriptions
  const { count: activeSubscriptions } = await supabase
    .from("organization_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Upcoming Renewals
  const { data: renewals } = await supabase
    .from("organization_subscriptions")
    .select("end_date")
    .eq("status", "active");

    const { data: plans } = await supabase
  .from("organization_subscriptions")
  .select(`
    subscription_plans (
      name
    )
  `)
  .eq("status", "active");

  const today = new Date();

  const upcomingRenewals =
    renewals?.filter((subscription) => {
      if (!subscription.end_date) return false;

      const renewalDate = new Date(subscription.end_date);
      const days =
        (renewalDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24);

      return days >= 0 && days <= 30;
    }).length ?? 0;

// Revenue grouped by month
const monthlyRevenue: Record<string, number> = {};

payments?.forEach((payment) => {
  if (!payment.paid_at) return;

  const month = new Date(payment.paid_at).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  monthlyRevenue[month] =
    (monthlyRevenue[month] || 0) + Number(payment.amount);
});

const revenueTrend = Object.entries(monthlyRevenue).map(
  ([month, amount]) => ({
    month,
    amount,
  })
);
  const distribution: Record<string, number> = {};

plans?.forEach((item: any) => {
  const name =
    item.subscription_plans?.name ?? "Unknown";

  distribution[name] =
    (distribution[name] || 0) + 1;
});

const planDistribution = Object.entries(distribution).map(
  ([name, value]) => ({
    name,
    value,
  })
);

const { data: recentPayments } = await supabase
  .from("payments")
  .select(`
    id,
    amount,
    paid_at,
    payment_status,
    transaction_id,
    organizations (
      organization_name,
      organization_subscriptions (
        subscription_plans (
          name
        )
      )
    )
  `)
  .eq("payment_status", "paid")
.gte("paid_at", startDate.toISOString())
.order("paid_at", { ascending: false })
.limit(5);

// Organization Audit Data

const { data: organizations } = await supabase
  .from("organizations")
  .select(`
    id,
    organization_name
  `);

const { data: students, error: studentError } = await supabase
  .from("students")
  .select("id, full_name, organization_id");

console.log("Student Error:", studentError);
console.log("Students:", students);
console.log("First Student:", students?.[0]);
console.log(
  "Type:",
  typeof students?.[0]?.organization_id
);

const { data: staff } = await supabase
  .from("staff")
  .select(`
    organization_id
  `);

const { data: subscriptions } = await supabase
  .from("organization_subscriptions")
  .select(`
    organization_id,
    status,
    created_at,
    subscription_plans (
      name
    )
  `);
console.table(students);
const organizationAudit =
  organizations?.map((org: any) => {

    const subscription =
      subscriptions?.find(
        (s: any) => s.organization_id === org.id
      );
console.log(
  "Org:",
  org.organization_name,
  org.id
);

const count =
  students?.filter((s: any) => {
    console.log(
      "Comparing:",
      s.organization_id,
      org.id,
      s.organization_id === org.id
    );

    return String(s.organization_id).trim() === String(org.id).trim();
  }).length ?? 0;

console.log("Student Count:", count);
    return {

      name: org.organization_name,

      plan:
        subscription?.subscription_plans?.name ?? "-",

      students: count,

      staff:
        staff?.filter(
          (s: any) => s.organization_id === org.id
        ).length ?? 0,

      lastActivity:
        subscription?.created_at ??
        new Date().toISOString(),

      status:
        subscription?.status === "active"
          ? "Active"
          : "Inactive",
    };

  }) ?? [];
const activeOrganizations =
  organizationAudit.filter(
    (o) => o.status === "Active"
  ).length;

const inactiveOrganizations =
  organizationAudit.filter(
    (o) => o.status === "Inactive"
  ).length;

const totalStudents =
  organizationAudit.reduce(
    (sum, org) => sum + org.students,
    0
  );

  return {
  totalRevenue,
  totalOrganizations: totalOrganizations ?? 0,
  activeSubscriptions: activeSubscriptions ?? 0,
  upcomingRenewals,

  revenueTrend,
  planDistribution,
  recentPayments,

  activeOrganizations,
  inactiveOrganizations,
  totalStudents,

  organizations: organizationAudit,
};
}