import { supabase } from "../supabase";

export interface DashboardData {
  organizationSubscription: any;
  members: any[];
  subscriptions: any[];
  notifications: any[];
}

class DashboardService {
  /**
   * Fetch SaaS subscription plan
   */
  async getOrganizationSubscription(
    organizationId: string
  ) {
    const { data, error } = await supabase
      .from("organization_subscriptions")
      .select(
        `
          *,
          subscription_plans(*)
        `
      )
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Fetch members belonging to organization.
   * For Gym orgs → queries gym_members table directly.
   * For other orgs → queries members/students/staff tables.
   */
  async getMembers(organizationId: string) {
    // 1. Fetch from gym_members (dedicated table for gym users)
    const { data: gymMembersData } = await supabase
      .from("gym_members")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // 2. Fetch from gym_trainers (dedicated table for gym trainers)
    const { data: gymTrainersData } = await supabase
      .from("gym_trainers")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // 3. Fetch from legacy tables (member_credentials, organization_members, members, students, staff)
    const { data: credentials } = await supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId);

    const { data: orgMembers } = await supabase
      .from("organization_members")
      .select("member_id")
      .eq("organization_id", organizationId);

    const credIds = credentials?.map((m) => m.member_id).filter(Boolean) || [];
    const orgIds = orgMembers?.map((m) => m.member_id).filter(Boolean) || [];
    const combinedMemberIds = Array.from(new Set([...credIds, ...orgIds]));

    const [
      membersResult,
      directMembersResult,
      studentsResult,
      staffResult,
    ] = await Promise.all([
      combinedMemberIds.length > 0
        ? supabase
          .from("members")
          .select("*")
          .in("id", combinedMemberIds)
          .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),

      supabase
        .from("members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),

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
    ]);

    const fetchedMembers = membersResult.data || [];
    const directMembers = directMembersResult.data || [];
    const studentsData = studentsResult.data || [];
    const staffData = staffResult.data || [];
    const gymMembers = gymMembersData || [];
    const gymTrainers = gymTrainersData || [];

    // Map dedicated gym_members to unified format
    const mappedGymMembers = gymMembers.map((m: any) => ({
      ...m,
      role: m.role === "trainer" ? "staff" : "student",
      is_staff: m.role === "trainer",
      is_student: m.role === "member",
    }));

    // Map dedicated gym_trainers to unified format (counted under Trainers / Staff)
    const mappedGymTrainers = gymTrainers.map((t: any) => ({
      ...t,
      role: "staff",
      is_staff: true,
      is_student: false,
      active: t.status === "Active" || t.active === true || t.status === undefined,
    }));

    const allMembersMap = new Map<string, any>();
    const emailToMember = new Map<string, any>();

    for (const m of [...fetchedMembers, ...directMembers]) {
      if (m.id) allMembersMap.set(m.id, m);
      if (m.email) emailToMember.set(m.email.toLowerCase(), m);
    }

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

    const processedEmails = new Set([
      ...mappedGymMembers.map((g) => g.email?.toLowerCase()).filter(Boolean),
      ...mappedGymTrainers.map((t) => t.email?.toLowerCase()).filter(Boolean),
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

    const finalMembersList = [
      ...mappedGymMembers,
      ...mappedGymTrainers,
      ...mappedStaff,
      ...mappedStudents,
      ...remainingMembers,
    ];

    const uniqueMembersMap = new Map<string, any>();
    for (const m of finalMembersList) {
      const key = m.email?.toLowerCase() || m.id;
      if (key && !uniqueMembersMap.has(key)) {
        uniqueMembersMap.set(key, m);
      }
    }

    const members = Array.from(uniqueMembersMap.values());
    members.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return members;
  }

  /**
   * Fetch member subscriptions
   */
  async getSubscriptions(
    organizationId: string
  ) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data ?? [];
  }

  /**
   * Fetch recent notifications
   */
  async getNotifications(
    organizationId: string
  ) {
    const { data, error } = await supabase
      .from("member_notifications")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) throw error;

    return data ?? [];
  }

  /**
   * Dashboard loader
   */
  async getDashboardData(
    organizationId: string
  ): Promise<DashboardData> {
    const [
      organizationSubscription,
      members,
      subscriptions,
      notifications,
    ] = await Promise.all([
      this.getOrganizationSubscription(
        organizationId
      ),
      this.getMembers(organizationId),
      this.getSubscriptions(
        organizationId
      ),
      this.getNotifications(
        organizationId
      ),
    ]);

    return {
      organizationSubscription,
      members,
      subscriptions,
      notifications,
    };
  }

  /**
   * Activate / Deactivate Member
   */
  async toggleMember(
    memberId: string,
    active: boolean
  ) {
    const { error } = await supabase
      .from("members")
      .update({
        active,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", memberId);

    if (error) throw error;
  }

  /**
   * Update Organization
   */
  async updateOrganization(
    organizationId: string,
    payload: {
      organization_name: string;
      organization_type: string;
      email: string;
      phone: string;
      address: string;
    }
  ) {
    const { error } = await supabase
      .from("organizations")
      .update({
        ...payload,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (error) throw error;
  }

  /**
   * Create Member Subscription
   */
  async createSubscription(payload: {
    member_id: string;
    organization_id: string;
    subscription_plan_id: string;
    amount_paid: number;
    start_date: string;
    end_date: string;
    status: string;
    payment_status: string;
    auto_renew: boolean;
  }) {
    const { error } = await supabase
      .from("subscriptions")
      .insert(payload);

    if (error) throw error;
  }

  /**
   * Send Notification
   */
  async sendNotification(
    organizationId: string,
    memberIds: string[],
    title: string,
    message: string
  ) {
    const payload = memberIds.map(
      (memberId) => ({
        organization_id:
          organizationId,
        member_id: memberId,
        title,
        message,
        is_read: false,
        created_at:
          new Date().toISOString(),
      })
    );

    const { error } = await supabase
      .from("member_notifications")
      .insert(payload);

    if (error) throw error;
  }
}

export const dashboardService = new DashboardService();