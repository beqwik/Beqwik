import { supabase } from "../supabase";

export async function getAnalyticsData() {
  try {
    const [
      organizations,
      payments,
      subscriptions,
      plans,
    ] = await Promise.all([
      supabase
        .from("organizations")
        .select("*"),

      supabase
        .from("payments")
        .select("*"),

      supabase
        .from("organization_subscriptions")
        .select("*"),

      supabase
        .from("subscription_plans")
        .select("*"),
    ]);

    if (organizations.error)
      console.error(
        "Organizations Error:",
        organizations.error
      );

    if (payments.error)
      console.error(
        "Payments Error:",
        payments.error
      );

    if (subscriptions.error)
      console.error(
        "Subscriptions Error:",
        subscriptions.error
      );

    if (plans.error)
      console.error(
        "Plans Error:",
        plans.error
      );

    return {
      organizations:
        organizations.data || [],

      payments:
        payments.data || [],

      subscriptions:
        subscriptions.data || [],

      plans:
        plans.data || [],
    };
  } catch (error) {
    console.error(
      "Analytics Error:",
      error
    );

    return {
      organizations: [],
      payments: [],
      subscriptions: [],
      plans: [],
    };
  }
}