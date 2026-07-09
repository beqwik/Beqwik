import { supabase } from "../supabase";

// ======================================
// GET MEMBER BY ID
// ======================================
export async function getMemberById(
  memberId: string
) {
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
export async function getMemberByEmail(
  email: string
) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;

  return data;
}

// ======================================
// UPDATE MEMBER
// ======================================
export async function updateMember(
  memberId: string,
  payload: any
) {
  const { data, error } = await supabase
    .from("members")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ======================================
// DEACTIVATE MEMBER
// ======================================
export async function deactivateMember(
  memberId: string
) {
  const { data, error } = await supabase
    .from("members")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
}