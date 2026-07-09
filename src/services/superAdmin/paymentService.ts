import { supabase } from "../supabase";

export async function getPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("paid_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}