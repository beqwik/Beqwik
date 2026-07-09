import { supabase } from "../supabase";

// =====================================
// GET ALL NOTIFICATIONS
// =====================================
export async function getNotifications(
  memberId: string
) {
  const { data, error } = await supabase
    .from("member_notifications")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

// =====================================
// GET UNREAD NOTIFICATIONS
// =====================================
export async function getUnreadNotifications(
  memberId: string
) {
  const { data, error } = await supabase
    .from("member_notifications")
    .select("*")
    .eq("member_id", memberId)
    .eq("is_read", false)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

// =====================================
// GET UNREAD COUNT
// =====================================
export async function getUnreadCount(
  memberId: string
) {
  const { count, error } = await supabase
    .from("member_notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("member_id", memberId)
    .eq("is_read", false);

  if (error) throw error;

  return count || 0;
}

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================
export async function markNotificationRead(
  notificationId: string
) {
  const { data, error } = await supabase
    .from("member_notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// =====================================
// MARK ALL AS READ
// =====================================
export async function markAllNotificationsRead(
  memberId: string
) {
  const { error } = await supabase
    .from("member_notifications")
    .update({
      is_read: true,
    })
    .eq("member_id", memberId)
    .eq("is_read", false);

  if (error) throw error;
}

// =====================================
// DELETE NOTIFICATION
// =====================================
export async function deleteNotification(
  notificationId: string
) {
  const { error } = await supabase
    .from("member_notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
}