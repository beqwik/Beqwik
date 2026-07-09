export interface Member {
  id: string;

  email: string;

  full_name: string;

  phone: string;

  gender?: string;

  date_of_birth?: string;

  address?: string;

  profile_image_url?: string;

  active: boolean;

  created_at: string;

  updated_at: string;
}