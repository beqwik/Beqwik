import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  fetchPayment,
  verifySignature,
} from "../_shared/razorpay.ts";

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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
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

    const supabaseUrl =
      Deno.env.get("PROJECT_URL") ||
      Deno.env.get("SUPABASE_URL")!;

    const supabaseServiceKey =
      Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // ==================================================
    // Find Pending Transaction
    // ==================================================

    const { data: transaction, error: transactionError } =
  await supabase
    .from("payment_transactions")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

    if (transactionError || !transaction) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Transaction not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ==================================================
    // Prevent Duplicate Verification
    // ==================================================

    if (transaction.verified) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already verified",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ==================================================
    // Load Subscription
    // ==================================================

    const {
  data: enrollment,
  error: enrollmentError,
} = await supabase
  .from("course_enrollments")
  .select("*")
  .eq("id", transaction.course_enrollment_id)
  .single();

if (enrollmentError || !enrollment) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Enrollment not found",
    }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

    // ==================================================
    // Load Razorpay Credentials
    // ==================================================

    const {
      data: razorpayConfig,
      error: razorpayError,
    } = await supabase
      .from("organization_razorpay_configs")
      .select("*")
      .eq(
        "organization_id",
        transaction.organization_id
      )
      .single();

    if (razorpayError || !razorpayConfig) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Razorpay configuration not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

        // ==================================================
    // Verify Razorpay Signature
    // ==================================================

    const signatureValid = verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      razorpayConfig.razorpay_key_secret.trim()
    );

   if (!signatureValid) {
  await supabase
    .from("payment_transactions")
    .update({
      verified: false,
      verification_error: "Invalid Razorpay signature",
      status: "failed",
    })
    .eq("id", transaction.id);

  return new Response(
    JSON.stringify({
      success: false,
      error: "Invalid payment signature",
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


    // ==================================================
    // Fetch Payment From Razorpay
    // ==================================================

    const payment = await fetchPayment(
      razorpayConfig.razorpay_key_id.trim(),
      razorpayConfig.razorpay_key_secret.trim(),
      razorpayPaymentId
    );

    if (!payment) {
      throw new Error("Unable to fetch payment from Razorpay");
    }

    // ==================================================
    // Validate Razorpay Response
    // ==================================================

    if (payment.order_id !== razorpayOrderId) {
      throw new Error("Payment does not belong to this order");
    }

    if (payment.status !== "captured") {
      throw new Error(
        `Payment status is ${payment.status}`
      );
    }

    const expectedAmount = Math.round(
      Number(enrollment.amount) * 100
    );

    if (payment.amount !== expectedAmount) {
      throw new Error("Payment amount mismatch");
    }

    console.log("========== PAYMENT VERIFIED ==========");
    console.log("Order ID:", payment.order_id);
    console.log("Payment ID:", payment.id);
    console.log("Amount:", payment.amount);
    console.log("Status:", payment.status);
        // ==================================================
    // Update Payment Transaction
    // ==================================================

    const { error: transactionUpdateError } =
      await supabase
        .from("payment_transactions")
        .update({
          razorpay_payment_id: payment.id,
          razorpay_signature: razorpaySignature,
          verified: true,
          verification_error: null,
          status: "success",
          paid_at: new Date().toISOString(),
          gateway_response: payment,
        })
        .eq("id", transaction.id);

    if (transactionUpdateError) {
      throw transactionUpdateError;
    }

    // ==================================================
// Activate Course Enrollment
// ==================================================

const { error: enrollmentUpdateError } =
  await supabase
    .from("course_enrollments")
    .update({
  status: "active",

  payment_status: "paid",

  amount_paid: transaction.amount,

  payment_transaction_id: transaction.id,
})

    .eq("id", transaction.course_enrollment_id);

if (enrollmentUpdateError) {
  throw enrollmentUpdateError;
}


const { error: coursePaymentError } = await supabase
  .from("course_payments")
  .insert({
    organization_id: transaction.organization_id,

    student_id: enrollment.student_id,

    course_enrollment_id: transaction.course_enrollment_id,

    amount: transaction.amount,

    transaction_id: payment.id,

    payment_gateway: "razorpay",

    payment_status: "success",

    paid_at: new Date().toISOString(),

    razorpay_order_id: razorpayOrderId,

    razorpay_signature: razorpaySignature,
  });

if (coursePaymentError) {
  throw coursePaymentError;
}

console.log(
  "Course Activated:",
  transaction.course_enrollment_id
);

        // ==================================================
    // Success Response
    // ==================================================

    return new Response(
  JSON.stringify({
    success: true,
    message: "Course payment verified successfully",

    enrollmentId: transaction.course_enrollment_id,

    paymentId: payment.id,

    orderId: payment.order_id,

    amount: payment.amount,

    currency: payment.currency,
  }),
  {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);
  } catch (error: any) {

    console.error(
      "========== COURSE VERIFY PAYMENT =========="
    );

    console.error(error);

    console.error(
      "==========================================="
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
  
      