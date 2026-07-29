import { supabase } from "../supabase";
import { getCurrentMember, getCurrentOrganization } from "./memberAuth";

// LocalStorage helpers for persistent read status across refreshes
function getLocalReadSet(memberId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`read_notifs_${memberId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalReadId(memberId: string, notificationId: string) {
  try {
    const set = getLocalReadSet(memberId);
    set.add(notificationId);
    localStorage.setItem(`read_notifs_${memberId}`, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error("Failed to save read state to localStorage:", err);
  }
}

function saveLocalReadIds(memberId: string, notificationIds: string[]) {
  try {
    const set = getLocalReadSet(memberId);
    notificationIds.forEach((id) => set.add(id));
    localStorage.setItem(`read_notifs_${memberId}`, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error("Failed to save read states to localStorage:", err);
  }
}

// =====================================
// GET ALL NOTIFICATIONS (Org-type aware)
// =====================================
export async function getNotifications(memberId: string) {
  const readSet = getLocalReadSet(memberId);
  const resultNotifs: any[] = [];
  const addedIds = new Set<string>();

  // Resolve orgId and orgType from local session or member object
  const currentMember = getCurrentMember();
  const currentOrg = getCurrentOrganization();
  let orgId: string | null = currentMember?.organization_id || currentOrg?.id || null;
  let orgType: string | null = currentOrg?.type || null;

  // If orgId not cached, fetch from DB — check both members and gym_members
  if (!orgId) {
    const { data: memberData } = await supabase
      .from("members")
      .select("organization_id")
      .eq("id", memberId)
      .maybeSingle();

    if (memberData?.organization_id) {
      orgId = memberData.organization_id;
    } else {
      // Try gym_members table (gym org users)
      const { data: gymMemberData } = await supabase
        .from("gym_members")
        .select("organization_id")
        .eq("id", memberId)
        .maybeSingle();

      if (gymMemberData?.organization_id) {
        orgId = gymMemberData.organization_id;
      }
    }
  }

  // If orgType not cached yet, fetch from organizations table
  if (orgId && !orgType) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("type")
      .eq("id", orgId)
      .maybeSingle();

    if (orgData?.type) {
      orgType = orgData.type;
    }
  }

  // 1. Fetch direct member_notifications (always relevant regardless of org type)
  try {
    const { data: notifsData } = await supabase
      .from("member_notifications")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false });

    if (notifsData) {
      notifsData.forEach((n: any) => {
        addedIds.add(n.id);
        resultNotifs.push({
          ...n,
          is_read: n.is_read || readSet.has(n.id)
        });
      });
    }
  } catch (err) {
    console.error("Error fetching member_notifications:", err);
  }

  // 2. Fetch org-type specific announcements
  if (orgId) {
    const isGym = orgType === "Gym";
    const isAcademy = orgType === "Academy" || (!isGym && orgType !== "Hostel" && orgType !== "Mess");

    // Gym members → only gym_announcements
    if (isGym) {
      try {
        const { data: gymAncs } = await supabase
          .from("gym_announcements")
          .select("*")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false });

        if (gymAncs && gymAncs.length > 0) {
          gymAncs.forEach((anc: any) => {
            if (!addedIds.has(anc.id)) {
              addedIds.add(anc.id);
              resultNotifs.push({
                id: anc.id,
                member_id: memberId,
                title: `📢 ${anc.title}`,
                message: anc.message,
                type:
                  anc.priority === "urgent"
                    ? "warning"
                    : anc.priority === "high"
                    ? "reminder"
                    : "info",
                is_read: readSet.has(anc.id),
                created_at: anc.created_at
              });
            }
          });
        }
      } catch (err) {
        console.error("Error fetching gym_announcements for member:", err);
      }
    }

    // Academy members → only academic_announcements
    if (isAcademy) {
      const targetAudienceAllowed = ["All", "Students"];
      if (currentMember?.role === "staff" || currentMember?.role === "teacher") {
        targetAudienceAllowed.push("Teachers");
      }

      try {
        const { data: academicAncs } = await supabase
          .from("academic_announcements")
          .select("*")
          .eq("organization_id", orgId)
          .in("target_audience", targetAudienceAllowed)
          .order("created_at", { ascending: false });

        if (academicAncs && academicAncs.length > 0) {
          academicAncs.forEach((anc: any) => {
            if (!addedIds.has(anc.id)) {
              addedIds.add(anc.id);
              resultNotifs.push({
                id: anc.id,
                member_id: memberId,
                title: anc.title,
                message: anc.content,
                type: anc.priority === "urgent" ? "warning" : anc.priority === "high" ? "reminder" : "info",
                is_read: readSet.has(anc.id),
                created_at: anc.created_at
              });
            }
          });
        }
      } catch (err) {
        console.error("Error fetching academic_announcements for member:", err);
      }
    }
  }

  // Sort all notifications by created_at date descending
  resultNotifs.sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  return resultNotifs;
}

// =====================================
// GET UNREAD NOTIFICATIONS
// =====================================
export async function getUnreadNotifications(memberId: string) {
  const notifs = await getNotifications(memberId);
  return notifs.filter((n: any) => !n.is_read);
}

// =====================================
// GET UNREAD COUNT
// =====================================
export async function getUnreadCount(memberId: string) {
  const notifs = await getNotifications(memberId);
  return notifs.filter((n: any) => !n.is_read).length;
}

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================
export async function markNotificationRead(notificationId: string, memberId?: string) {
  if (memberId) {
    saveLocalReadId(memberId, notificationId);
  } else {
    try {
      const storedMember = localStorage.getItem("member");
      if (storedMember) {
        const parsed = JSON.parse(storedMember);
        if (parsed?.id) saveLocalReadId(parsed.id, notificationId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    const { data } = await supabase
      .from("member_notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .maybeSingle();

    return data;
  } catch (error) {
    console.error("Error marking notification read in Supabase:", error);
    return null;
  }
}

// =====================================
// MARK ALL AS READ
// =====================================
export async function markAllNotificationsRead(memberId: string) {
  try {
    const notifs = await getNotifications(memberId);
    if (notifs && notifs.length > 0) {
      saveLocalReadIds(memberId, notifs.map((n: any) => n.id));
    }
  } catch (e) {
    console.error(e);
  }

  try {
    await supabase
      .from("member_notifications")
      .update({ is_read: true })
      .eq("member_id", memberId)
      .eq("is_read", false);
  } catch (error) {
    console.error("Error marking all read in Supabase:", error);
  }
}

// =====================================
// DELETE NOTIFICATION
// =====================================
export async function deleteNotification(notificationId: string) {
  try {
    await supabase
      .from("member_notifications")
      .delete()
      .eq("id", notificationId);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}