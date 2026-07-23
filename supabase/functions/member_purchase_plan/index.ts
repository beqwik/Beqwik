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
      .from("gym_plans")
      .select("*")
      .eq("id", gymPlanId)
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .single();

    if (planErr || !plan) {
      throw new Error(planErr?.message ?? "Gym plan not found or inactive.");
    }

    // 2. Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // 3. Insert pending subscription (service role bypasses RLS)
    const { data: subscription, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: organizationId,
        member_id: memberId,
        subscription_plan_id: gymPlanId, // store gym_plan id here
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
