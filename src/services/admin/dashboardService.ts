import { supabase } from "../supabase";

export interface DashboardData {
  organization: any;
  organizationSubscription: any;
  members: any[];
  memberSubscriptions: any[];
  notifications: any[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  // --------------------------------------------------
  // Find Organization of Logged in Admin
  // --------------------------------------------------

  const { data: orgUser, error: orgUserError } = await supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (orgUserError) throw orgUserError;

  const organizationId = orgUser.organization_id;

  // --------------------------------------------------
  // Organization + SaaS Plan
  // --------------------------------------------------

  const [organizationResult, saasSubscriptionResult] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single(),

      supabase
        .from("organization_subscriptions")
        .select(
          `
          *,
          subscription_plans(*)
        `
        )
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ]);

  if (organizationResult.error) throw organizationResult.error;

  // --------------------------------------------------
  // Members
  // --------------------------------------------------

  const { data: memberCredentials, error: credentialError } =
    await supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId);

  if (credentialError) throw credentialError;

  const memberIds =
    memberCredentials?.map((m) => m.member_id) ?? [];

  let members: any[] = [];
  let memberSubscriptions: any[] = [];
  let notifications: any[] = [];

  if (memberIds.length > 0) {
    const [
      membersResult,
      subscriptionsResult,
      notificationsResult,
    ] = await Promise.all([
      supabase
        .from("members")
        .select("*")
        .in("id", memberIds)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("subscriptions")
        .select("*")
        .in("member_id", memberIds)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("member_notifications")
        .select("*")
        .in("member_id", memberIds)
        .order("created_at", {
          ascending: false,
        })
        .limit(10),
    ]);

    if (membersResult.error)
      throw membersResult.error;

    if (subscriptionsResult.error)
      throw subscriptionsResult.error;

    if (notificationsResult.error)
      throw notificationsResult.error;

    members = membersResult.data ?? [];
    memberSubscriptions =
      subscriptionsResult.data ?? [];
    notifications =
      notificationsResult.data ?? [];
  }

  return {
    organization: organizationResult.data,
    organizationSubscription:
      saasSubscriptionResult.data,
    members,
    memberSubscriptions,
    notifications,
  };
}