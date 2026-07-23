import { supabase } from "../supabase";

// =====================================
// GET ALL SUBSCRIPTIONS
// =====================================
export async function getMemberSubscriptions(
  memberId: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getMemberSubscriptions error:", error.message);
    return [];
  }

  return data || [];
}

// =====================================
// GET ACTIVE SUBSCRIPTION
// =====================================
export async function getActiveSubscription(
  memberId: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("member_id", memberId)
    .eq("status", "active")
    .maybeSingle();

  if (error) return null;

  return data;
}

// =====================================
// GET CURRENT SUBSCRIPTION
// =====================================
export async function getCurrentSubscription(
  memberId: string
) {
  return getActiveSubscription(memberId);
}

// =====================================
// PURCHASE SUBSCRIPTION
// (called after successful payment)
// =====================================
export async function purchaseSubscription(
  payload: any
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// =====================================
// CANCEL SUBSCRIPTION
// =====================================
export async function cancelSubscription(
  subscriptionId: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled"
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// =====================================
// RENEW SUBSCRIPTION
// =====================================
export async function renewSubscription(
  subscriptionId: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      end_date: endDate
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

