// ======================================================
// Dashboard Summary
// ======================================================

export interface OrganizationType {
  organization_type: string;
  count: number;
}

export interface RevenueTrend {
  name: string;
  revenue: number;
}

export interface MemberGrowth {
  name: string;
  members: number;
}

export interface OrganizationGrowth {
  name: string;
  organizations: number;
}

// ======================================================
// Dashboard KPI
// ======================================================

export interface DashboardKPI {
  trialOrganizations: number;
  activeOrganizations: number;
  expiredOrganizations: number;
  pendingPayments: number;
}

// ======================================================
// Recent Organization
// ======================================================

export interface RecentOrganization {
  id: string;
  organization_name: string;
  organization_type: string;
  email: string;
  phone: string;
  created_at: string;
}

// ======================================================
// Recent Payment
// ======================================================

export interface RecentPayment {
  id: string;
  organization_name: string;
  amount: number;
  payment_status: string;
  paid_at: string;
}

// ======================================================
// Recent Subscription
// ======================================================

export interface RecentSubscription {
  id: string;
  organization_name: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

// ======================================================
// Activity Feed
// ======================================================

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

// ======================================================
// Dashboard Summary Stats
// ======================================================

export interface DashboardStats {
  organizations: number;
  members: number;
  revenue: number;
  subscriptions: number;

  organizationTypes: OrganizationType[];

  revenueTrend: RevenueTrend[];

  memberGrowth: MemberGrowth[];

  organizationGrowth: OrganizationGrowth[];

  kpis: DashboardKPI;

  recentOrganizations: RecentOrganization[];

  recentPayments: RecentPayment[];

  recentSubscriptions: RecentSubscription[];

  activityLogs: ActivityLog[];
}