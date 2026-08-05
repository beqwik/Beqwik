import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { createOrder } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const {
  organizationId,
  subscriptionPlanId,
} = await req.json();

if (!organizationId) {
  throw new Error("organizationId is required.");
}

if (!subscriptionPlanId) {
  throw new Error("subscriptionPlanId is required.");
}

    
    const supabaseUrl =
      Deno.env.get("PROJECT_URL") ||
      Deno.env.get("SUPABASE_URL")!;

    const serviceRoleKey =
      Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

   // =====================================================
// Fetch Pending Subscription
// =====================================================

const {
  data: plan,
  error: planError,
} = await supabase
  .from("subscription_plans")
  .select("*")
  .eq("id", subscriptionPlanId)
  .single();

  console.log("========== PLAN ==========");
console.log("Plan ID:", plan?.id);
console.log("Plan Name:", plan?.name);
console.log("Monthly Price:", plan?.monthly_price);

if (planError || !plan) {
  throw new Error(
    planError?.message ??
    "Subscription plan not found."
  );
}

// =====================================================
// Beqwik Razorpay Configuration
// =====================================================

const keyId = Deno.env.get("RAZORPAY_KEY_ID");
const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

if (!keyId || !keySecret) {
  throw new Error("Razorpay credentials are not configured.");
}
    // =====================================================
    // Create Razorpay Order
    // =====================================================

    const receipt = `ORG-${organizationId.substring(0,12)}`;

    let order;

    try {
      console.log("VERSION 2 RUNNING");
      console.log("========== RAZORPAY DEBUG ==========");
console.log("Key ID:", keyId);
console.log(
  "Secret Length:",
  keySecret.length
);
console.log(
  "Amount:",
  Math.round(Number(plan.monthly_price) * 100)
);

order = await createOrder(
  keyId.trim(),
  keySecret.trim(),
  Math.round(Number(plan.monthly_price) * 100),
  receipt
);

} catch (error) {
  throw error;
}

// =====================================================
// Success Response
// =====================================================

return new Response(
  JSON.stringify({
    success: true,
    orderId: order.id,
    keyId: keyId,
    amount: order.amount,
    currency: order.currency,
  }),
  {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);

} catch (error: any) {

  console.error(
    "ORGANIZATION CREATE PAYMENT ORDER ERROR:",
    error
  );

  return new Response(
    JSON.stringify({
      success: false,
      message: error?.message,
      stack: error?.stack,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );

}

});