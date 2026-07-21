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
      memberId,
      organizationId,
      memberPlanId,
    } = await req.json();

    if (!memberId) {
      throw new Error("memberId is required.");
    }

    if (!organizationId) {
      throw new Error("organizationId is required.");
    }

    if (!memberPlanId) {
      throw new Error("memberPlanId is required.");
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
    // Fetch Member Subscription Plan
    // =====================================================

    const {
      data: memberPlan,
      error: memberPlanError,
    } = await supabase
      .from("member_subscription_plans")
      .select("*")
      .eq("id", memberPlanId)
      .eq("organization_id", organizationId)
      .eq("active", true)
      .single();

    if (memberPlanError || !memberPlan) {
      throw new Error(
        memberPlanError?.message ??
        "Member subscription plan not found."
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
      .eq("organization_id", organizationId)
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

    const today = new Date();

    const expiryDate = new Date(today);

    expiryDate.setDate(
      expiryDate.getDate() +
      memberPlan.duration_days
    );

        // =====================================================
    // Create Pending Subscription
    // =====================================================

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("subscriptions")
      .insert({
        member_id: memberId,
        organization_id: organizationId,

        subscription_plan_id: memberPlan.id,

        amount: memberPlan.price,
        amount_paid: 0,

        payment_status: "pending",
        status: "pending",

        start_date: today.toISOString(),
        end_date: expiryDate.toISOString(),

        payment_gateway: "razorpay",
      })
      .select()
      .single();

    if (subscriptionError || !subscription) {
      throw new Error(
        subscriptionError?.message ??
        "Unable to create subscription."
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
console.log("Amount:", Math.round(memberPlan.price * 100));
console.log("Receipt:", receipt);

order = await createOrder(
  razorpayConfig.razorpay_key_id.trim(),
  razorpayConfig.razorpay_key_secret.trim(),
  Math.round(memberPlan.price * 100),
  receipt
);
    } catch (err) {
      // Rollback subscription if Razorpay fails

      await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscription.id);

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

      await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscription.id);

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
        organization_id: organizationId,

        member_id: memberId,

        subscription_id: subscription.id,

        amount: memberPlan.price,

        currency: "INR",

        payment_method: "razorpay",

        razorpay_order_id: order.id,

        status: "pending",

        verified: false,
      });

    if (transactionError) {

      // Rollback everything

      await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscription.id);

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
      "MEMBER CREATE ORDER ERROR:",
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