import { supabase } from "../supabase";

export interface GymAnnouncement {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  author: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// GET ALL GYM ANNOUNCEMENTS (org-scoped)
// =====================================================
export async function getGymAnnouncements(
  organizationId: string
): Promise<GymAnnouncement[]> {
  const { data, error } = await supabase
    .from("gym_announcements")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch gym_announcements:", error.message);
    return [];
  }
  return data || [];
}

// =====================================================
// CREATE GYM ANNOUNCEMENT
// =====================================================
export async function createGymAnnouncement(payload: {
  organization_id: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  author?: string;
}): Promise<GymAnnouncement> {
  const { data, error } = await supabase
    .from("gym_announcements")
    .insert({
      ...payload,
      author: payload.author || "Gym Admin",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// DELETE GYM ANNOUNCEMENT
// =====================================================
export async function deleteGymAnnouncement(announcementId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_announcements")
    .delete()
    .eq("id", announcementId);

  if (error) throw error;
}

// =====================================================
// UPDATE GYM ANNOUNCEMENT
// =====================================================
export async function updateGymAnnouncement(
  announcementId: string,
  payload: Partial<Pick<GymAnnouncement, "title" | "message" | "priority">>
): Promise<GymAnnouncement> {
  const { data, error } = await supabase
    .from("gym_announcements")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", announcementId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
