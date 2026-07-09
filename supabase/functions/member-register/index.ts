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
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const {
      organizationCode,
      fullName,
      email,
      phone,
      password,
    } = body;

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Find organization
    const {
      data: organization,
      error: orgError,
    } = await supabase
      .from("organizations")
      .select("*")
      .eq("organization_code", organizationCode)
      .single();

    if (orgError || !organization) {
      throw new Error("Organization not found");
    }

    // Check duplicate email
    const {
      data: existingCredential,
      error: existingError,
    } = await supabase
      .from("member_credentials")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingCredential) {
      throw new Error("Email already registered");
    }

    // Create member
    const {
      data: member,
      error: memberError,
    } = await supabase
      .from("members")
      .insert({
        full_name: fullName,
        email,
        phone,
      })
      .select()
      .single();

    if (memberError) {
      throw memberError;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save credentials
    const {
      error: credentialError,
    } = await supabase
      .from("member_credentials")
      .insert({
        organization_id: organization.id,
        member_id: member.id,
        email,
        password_hash: passwordHash,
      });

    if (credentialError) {
      throw credentialError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        member,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
        details: error,
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
