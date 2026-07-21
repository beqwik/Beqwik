import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { paymentId, organizationId, subscriptionPlanId } = await req.json();

    if (!paymentId || !organizationId || !subscriptionPlanId) {
      throw new Error(
        "Missing required parameters: paymentId, organizationId, subscriptionPlanId"
      );
    }

    const supabaseUrl =
      Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get the plan details from DB
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", subscriptionPlanId)
      .single();

    if (planError || !plan) {
      throw new Error(
        `Subscription plan not found: ${planError?.message || ""}`
      );
    }

    // 2. Verify payment with Razorpay
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    let isVerified = false;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.warn(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment variables. Falling back to Mock/Sandbox mode."
      );
      // Bypassing verification for local development/sandbox
      isVerified = true;
    } else {
      // Direct payment verification via Razorpay API
      const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rzpResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        }
      );

      if (!rzpResponse.ok) {
        const errorText = await rzpResponse.text();
        throw new Error(
          `Razorpay verification API call failed: ${rzpResponse.status} ${errorText}`
        );
      }

      const paymentData = await rzpResponse.json();

      if (
        paymentData.status !== "captured" &&
        paymentData.status !== "authorized"
      ) {
        throw new Error(
          `Payment verification failed: Status is ${paymentData.status}`
        );
      }

      // Check if currency is INR
      if (paymentData.currency !== "INR") {
        throw new Error(
          `Invalid payment currency: Expected INR, got ${paymentData.currency}`
        );
      }

      // Check if payment amount is correct (Razorpay amounts are in paise, so monthly_price * 100)
      const expectedAmountPaise = Math.round(plan.monthly_price * 100);
      if (Math.abs(paymentData.amount - expectedAmountPaise) > 100) {
        // allow small variance/rounding
        throw new Error(
          `Payment amount mismatch: Expected ${expectedAmountPaise} paise, got ${paymentData.amount} paise`
        );
      }

      isVerified = true;
    }

    if (!isVerified) {
      throw new Error("Failed to verify payment");
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // 3. Create organization_subscriptions
    const { data: subscription, error: subError } = await supabase
      .from("organization_subscriptions")
      .insert({
        organization_id: organizationId,
        subscription_plan_id: subscriptionPlanId,
        status: "active",
        start_date: today.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
      })
      .select()
      .single();

    if (subError) {
      throw new Error(
        `Failed to create organization subscription: ${subError.message}`
      );
    }

    // 4. Create payments
   console.log("Inserting payment...");

const { data: payment, error: paymentError } = await supabase
  .from("payments")
  .insert({
    organization_id: organizationId,
    transaction_id: paymentId,
    amount: plan.monthly_price,
    payment_gateway: "razorpay",
    payment_status: "paid",
    paid_at: today.toISOString(),
  })
  .select()
  .single();

console.log("paymentError =", paymentError);
console.log("payment =", payment);

if (paymentError) {
  throw new Error(
    `Payments table insert failed: ${paymentError.message}`
  );
}

console.log("Payment inserted successfully");

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        payment,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
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
