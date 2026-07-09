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
   * Fetch members belonging to organization
   */
  async getMembers(organizationId: string) {
    const {
      data: credentials,
      error: credError,
    } = await supabase
      .from("member_credentials")
      .select("member_id")
      .eq("organization_id", organizationId);

    if (credError) throw credError;

    if (!credentials?.length) return [];

    const memberIds = credentials.map(
      (m) => m.member_id
    );

    const { data: members, error } =
      await supabase
        .from("members")
        .select("*")
        .in("id", memberIds)
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return members ?? [];
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