import { supabase } from "../supabase";

export async function verifyRazorpay(
  keyId: string,
  keySecret: string
) {
  const { data, error } = await supabase.functions.invoke(
    "verify-organization-razorpay",
    {
        body: {
            keyId,
            keySecret,
        },
    }
);

  if (error) {
    throw error;
  }

  return data;
}