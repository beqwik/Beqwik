// test_dashboard_service.js
const { createClient } = require('@supabase/supabase-js');

// Hardcoded keys for test ONLY based on previous calls
const PROJECT_URL = 'https://woboulyogmydoygjaaxz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYm91bHlvZ215ZG95Z2phYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTI4NzgsImV4cCI6MjA5NjY2ODg3OH0.nhlR30zuPPinF-ZEkjLhJLhOw9tc3q4AA1NKXgdGq-8';

const supabase = createClient(PROJECT_URL, SERVICE_KEY);

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

  const emailToMember = new Map(actualMembers.map((m) => [m.email?.toLowerCase(), m]));

  const mappedStaff = staffData.map((staff) => {
    const memberRef = emailToMember.get(staff.email?.toLowerCase());
    return {
      ...memberRef,
      ...staff,
      id: memberRef?.id || staff.id,
      role: "staff",
      is_staff: true
    };
  });

  const mappedStudents = studentsData.map((student) => {
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
