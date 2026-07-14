import { supabase } from "../supabase";
import type { RazorpayConfig } from "../../types/razorpayConfig";

export async function getRazorpayConfig(
  organizationId: string
): Promise<RazorpayConfig | null> {
  const { data, error } = await supabase
    .from("organization_razorpay_configs")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching Razorpay config:", error.message);
    return null;
  }

  return data;
}

export async function saveRazorpayConfig(
  config: Omit<RazorpayConfig, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("organization_razorpay_configs")
    .upsert(
      {
        organization_id: config.organization_id,
        razorpay_key_id: config.razorpay_key_id,
        razorpay_key_secret: config.razorpay_key_secret,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "organization_id",
      }
    );

  if (error) {
    console.error("Error saving Razorpay config:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteRazorpayConfig(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("organization_razorpay_configs")
    .delete()
    .eq("organization_id", organizationId);

  if (error) {
    console.error("Error deleting Razorpay config:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
