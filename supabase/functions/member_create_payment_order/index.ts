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

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      throw new Error("subscriptionId is required.");
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
  data: subscription,
  error: subscriptionError,
} = await supabase
  .from("subscriptions")
  .select("*")
  .eq("id", subscriptionId)
  .single();

if (subscriptionError || !subscription) {
  throw new Error(
    subscriptionError?.message ??
    "Subscription not found."
  );
}

if (subscription.status !== "pending") {
  throw new Error(
    "Only pending subscriptions can be paid."
  );
}

// =====================================================
// Check Existing Pending Transaction
// =====================================================

const {
  data: existingTransaction,
} = await supabase
  .from("payment_transactions")
  .select("id")
  .eq("subscription_id", subscription.id)
  .eq("status", "pending")
  .maybeSingle();

if (existingTransaction) {
  throw new Error(
    "A payment is already pending for this subscription."
  );
}

// =====================================================
// Fetch Razorpay Configuration
// =====================================================

const {
  data: razorpayConfig,
  error: razorpayConfigError,
} = await supabase
  .from("organization_razorpay_configs")
  .select("*")
  .eq(
    "organization_id",
    subscription.organization_id
  )
  .single();

if (
  razorpayConfigError ||
  !razorpayConfig
) {
  throw new Error(
    razorpayConfigError?.message ??
    "Razorpay configuration not found."
  );
}
    // =====================================================
    // Create Razorpay Order
    // =====================================================

    const receipt = `MEMBER-${subscription.id.substring(
      0,
      12
    )}`;

    let order;

    try {
      console.log("========== RAZORPAY DEBUG ==========");
console.log("Key ID:", razorpayConfig.razorpay_key_id);
console.log(
  "Secret Length:",
  razorpayConfig.razorpay_key_secret.length
);
console.log(
  "Amount:",
  Math.round(Number(subscription.amount) * 100)
);

order = await createOrder(
  razorpayConfig.razorpay_key_id.trim(),
  razorpayConfig.razorpay_key_secret.trim(),
  Math.round(Number(subscription.amount) * 100),
  receipt
);
    } catch (err) {
      // Rollback subscription if Razorpay fails

      throw err;
    }

    // =====================================================
    // Save Razorpay Order ID
    // =====================================================

    const {
      error: updateSubscriptionError,
    } = await supabase
      .from("subscriptions")
      .update({
        razorpay_order_id: order.id,
      })
      .eq("id", subscription.id);

    if (updateSubscriptionError) {


      throw updateSubscriptionError;
    }

        // =====================================================
    // Create Payment Transaction
    // =====================================================

    const {
  error: transactionError,
} = await supabase
  .from("payment_transactions")
  .insert({
    organization_id: subscription.organization_id,

    member_id: subscription.member_id,

    subscription_id: subscription.id,

    amount: subscription.amount,

    currency: "INR",

    payment_method: "razorpay",

    razorpay_order_id: order.id,

    status: "pending",

    verified: false,
  });

    if (transactionError) {

      throw transactionError;
    }

    // =====================================================
    // Success Response
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,

        subscriptionId: subscription.id,

        orderId: order.id,

        keyId: razorpayConfig.razorpay_key_id,

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
      "MEMBER CREATE PAYMENT ORDER ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message ?? "Unknown Error",
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