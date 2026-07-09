export interface MemberSubscription {
  id: string;

  organization_id: string;

  member_id: string;

  subscription_plan_id: string;

  amount_paid: number;

  status: string;

  payment_status: string;

  start_date: string;

  end_date: string;

  renewed_from?: string;

  created_at: string;
}