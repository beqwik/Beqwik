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
    const { paymentId, organizationId, memberId, subscriptionId } = await req.json();

    if (!paymentId || !organizationId || !memberId || !subscriptionId) {
      throw new Error(
        "Missing required parameters: paymentId, organizationId, memberId, subscriptionId"
      );
    }

    const supabaseUrl =
      Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get the subscription details from DB
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (subError || !sub) {
      throw new Error(
        `Subscription not found: ${subError?.message || ""}`
      );
    }

    // 2. Fetch Organization Owner's Razorpay Config
    const { data: config, error: configError } = await supabase
      .from("organization_razorpay_configs")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();

    let razorpayKeyId = config?.razorpay_key_id;
    let razorpayKeySecret = config?.razorpay_key_secret;
    let isVerified = false;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.warn(
        `Razorpay credentials not configured for organization ${organizationId}. Falling back to mock verification for development.`
      );
      isVerified = true;
    } else {
      // Direct payment verification via Razorpay API using Owner's credentials
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

      if (paymentData.currency !== "INR") {
        throw new Error(
          `Invalid payment currency: Expected INR, got ${paymentData.currency}`
        );
      }

      // Check if payment amount matches subscription amount (Razorpay is in paise)
      const expectedAmountPaise = Math.round(sub.amount * 100);
      if (Math.abs(paymentData.amount - expectedAmountPaise) > 100) {
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

    // 3. Update the member subscription record
    const { data: updatedSub, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        payment_status: "success",
        amount_paid: sub.amount,
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to activate subscription: ${updateError.message}`
      );
    }

    // 4. Record the payment in the platform payments ledger
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        organization_id: organizationId,
        member_id: memberId,
        transaction_id: paymentId,
        amount: sub.amount,
        payment_gateway: "razorpay",
        payment_status: "success",
        paid_at: today.toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error(`Failed to record payment in DB: ${paymentError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: updatedSub,
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
    console.error("MEMBER RAZORPAY VERIFY ERROR:", error);

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
