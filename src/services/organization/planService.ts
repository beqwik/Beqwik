import { supabase } from "../supabase";

export interface MemberSubscriptionPlan {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  meals_per_day: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getGymPlans(
  organizationId: string
): Promise<MemberSubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("member_subscription_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch member_subscription_plans:", error.message);
    return [];
  }

  return data || [];
}

export async function createGymPlan(
  plan: Omit<MemberSubscriptionPlan, "id" | "created_at" | "updated_at">
): Promise<MemberSubscriptionPlan> {
  const { data, error } = await supabase
    .from("member_subscription_plans")
    .insert(plan)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function toggleGymPlanStatus(
  planId: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("member_subscription_plans")
    .update({ active })
    .eq("id", planId);

  if (error) throw error;
}

export async function deleteGymPlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from("member_subscription_plans")
    .delete()
    .eq("id", planId);

  if (error) throw error;
}