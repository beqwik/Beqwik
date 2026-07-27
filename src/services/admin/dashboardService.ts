import { supabase } from "../supabase";

export interface DashboardData {
  organization: any;
  organizationSubscription: any;
  members: any[];
  memberSubscriptions: any[];
  notifications: any[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  // --------------------------------------------------
  // Find Organization of Logged in Admin
  // --------------------------------------------------

  const { data: orgUser, error: orgUserError } = await supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (orgUserError) throw orgUserError;

  const organizationId = orgUser.organization_id;

  // --------------------------------------------------
  // Organization + SaaS Plan
  // --------------------------------------------------

  const [organizationResult, saasSubscriptionResult] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single(),

      supabase
        .from("organization_subscriptions")
        .select(
          `
          *,
          subscription_plans(*)
        `
        )
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ]);

  if (organizationResult.error) throw organizationResult.error;

  // --------------------------------------------------
  // Members & Related Data
  // --------------------------------------------------

  const [credResult, orgMembersResult] = await Promise.all([
    supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId),
    supabase
      .from("organization_members")
      .select("member_id")
      .eq("organization_id", organizationId),
  ]);

  const credIds = credResult.data?.map((m) => m.member_id).filter(Boolean) || [];
  const orgIds = orgMembersResult.data?.map((m) => m.member_id).filter(Boolean) || [];
  const combinedMemberIds = Array.from(new Set([...credIds, ...orgIds]));

  const [
    subscriptionsResult,
    notificationsResult,
    studentsResult,
    staffResult,
    membersResult,
    directMembersResult,
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),

    supabase
      .from("member_notifications")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10),

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

    combinedMemberIds.length > 0
      ? supabase
          .from("members")
          .select("*")
          .in("id", combinedMemberIds)
      : Promise.resolve({ data: [], error: null }),

    supabase
      .from("members")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
  ]);

  const studentsData = studentsResult.data || [];
  const staffData = staffResult.data || [];
  const actualMembers = membersResult.data || [];
  const directMembers = directMembersResult.data || [];

  const allMembersMap = new Map<string, any>();
  const emailToMember = new Map<string, any>();

  for (const m of [...actualMembers, ...directMembers]) {
    if (m.id) allMembersMap.set(m.id, m);
    if (m.email) emailToMember.set(m.email.toLowerCase(), m);
  }

  // 1. Process Staff
  const mappedStaff = staffData.map((staff: any) => {
    const memberRef = emailToMember.get(staff.email?.toLowerCase());
    return {
      ...memberRef,
      ...staff,
      id: memberRef?.id || staff.id,
      role: "staff",
      is_staff: true,
      active: staff.active !== undefined ? staff.active : true,
    };
  });

  // 2. Process Students
  const mappedStudents = studentsData.map((student: any) => {
    const memberRef = emailToMember.get(student.email?.toLowerCase());
    return {
      ...memberRef,
      ...student,
      id: memberRef?.id || student.id,
      role: "student",
      is_student: true,
      active: student.active !== undefined ? student.active : true,
    };
  });

  // 3. Process direct members
  const processedEmails = new Set([
    ...mappedStaff.map((s) => s.email?.toLowerCase()).filter(Boolean),
    ...mappedStudents.map((s) => s.email?.toLowerCase()).filter(Boolean),
  ]);

  const remainingMembers = Array.from(allMembersMap.values())
    .filter((m) => !processedEmails.has(m.email?.toLowerCase()))
    .map((m) => ({
      ...m,
      role: m.role || "student",
      active: m.active !== undefined ? m.active : true,
    }));

  const finalMembersList = [...mappedStaff, ...mappedStudents, ...remainingMembers];

  const uniqueMembersMap = new Map<string, any>();
  for (const m of finalMembersList) {
    const key = m.id || m.email?.toLowerCase();
    if (key && !uniqueMembersMap.has(key)) {
      uniqueMembersMap.set(key, m);
    }
  }

  const members = Array.from(uniqueMembersMap.values());
  members.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const memberSubscriptions = subscriptionsResult.data ?? [];
  const notifications = notificationsResult.data ?? [];

  return {
    organization: organizationResult.data,
    organizationSubscription:
      saasSubscriptionResult.data,
    members,
    memberSubscriptions,
    notifications,
  };
}