import { supabase } from "./supabase";

export async function getOrganizationContext() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orgUser } = await supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!orgUser) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgUser.organization_id)
    .single();

  const { data: subscription } = await supabase
    .from("organization_subscriptions")
    .select(`
      *,
      subscription_plans(*)
    `)
    .eq("organization_id", orgUser.organization_id)
    .single();

  return {
    organization,
    subscription,
  };
}