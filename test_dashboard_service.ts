// test_dashboard_service.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

async function run() {
  const organizationId = "19af3121-ed38-4189-9140-483baddf93cf"; // From my earlier debug edge function run

  const { data: memberCredentials, error: credentialError } =
    await supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId);

  const memberIds = memberCredentials?.map((m) => m.member_id) ?? [];

  const [
    studentsResult,
    staffResult,
    membersResult
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),

    supabase
      .from("staff")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),

    supabase
      .from("members")
      .select("*")
      .in("id", memberIds)
  ]);

  const studentsData = studentsResult.data || [];
  const staffData = staffResult.data || [];
  const actualMembers = membersResult.data || [];

  const emailToMember = new Map(actualMembers.map((m: any) => [m.email?.toLowerCase(), m]));

  const mappedStaff = staffData.map((staff: any) => {
    const memberRef = emailToMember.get(staff.email?.toLowerCase());
    return {
      ...memberRef,
      ...staff,
      id: memberRef?.id || staff.id,
      role: "staff",
      is_staff: true
    };
  });

  const mappedStudents = studentsData.map((student: any) => {
    const memberRef = emailToMember.get(student.email?.toLowerCase());
    return {
      ...memberRef,
      ...student,
      id: memberRef?.id || student.id,
      role: "student",
      is_student: true
    };
  });

  const staffEmailsSet = new Set(mappedStaff.map(s => s.email?.toLowerCase()));
  const uniqueStudents = mappedStudents.filter(s => !staffEmailsSet.has(s.email?.toLowerCase()));

  const members = [...mappedStaff, ...uniqueStudents];

  console.log("Total members:", members.length);
  console.log("Students length:", studentsData.length);
  console.log("Staff length:", staffData.length);
  console.log("Staff in members array:", members.filter(m => m.role === 'staff').length);
}

run().catch(console.error);
