import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs";

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
    const body = await req.json();
    const { organizationCode, email, password } = body;

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // ── Find organization ──────────────────────────────
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("organization_code", organizationCode)
      .single();

    if (orgError || !organization) {
      throw new Error("Organization not found");
    }

    const isGym = organization.organization_type === "Gym";

    // ── Find credentials ───────────────────────────────
    const { data: credentials, error: credentialError } = await supabase
      .from("member_credentials")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("email", email)
      .single();

    if (credentialError || !credentials) {
      throw new Error("Invalid email or organization code");
    }

    // ── Verify password ────────────────────────────────
    const validPassword = await bcrypt.compare(password, credentials.password_hash);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    // ── Update last login ──────────────────────────────
    await supabase
      .from("member_credentials")
      .update({ last_login: new Date().toISOString() })
      .eq("id", credentials.id);

    // ── Fetch member profile from correct table ────────
    let member: any;

    if (isGym) {
      // 1. Try gym_members table first (new users)
      const { data: gymMember } = await supabase
        .from("gym_members")
        .select("*")
        .eq("id", credentials.member_id)
        .maybeSingle();

      if (gymMember) {
        member = gymMember;
      } else {
        // 2. Fallback to generic members table (for existing members like Bunny)
        const { data: memberData } = await supabase
          .from("members")
          .select("*")
          .eq("id", credentials.member_id)
          .maybeSingle();

        if (memberData) {
          member = memberData;
        } else {
          throw new Error("Member profile not found");
        }
      }
    } else {
      // NON-GYM PATH: fetch from members
      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .eq("id", credentials.member_id)
        .maybeSingle();

      if (!memberData) {
        throw new Error("Member profile not found");
      }
      member = memberData;
    }

    return new Response(
      JSON.stringify({ success: true, member, organization }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || String(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
