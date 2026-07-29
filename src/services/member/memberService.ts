import { supabase } from "../supabase";

// ======================================
// GET MEMBER BY ID (checks gym_members first)
// ======================================
export async function getMemberById(memberId: string) {
  // Try gym_members first
  const { data: gymMember } = await supabase
    .from("gym_members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (gymMember) return gymMember;

  // Fallback to generic members table
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();

  if (error) throw error;
  return data;
}

// ======================================
// GET MEMBER BY EMAIL
// ======================================
export async function getMemberByEmail(email: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
}

// ======================================
// UPDATE MEMBER (gym_members or members)
// ======================================
export async function updateMember(memberId: string, payload: any) {
  // Try gym_members first
  const { data: gymCheck } = await supabase
    .from("gym_members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();

  if (gymCheck) {
    const { data, error } = await supabase
      .from("gym_members")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", memberId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Fallback to generic members table
  const { data, error } = await supabase
    .from("members")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ======================================
// DEACTIVATE MEMBER (gym_members or members)
// ======================================
export async function deactivateMember(memberId: string) {
  // Try gym_members first
  const { data: gymCheck } = await supabase
    .from("gym_members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();

  if (gymCheck) {
    const { data, error } = await supabase
      .from("gym_members")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", memberId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Fallback
  const { data, error } = await supabase
    .from("members")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}