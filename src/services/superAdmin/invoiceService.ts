import { supabase } from "../supabase";

export async function getInvoices() {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_status,
      paid_at,
      transaction_id,
      organizations (
        organization_name
      )
    `)
    .order("paid_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}