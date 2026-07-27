import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data: staff, error: staffError } = await supabase.from("staff").select("*");
    const { data: students, error: studentsError } = await supabase.from("students").select("*");
    const { data: members, error: membersError } = await supabase.from("members").select("*");
    const { data: org_members, error: orgMembersError } = await supabase.from("organization_members").select("*");

    return new Response(
      JSON.stringify({
        staff,
        students,
        members,
        org_members,
        staffError,
        membersError,
        orgMembersError
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
