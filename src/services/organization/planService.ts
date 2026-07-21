import { supabase } from "../supabase";

export interface GymPlan {
  id: string;
  organization_id: string;
  name: string;
  price: number;
  duration_months: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export async function getGymPlans(organizationId: string): Promise<GymPlan[]> {
  const { data, error } = await supabase
    .from("gym_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch gym_plans table:", error.message);
    return [];
  }
  return data || [];
}

export async function createGymPlan(plan: Omit<GymPlan, "id">): Promise<GymPlan> {
  const { data, error } = await supabase
    .from("gym_plans")
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleGymPlanStatus(planId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("gym_plans")
    .update({ is_active: isActive })
    .eq("id", planId);

  if (error) throw error;
}

export async function deleteGymPlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_plans")
    .delete()
    .eq("id", planId);

  if (error) throw error;
}
