import { supabase } from "../supabase";

export interface GymSlot {
  id: string;
  organization_id: string;
  trainer_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  created_at?: string;
}

export interface GymEquipment {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  status: "Working" | "Under Maintenance" | "Broken";
  last_inspection: string;
  created_at?: string;
}

export interface GymBooking {
  id: string;
  slot_id: string;
  member_id: string;
  created_at?: string;
}

export async function getGymSlots(organizationId: string): Promise<GymSlot[]> {
  const { data, error } = await supabase
    .from("gym_slots")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createGymSlot(slot: Omit<GymSlot, "id">): Promise<GymSlot> {
  const { data, error } = await supabase
    .from("gym_slots")
    .insert(slot)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteGymSlot(slotId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_slots")
    .delete()
    .eq("id", slotId);
  
  if (error) throw error;
}

export async function getGymEquipment(organizationId: string): Promise<GymEquipment[]> {
  const { data, error } = await supabase
    .from("gym_equipment")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createGymEquipment(equipment: Omit<GymEquipment, "id">): Promise<GymEquipment> {
  const { data, error } = await supabase
    .from("gym_equipment")
    .insert(equipment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateGymEquipmentStatus(
  equipmentId: string,
  status: "Working" | "Under Maintenance" | "Broken"
): Promise<void> {
  const { error } = await supabase
    .from("gym_equipment")
    .update({ status })
    .eq("id", equipmentId);
  
  if (error) throw error;
}

export async function deleteGymEquipment(equipmentId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_equipment")
    .delete()
    .eq("id", equipmentId);
  
  if (error) throw error;
}

export async function getGymBookings(organizationId: string): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from("gym_slots")
    .select(`
      id,
      gym_slot_bookings(member_id)
    `)
    .eq("organization_id", organizationId);
  
  if (error) throw error;
  
  const bookingsMap: Record<string, string[]> = {};
  data?.forEach((slot: any) => {
    bookingsMap[slot.id] = slot.gym_slot_bookings?.map((b: any) => b.member_id) || [];
  });
  return bookingsMap;
}

export async function bookGymSlot(slotId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_slot_bookings")
    .insert({ slot_id: slotId, member_id: memberId });
  
  if (error) throw error;
}

export async function cancelGymBooking(slotId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from("gym_slot_bookings")
    .delete()
    .eq("slot_id", slotId)
    .eq("member_id", memberId);
  
  if (error) throw error;
}
