export interface OrganizationRow {
  id: string;
  organization_name: string;
  organization_type: string;
  organization_code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationUserRow {
  id: string;
  organization_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at?: string;
}
