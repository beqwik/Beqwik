import { supabase } from "../supabase";

export async function getOrganizations() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}