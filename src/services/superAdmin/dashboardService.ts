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

    console.log("=======================================");

    if (
      organizationsResult.error ||
      membersResult.error ||
      subscriptionRevenueResult.error ||
      subscriptionsResult.error ||
      organizationTypesResult.error
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

      // Prefer snapshot price (actual amount paid); fall back to current plan price for old records
      const price =
        subscription.price_at_purchase != null
          ? Number(subscription.price_at_purchase)
          : Number(subscription.subscription_plans?.monthly_price ?? 0);

      return total + price;
    },
    0
  ) || 0;

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

    return {
      organizations: organizationsResult.count ?? 0,
      members: membersResult.count ?? 0,
      revenue: totalRevenue,
      subscriptions: subscriptionsResult.count ?? 0,
      organizationTypes,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return {
      organizations: 0,
      members: 0,
      revenue: 0,
      subscriptions: 0,
      organizationTypes: [],
    };
  }
}