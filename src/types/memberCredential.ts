export interface MemberCredential {
  id: string;

  organization_id: string;

  member_id: string;

  email: string;

  password_hash: string;

  active: boolean;

  last_login?: string;

  created_at: string;
}