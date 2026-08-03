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

  const [
  paymentsResult,
  organizationsCountResult,
  activeSubscriptionsResult,
  renewalsResult,
  plansResult,
] = await Promise.all([

  supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("payment_status", "paid")
    .gte("paid_at", startDate.toISOString()),

  supabase
    .from("organizations")
    .select("*", { count: "exact", head: true }),

  supabase
    .from("organization_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active"),

  supabase
    .from("organization_subscriptions")
    .select("end_date")
    .eq("status", "active"),

  supabase
    .from("organization_subscriptions")
    .select(`
      subscription_plans (
        name
      )
    `)
    .eq("status", "active"),

]);

const payments = paymentsResult.data;

const totalOrganizations = organizationsCountResult.count;
const activeSubscriptions = activeSubscriptionsResult.count;
const renewals = renewalsResult.data;
const plans = plansResult.data;

const totalRevenue =
  payments?.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  ) ?? 0;

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

const [
  recentPaymentsResult,
  organizationsResult,
  studentsResult,
  staffResult,
  subscriptionsResult,
] = await Promise.all([

  supabase
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
    .limit(5),

  supabase
    .from("organizations")
    .select(`
      id,
      organization_name
    `),

  supabase
    .from("students")
    .select("organization_id"),

  supabase
    .from("staff")
    .select("organization_id"),

  supabase
    .from("organization_subscriptions")
    .select(`
      organization_id,
      status,
      created_at,
      subscription_plans (
        name
      )
    `),

]);

const recentPayments = recentPaymentsResult.data;
const organizations = organizationsResult.data;
const students = studentsResult.data;
const staff = staffResult.data;
const subscriptions = subscriptionsResult.data;

const studentCounts: Record<string, number> = {};
const staffCounts: Record<string, number> = {};

students?.forEach((s: any) => {
  const id = String(s.organization_id);

  studentCounts[id] = (studentCounts[id] || 0) + 1;
});

staff?.forEach((s: any) => {
  const id = String(s.organization_id);

  staffCounts[id] = (staffCounts[id] || 0) + 1;
});

const organizationAudit =
  organizations?.map((org: any) => {

    const subscription =
      subscriptions?.find(
        (s: any) => s.organization_id === org.id
      );


const count =
  studentCounts[String(org.id)] || 0;

    return {

      name: org.organization_name,

      plan:
        subscription?.subscription_plans?.name ?? "-",

      students: count,

     staff:
  staffCounts[String(org.id)] || 0,

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