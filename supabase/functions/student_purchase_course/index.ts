import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { courseId, studentId, organizationId } = await req.json();

    if (!courseId || !studentId || !organizationId) {
      throw new Error("courseId, studentId and organizationId are required.");
    }

    const supabase = createClient(
      Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Fetch Course
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
     // Fetch member email
const { data: member, error: memberErr } = await supabase
  .from("members")
  .select("email")
  .eq("id", studentId)
  .single();

if (memberErr || !member) {
  throw new Error("Member record not found.");
}

// Fetch corresponding student
const { data: student, error: studentErr } = await supabase
  .from("students")
  .select("id")
  .eq("email", member.email)
  .single();

if (studentErr || !student) {
  throw new Error("Student record not found.");
}
    if (courseErr) throw courseErr;

    if (!course) {
      throw new Error("Course not found.");
    }

    const enrolledAt = new Date();

    let expiresAt = new Date(enrolledAt);

    if (course.course_duration) {
      const months = parseInt(course.course_duration);

      if (!isNaN(months)) {
        expiresAt.setMonth(expiresAt.getMonth() + months);
      }
    }

    console.log("Member ID:", studentId);
console.log("Student Record:", student);
console.log("Student ID being inserted:", student.id);

const { data: enrollment, error: enrollErr } = await supabase
  .from("course_enrollments")
  .insert({
    organization_id: organizationId,
    course_id: course.id,
    student_id: student.id,
    amount: course.price,
    amount_paid: 0,
    payment_status: "pending",
    status: "pending",
    enrolled_at: enrolledAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  })
      .select()
      .single();

    if (enrollErr) throw enrollErr;

    return new Response(
      JSON.stringify({
        success: true,
        enrollmentId: enrollment.id,
        amount: course.price,
        courseName: course.name ?? course.title ?? course.course_name,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("COURSE PURCHASE ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
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