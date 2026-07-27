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
  // Members
  // --------------------------------------------------

  const { data: memberCredentials, error: credentialError } =
    await supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId);

  if (credentialError) throw credentialError;

  const memberIds =
    memberCredentials?.map((m) => m.member_id) ?? [];

  let members: any[] = [];
  let memberSubscriptions: any[] = [];
  let notifications: any[] = [];

    if (memberIds.length > 0) {
      const [
        subscriptionsResult,
        notificationsResult,
        studentsResult,
        staffResult,
        membersResult
      ] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .in("member_id", memberIds)
          .order("created_at", { ascending: false }),

        supabase
          .from("member_notifications")
          .select("*")
          .in("member_id", memberIds)
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

        supabase
          .from("members")
          .select("*")
          .in("id", memberIds)
      ]);

      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (notificationsResult.error) throw notificationsResult.error;
      if (studentsResult.error) console.error("Students Query Error:", studentsResult.error);
      if (staffResult.error) console.error("Staff Query Error:", staffResult.error);
      
      const studentsData = studentsResult.data || [];
      const staffData = staffResult.data || [];
      const actualMembers = membersResult.data || [];
      
      // Create maps to easily find member data
      const emailToMember = new Map(actualMembers.map((m: any) => [m.email?.toLowerCase(), m]));

      // 1. Process Staff
      const mappedStaff = staffData.map((staff: any) => {
        const memberRef = emailToMember.get(staff.email?.toLowerCase());
        return {
          ...memberRef, // Merge underlying member data (like phone, address) if exists
          ...staff,     // Overwrite with staff specific data
          id: memberRef?.id || staff.id, // CRITICAL: Use the member_id so subscriptions/auth works!
          role: "staff",
          is_staff: true
        };
      });

      // 2. Process Students
      const mappedStudents = studentsData.map((student: any) => {
        const memberRef = emailToMember.get(student.email?.toLowerCase());
        return {
          ...memberRef,
          ...student,
          id: memberRef?.id || student.id, // CRITICAL: Use the member_id so subscriptions/auth works!
          role: "student",
          is_student: true
        };
      });

      // 3. Combine them as the ultimate source of truth
      // Filter out any students that are also in staff (just in case of duplicate data)
      const staffEmailsSet = new Set(mappedStaff.map(s => s.email?.toLowerCase()));
      const uniqueStudents = mappedStudents.filter(s => !staffEmailsSet.has(s.email?.toLowerCase()));

      members = [...mappedStaff, ...uniqueStudents];

      // Sort by created_at descending
      members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      memberSubscriptions = subscriptionsResult.data ?? [];
    notifications =
      notificationsResult.data ?? [];
  }

  return {
    organization: organizationResult.data,
    organizationSubscription:
      saasSubscriptionResult.data,
    members,
    memberSubscriptions,
    notifications,
  };
}