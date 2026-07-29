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
    const { organizationCode, fullName, email, phone, password, role } = body;

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

    // ── Check duplicate email in credentials for THIS org ──
    const { data: existingCredential } = await supabase
      .from("member_credentials")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("email", email)
      .maybeSingle();

    if (existingCredential) {
      throw new Error("Email already registered in this organization");
    }

    // ── Create / find member profile ───────────────────
    let member: any;

    if (isGym) {
      // GYM PATH: use gym_members table
      const { data: existingGymMember } = await supabase
        .from("gym_members")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("email", email)
        .maybeSingle();

      if (existingGymMember) {
        member = existingGymMember;
      } else {
        const gymRole = role === "staff" ? "trainer" : "member";
        const { data: newGymMember, error: gmError } = await supabase
          .from("gym_members")
          .insert({
            organization_id: organization.id,
            full_name: fullName,
            email,
            phone,
            role: gymRole,
            active: true,
          })
          .select()
          .single();

        if (gmError) throw new Error("Gym member create error: " + gmError.message);
        member = newGymMember;
      }
    } else {
      // NON-GYM PATH: use shared members table (existing logic)
      const { data: existingMember } = await supabase
        .from("members")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existingMember) {
        member = existingMember;
      } else {
        const { data: newMember, error: memberError } = await supabase
          .from("members")
          .insert({ full_name: fullName, email, phone })
          .select()
          .single();

        if (memberError) throw memberError;
        member = newMember;
      }
    }

    // ── Hash password & store credentials ─────────────
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: existingCreds } = await supabase
      .from("member_credentials")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("member_id", member.id)
      .maybeSingle();

    if (existingCreds) {
      const { error: credentialError } = await supabase
        .from("member_credentials")
        .update({ email, password_hash: passwordHash })
        .eq("id", existingCreds.id);
      if (credentialError) throw credentialError;
    } else {
      const { error: credentialError } = await supabase
        .from("member_credentials")
        .insert({
          organization_id: organization.id,
          member_id: member.id,
          email,
          password_hash: passwordHash,
        });
      if (credentialError) throw credentialError;
    }

    // ── organization_members link (non-gym only) ───────
    if (!isGym) {
      const { data: existingOrgMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organization.id)
        .eq("member_id", member.id)
        .maybeSingle();

      if (existingOrgMember) {
        await supabase
          .from("organization_members")
          .update({ active: true, role: role || "student" })
          .eq("id", existingOrgMember.id);
      } else {
        await supabase
          .from("organization_members")
          .insert({
            organization_id: organization.id,
            member_id: member.id,
            active: true,
            role: role || "student",
          });
      }

      // Sync to students or staff table
      if (role === "staff" || role === "teacher") {
        const { error: staffError } = await supabase.from("staff").upsert(
          {
            organization_id: organization.id,
            full_name: fullName,
            email,
            phone,
            role: "staff",
            designation: "Teacher",
            active: true,
          },
          { onConflict: "email" }
        );
        if (staffError) throw new Error("Staff sync error: " + staffError.message);
      } else {
        const studentCode = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
        const { error: studentError } = await supabase.from("students").upsert(
          {
            organization_id: organization.id,
            student_code: studentCode,
            full_name: fullName,
            email,
            phone,
            role: "student",
          },
          { onConflict: "email" }
        );
        if (studentError) throw new Error("Student sync error: " + studentError.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, member }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || String(error) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
