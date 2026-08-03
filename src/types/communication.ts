export interface CommunicationTemplate {
  id: string;
  name: string;
  slug: string;

  subject: string;
  body: string;

  channel: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}