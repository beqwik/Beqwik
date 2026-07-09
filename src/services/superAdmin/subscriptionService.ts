import { supabase } from "../supabase";

export interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;

  organizations: {
    organization: string;
  };

  subscription_plans: {
    name: string;
    monthly_price: number;
  };
}

export interface SubscriptionPlanRow {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  max_members: number | null;
  max_staff: number | null;
  active: boolean;
  features?: string[] | null;
  created_at?: string;
}

export interface CreatePlanPayload {
  name: string;
  description: string;
  monthly_price: number;
  max_members: number | null;
  max_staff: number | null;
  features: string[];
}

// ─── Organization Subscriptions ───────────────────────────────────────────────

export async function getSubscriptions() {
  try {
    const { data, error } = await supabase
      .from("organization_subscriptions")
      .select(`
        id,
        status,
        start_date,
        end_date,
        auto_renew,
        created_at,
        organizations (
          organization_name
        ),
        subscription_plans (
          name,
          monthly_price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Subscription Service Error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected Subscription Error:", err);
    return [];
  }
}

// ─── Subscription Plans CRUD ──────────────────────────────────────────────────

export async function getSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("monthly_price", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSubscriptionPlan(
  payload: CreatePlanPayload
): Promise<SubscriptionPlanRow> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: payload.name,
      description: payload.description || null,
      monthly_price: payload.monthly_price,
      max_members: payload.max_members,
      max_staff: payload.max_staff,
      features: payload.features || [],
      active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscriptionPlan(
  id: string,
  payload: Partial<CreatePlanPayload>
): Promise<SubscriptionPlanRow> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .update({
      name: payload.name,
      description: payload.description ?? null,
      monthly_price: payload.monthly_price,
      max_members: payload.max_members,
      max_staff: payload.max_staff,
      features: payload.features,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function togglePlanActive(
  id: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("subscription_plans")
    .update({ active })
    .eq("id", id);

  if (error) throw error;
}

export async function deletePlan(id: string): Promise<void> {
  const { error } = await supabase
    .from("subscription_plans")
    .delete()
    .eq("id", id);

  if (error) throw error;
}