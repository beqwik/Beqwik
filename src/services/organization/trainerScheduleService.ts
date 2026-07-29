import { supabase } from "../supabase";

export interface TrainerSession {
  id: string;
  organization_id: string;
  trainer_id?: string;
  trainer_name: string;
  member_id?: string;
  member_name: string;
  session_name: string; // e.g. "Chest and Bicep", "CrossFit (Level 1)"
  session_type: "Personal Training" | "Group Class" | "CrossFit" | "Yoga" | "HIIT";
  status: "Upcoming" | "Completed" | "Cancelled";
  session_date: string; // "YYYY-MM-DD"
  start_time: string;   // "HH:MM" e.g. "05:00"
  end_time: string;     // "HH:MM" e.g. "06:00"
  duration_minutes: number;
  notes?: string;
  created_at?: string;
}

// Convert "05:00" or "05:00:00" to total minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Format minutes to "HH:MM AM/PM" or "04-05am"
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const paddedHours = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  const paddedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return minutes === 0 ? `${paddedHours}${ampm}` : `${paddedHours}:${paddedMins}${ampm}`;
}

export function formatTimeRangeDisplay(startTime: string, endTime: string): string {
  return `${formatTimeDisplay(startTime)}-${formatTimeDisplay(endTime)}`;
}

// =====================================================
// GET TRAINER SESSIONS BY DATE (Strict Database Fetching)
// =====================================================
export async function getTrainerSessions(
  organizationId: string,
  sessionDate: string
): Promise<TrainerSession[]> {
  const { data, error } = await supabase
    .from("trainer_sessions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("session_date", sessionDate)
    .order("start_time", { ascending: true });

  if (error) {
    console.warn("Could not query trainer_sessions:", error.message);
    return [];
  }

  return (data as TrainerSession[]) || [];
}

// =====================================================
// CREATE TRAINER SESSION (Strict Database Insert)
// =====================================================
export async function createTrainerSession(
  session: Omit<TrainerSession, "id">
): Promise<TrainerSession> {
  const { data, error } = await supabase
    .from("trainer_sessions")
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data as TrainerSession;
}

// =====================================================
// UPDATE TRAINER SESSION (Strict Database Update)
// =====================================================
export async function updateTrainerSession(
  sessionId: string,
  updates: Partial<TrainerSession>
): Promise<TrainerSession> {
  const { data, error } = await supabase
    .from("trainer_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainerSession;
}

// =====================================================
// DELETE TRAINER SESSION (Strict Database Delete)
// =====================================================
export async function deleteTrainerSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("trainer_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}

// =====================================================
// CONFLICT CHECKING HELPER
// =====================================================
export function checkSchedulingConflict(
  existingSessions: TrainerSession[],
  trainerName: string,
  sessionDate: string,
  startTimeStr: string,
  endTimeStr: string,
  excludeSessionId?: string
): TrainerSession | null {
  const newStart = timeToMinutes(startTimeStr);
  const newEnd = timeToMinutes(endTimeStr);

  for (const session of existingSessions) {
    if (excludeSessionId && session.id === excludeSessionId) continue;
    if (session.trainer_name !== trainerName) continue;
    if (session.session_date !== sessionDate) continue;
    if (session.status === "Cancelled") continue;

    const existingStart = timeToMinutes(session.start_time);
    const existingEnd = timeToMinutes(session.end_time);

    // Overlap condition: start1 < end2 AND end1 > start2
    if (newStart < existingEnd && newEnd > existingStart) {
      return session;
    }
  }

  return null;
}
