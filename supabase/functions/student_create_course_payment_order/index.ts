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

    const { enrollmentId } = await req.json();

if (!enrollmentId) {
  throw new Error("enrollmentId is required.");
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
// Fetch Pending enrollment
// =====================================================

const {
  data: enrollment,
  error: enrollmentError,
} = await supabase
  .from("course_enrollments")
  .select("*")
  .eq("id", enrollmentId)
  .single();

  console.log("========== ENROLLMENT ==========");
console.log("Enrollment ID:", enrollment?.id);
console.log("Organization ID:", enrollment?.organization_id);
console.log("Student ID:", enrollment?.student_id);
console.log("CourseID:", enrollment?.course_id);

if (enrollmentError || !enrollment) {
  throw new Error(
    enrollmentError?.message ??
    "Enrollment not found."
  );
}

if (enrollment.status !== "pending") {
  throw new Error(
    "Only pending enrollments can be paid."
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
  .eq("course_enrollment_id", enrollment.id)
  .eq("status", "pending")
  .maybeSingle();

if (existingTransaction) {
  throw new Error(
    "A payment is already pending for this enrollment."
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
    enrollment.organization_id
  )
  .single();

  console.log("========== RAZORPAY CONFIG ==========");
console.log("Config Organization:", razorpayConfig?.organization_id);
console.log("Razorpay Key:", razorpayConfig?.razorpay_key_id);

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

    const receipt = `COURSE-${enrollment.id.substring(
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
  Math.round(Number(enrollment.amount) * 100)
);

console.log("======================================");
console.log("PAYMENT ROUTING TEST");
console.log("Organization ID :", enrollment.organization_id);
console.log("Student ID      :", enrollment.student_id);
console.log("Using Key ID    :", razorpayConfig.razorpay_key_id);
console.log(
  "Secret Length   :",
  razorpayConfig.razorpay_key_secret.length
);
console.log("======================================");

order = await createOrder(
  razorpayConfig.razorpay_key_id.trim(),
  razorpayConfig.razorpay_key_secret.trim(),
  Math.round(Number(enrollment.amount) * 100),
  receipt
);
    } catch (err) {
      // Rollback enrollment if Razorpay fails

      throw err;
    }

    // =====================================================
    // Save Razorpay Order ID
    // =====================================================

    const {
      error: updateEnrollmentError,
    } = await supabase
      .from("course_enrollments")
      .update({
        razorpay_order_id: order.id,
      })
      .eq("id", enrollment.id);

    if (updateEnrollmentError) {
  console.error("UPDATE ENROLLMENT ERROR");
  console.error(JSON.stringify(updateEnrollmentError, null, 2));
  throw updateEnrollmentError;
}

       
    // =====================================================
// Create Payment Transaction
// =====================================================

const transactionResult = await supabase
  .from("payment_transactions")
  .insert({
    organization_id: enrollment.organization_id,
    student_id: enrollment.student_id,
    member_id: null,
    course_enrollment_id: enrollment.id,
    amount: enrollment.amount,
    currency: "INR",
    payment_method: "razorpay",
    razorpay_order_id: order.id,
    status: "pending",
    verified: false,
  })
  .select()
  .single();

console.log("TRANSACTION RESULT");
console.log(JSON.stringify(transactionResult, null, 2));

if (transactionResult.error) {
  console.error("TRANSACTION INSERT ERROR");
  console.error(JSON.stringify(transactionResult.error, null, 2));
  throw transactionResult.error;
}

const transaction = transactionResult.data;

const updateResult = await supabase
  .from("course_enrollments")
  .update({
    payment_transaction_id: transaction.id,
  })
  .eq("id", enrollment.id);

console.log("UPDATE RESULT");
console.log(JSON.stringify(updateResult, null, 2));

if (updateResult.error) {
  console.error("UPDATE PAYMENT REF ERROR");
  console.error(JSON.stringify(updateResult.error, null, 2));
  throw updateResult.error;
}
    // =====================================================
    // Success Response
    // =====================================================

    return new Response(
      JSON.stringify({
        success: true,

        enrollmentId: enrollment.id,

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

  console.error("COURSE CREATE PAYMENT ORDER ERROR");
  console.error(JSON.stringify(error, null, 2));

  return new Response(
    JSON.stringify({
      success: false,
      error,
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