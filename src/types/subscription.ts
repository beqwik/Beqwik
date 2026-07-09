export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  max_members: number | null;
  max_staff: number | null;
  active: boolean;
}

export interface OrganizationSubscriptionRow {
  id: string;
  organization_id: string;
  subscription_plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  subscription_plans?: SubscriptionPlan | null;
}
