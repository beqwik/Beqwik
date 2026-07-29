import { supabase } from "../supabase";

export interface GymMember {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "member" | "trainer";
  active: boolean;
  join_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// GET ALL GYM MEMBERS for an organization
// =====================================================
export async function getGymMembers(organizationId: string): Promise<GymMember[]> {
  const { data, error } = await supabase
    .from("gym_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGymMembers error:", error.message);
    return [];
  }
  return (data as GymMember[]) || [];
}

// =====================================================
// GET SINGLE GYM MEMBER BY ID
// =====================================================
export async function getGymMemberById(memberId: string): Promise<GymMember | null> {
  const { data, error } = await supabase
    .from("gym_members")
    .select("*")
    .eq("id", memberId)
    .single();

  if (error) return null;
  return data as GymMember;
}

// =====================================================
// UPDATE GYM MEMBER PROFILE
// =====================================================
export async function updateGymMember(
  memberId: string,
  payload: Partial<GymMember>
): Promise<GymMember> {
  const { data, error } = await supabase
    .from("gym_members")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data as GymMember;
}

// =====================================================
// TOGGLE GYM MEMBER ACTIVE STATUS
// =====================================================
export async function toggleGymMember(
  memberId: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase
    .from("gym_members")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) throw error;
}

// =====================================================
// DELETE GYM MEMBER (also removes credentials)
// =====================================================
export async function deleteGymMember(memberId: string): Promise<void> {
  // Remove credentials first (no FK cascade since we dropped the constraint)
  await supabase
    .from("member_credentials")
    .delete()
    .eq("member_id", memberId);

  const { error } = await supabase
    .from("gym_members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
}
