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
    const { gymPlanId, memberId, organizationId } = await req.json();

    if (!gymPlanId || !memberId || !organizationId) {
      throw new Error("gymPlanId, memberId, and organizationId are required.");
    }

    const supabase = createClient(
      Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // 1. Fetch the gym plan
    const { data: plan, error: planErr } = await supabase
  .from("member_subscription_plans")
  .select("*")
  .eq("id", gymPlanId)
  .eq("organization_id", organizationId)
  .eq("active", true)
  .maybeSingle();


if (planErr) {
  throw planErr;
}

if (!plan) {
  throw new Error(
    `Plan not found. gymPlanId=${gymPlanId}, organizationId=${organizationId}`
  );
}

    // 2. Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Ensure member exists in generic members table to satisfy legacy FK constraint subscriptions_member_id_fkey
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("id", memberId)
      .maybeSingle();

    if (!existingMember) {
      const { data: gymMember } = await supabase
        .from("gym_members")
        .select("*")
        .eq("id", memberId)
        .maybeSingle();

      if (gymMember) {
        await supabase.from("members").insert({
          id: gymMember.id,
          email: gymMember.email,
          full_name: gymMember.full_name,
          phone: gymMember.phone,
          active: true,
        });
      } else {
        const { data: cred } = await supabase
          .from("member_credentials")
          .select("*")
          .eq("member_id", memberId)
          .maybeSingle();

        if (cred) {
          await supabase.from("members").insert({
            id: memberId,
            email: cred.email,
            full_name: "Gym Member",
            active: true,
          });
        }
      }
    }

    // 3. Insert pending subscription (service role bypasses RLS)
    const { data: subscription, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: organizationId,
        member_id: memberId,
        subscription_plan_id: plan.id, // store gym_plan id here
        amount: plan.price,
        amount_paid: 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "pending",
        payment_status: "pending",
        auto_renew: false,
      })
      .select()
      .single();

    if (subErr || !subscription) {
      throw new Error(subErr?.message ?? "Failed to create subscription.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        planName: plan.name,
        amount: plan.price,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("MEMBER PURCHASE PLAN ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message ?? "Unknown Error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
