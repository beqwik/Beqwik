import { supabase } from "./supabase";
import type { CommunicationTemplate } from "../types/communication";

export async function updateTemplate(
  id: string,
  updates: {
    name: string;
    subject: string;
    body: string;
  }
) {
  const { error } = await supabase
    .from("communication_templates")
    .update({
      name: updates.name,
      subject: updates.subject,
      body: updates.body,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getTemplates(): Promise<CommunicationTemplate[]> {
  const { data, error } = await supabase
    .from("communication_templates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}