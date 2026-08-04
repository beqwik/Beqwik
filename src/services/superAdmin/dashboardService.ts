import { supabase } from "../supabase";

export interface OrganizationType {
  organization_type: string;
  count: number;
}

export interface DashboardStats {
  organizations: number;
  members: number;
  revenue: number;
  subscriptions: number;
  organizationTypes: OrganizationType[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // ==========================================================
    // AUTH DEBUG
    // ==========================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("======================================");
    console.log("SUPABASE AUTH USER");
    console.log(user);
    console.log("AUTH ERROR");
    console.log(authError);

    // Check is_super_admin()
    const {
      data: isSuperAdmin,
      error: superAdminError,
    } = await supabase.rpc("is_super_admin");

    console.log("is_super_admin()");
    console.log(isSuperAdmin);
    console.log("is_super_admin ERROR");
    console.log(superAdminError);
    console.log("======================================");

    // ==========================================================
    // DASHBOARD QUERIES
    // ==========================================================

    const [
  organizationsResult,
  membersResult,
  subscriptionRevenueResult,
  subscriptionsResult,
  paymentsResult,
  organizationTypesResult,
] = await Promise.all([
      supabase
        .from("organizations")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("members")
        .select("*", {
          count: "exact",
          head: true,
        }),

     supabase
  .from("organization_subscriptions")
  .select(`
    status,
    end_date,
    price_at_purchase,
    subscription_plans (
      monthly_price
    )
  `),
    supabase
        .from("organization_subscriptions")
        .select("*", {
          count: "exact",
          head: true,
        }),
        supabase
  .from("payments")
  .select("amount, paid_at")
  .eq("payment_status", "paid"),

      supabase
        .from("organizations")
        .select("organization_type"),
    ]);

   // ==========================================================
// QUERY DEBUG
// ==========================================================

console.log("=========== DASHBOARD DEBUG ===========");

console.log("Organizations");
console.log(organizationsResult);

console.log("Members");
console.log(membersResult);

console.log("Subscription Revenue");
console.log(subscriptionRevenueResult);

console.log("Subscriptions");
console.log(subscriptionsResult);

console.log("Organization Types");
console.log(organizationTypesResult);

console.log("PAYMENTS RESULT");
console.log(paymentsResult);

console.table(paymentsResult.data);

console.log("PAYMENTS ERROR");
console.log(paymentsResult.error);

console.log("ORGANIZATION TYPES");
console.log(organizationTypesResult.data);

console.log("=======================================");

    if (
  organizationsResult.error ||
  membersResult.error ||
  subscriptionRevenueResult.error ||
  subscriptionsResult.error ||
  organizationTypesResult.error ||
  paymentsResult.error
) {
      console.error("Dashboard Query Errors", {
        organizations: organizationsResult.error,
        members: membersResult.error,
        payments: subscriptionRevenueResult.error,
        subscriptions: subscriptionsResult.error,
        organizationTypes: organizationTypesResult.error,
      });

      throw new Error("Failed to fetch dashboard data.");
    }

    const totalRevenue =
  subscriptionRevenueResult.data?.reduce(
    (total: number, subscription: any) => {
      if (subscription.status !== "active") return total;

      const price =
        subscription.price_at_purchase != null
          ? Number(subscription.price_at_purchase)
          : Number(subscription.subscription_plans?.monthly_price ?? 0);

      return total + price;
    },
    0
  ) || 0;
         
       const today = new Date();

const expiringSoon =
  subscriptionRevenueResult.data?.filter((subscription: any) => {
    if (!subscription.end_date) return false;

    const end = new Date(subscription.end_date);

    const diffDays =
      (end.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 7;
  }).length ?? 0;

    const typeMap = new Map<string, number>();

    organizationTypesResult.data?.forEach((org: any) => {
      const type = org.organization_type || "Other";

      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const organizationTypes = Array.from(typeMap).map(
      ([organization_type, count]) => ({
        organization_type,
        count,
      })
    );
    const monthlyRevenue = new Map<string, number>();

paymentsResult.data?.forEach((payment: any) => {
  const month = new Date(payment.paid_at).toLocaleString("default", {
    month: "short",
  });

  monthlyRevenue.set(
    month,
    (monthlyRevenue.get(month) || 0) + Number(payment.amount)
  );
});

const revenueTrend = Array.from(monthlyRevenue).map(
  ([name, revenue]) => ({
    name,
    revenue,
  })
);

    return {
  organizations: organizationsResult.count ?? 0,
  members: membersResult.count ?? 0,
  revenue: totalRevenue,
  subscriptions: subscriptionsResult.count ?? 0,

  organizationTypes,

  revenueTrend,

  kpis: {
    trialOrganizations: 0,
    activeOrganizations: subscriptionsResult.count ?? 0,
    expiringSoon: expiringSoon,
    pendingPayments: 0,
  },
};
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return {
  organizations: 0,
  members: 0,
  revenue: 0,
  subscriptions: 0,
  organizationTypes: [],
  revenueTrend: [],
};
  }
}