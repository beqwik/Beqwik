import React, { useState, useEffect, useCallback } from "react";
import { 
  Dumbbell, 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  Check, 
  X, 
  AlertTriangle, 
  Activity,
  Trash2,
  UserCheck,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import {
  getGymSlots,
  createGymSlot,
  deleteGymSlot,
  getGymEquipment,
  createGymEquipment,
  updateGymEquipmentStatus,
  deleteGymEquipment,
  getGymBookings,
  bookGymSlot,
  cancelGymBooking,
  getTrainers,
  createTrainer,
  updateTrainerStatus,
  deleteTrainer,
  type Trainer
} from "../../../services/organization/gymService";

interface GymSectionProps {
  activeTab: string;
  organizationId: string;
  members: any[];
}

interface GymSlot {
  id: string;
  organization_id: string;
  trainer_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
}

interface GymEquipment {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  status: "Working" | "Under Maintenance" | "Broken";
  last_inspection: string;
}

export default function GymSection({ activeTab, organizationId, members }: GymSectionProps) {
  // Slots State
  const [slots, setSlots] = useState<GymSlot[]>([]);
  const [bookings, setBookings] = useState<Record<string, string[]>>({});
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [maxCapacity, setMaxCapacity] = useState("15");

  // Booking Form State
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  // Equipment State
  const [equipment, setEquipment] = useState<GymEquipment[]>([]);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [eqName, setEqName] = useState("");
  const [eqCategory, setEqCategory] = useState("Cardio");
  const [eqStatus, setEqStatus] = useState<"Working" | "Under Maintenance" | "Broken">("Working");
  const [eqInspection, setEqInspection] = useState(new Date().toISOString().split("T")[0]);

  // Trainers State
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [trainerFullName, setTrainerFullName] = useState("");
  const [trainerEmail, setTrainerEmail] = useState("");
  const [trainerPhone, setTrainerPhone] = useState("");
  const [trainerSpecialization, setTrainerSpecialization] = useState("General Fitness");
  const [trainerBio, setTrainerBio] = useState("");

  // Loading States
  const [loading, setLoading] = useState(true);

  // Fetch all gym data from Supabase
  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [fetchedSlots, fetchedBookings, fetchedEquipment, fetchedTrainers] = await Promise.all([
        getGymSlots(organizationId),
        getGymBookings(organizationId),
        getGymEquipment(organizationId),
        getTrainers(organizationId)
      ]);

      setSlots(fetchedSlots);
      setBookings(fetchedBookings);
      setEquipment(fetchedEquipment as GymEquipment[]);
      setTrainers(fetchedTrainers);
    } catch (err) {
      console.error("Error loading gym data:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add training slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setLoading(true);
      await createGymSlot({
        organization_id: organizationId,
        trainer_name: trainerName || "General Trainer",
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        max_capacity: parseInt(maxCapacity) || 10
      });

      setShowAddSlot(false);
      setTrainerName("");
      setDayOfWeek("Monday");
      setStartTime("09:00");
      setEndTime("10:00");
      setMaxCapacity("15");
      
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create training slot");
      setLoading(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (id: string) => {
    if (!confirm("Are you sure you want to remove this training slot?")) return;
    try {
      setLoading(true);
      await deleteGymSlot(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to remove training slot");
      setLoading(false);
    }
  };

  // Book a slot for a member
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedMemberId) return;

    const currentBookings = bookings[selectedSlotId] || [];
    if (currentBookings.includes(selectedMemberId)) {
      alert("This member is already registered in this slot.");
      return;
    }

    const slot = slots.find((s) => s.id === selectedSlotId);
    if (slot && currentBookings.length >= slot.max_capacity) {
      alert(`Capacity limit reached! Cannot book more than ${slot.max_capacity} members.`);
      return;
    }

    try {
      setLoading(true);
      await bookGymSlot(selectedSlotId, selectedMemberId);
      setSelectedSlotId(null);
      setSelectedMemberId("");
      alert("Slot successfully booked for member!");
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to book slot");
      setLoading(false);
    }
  };

  // Remove a booking
  const handleCancelBooking = async (slotId: string, memberId: string) => {
    if (!confirm("Are you sure you want to remove this booking?")) return;
    try {
      setLoading(true);
      await cancelGymBooking(slotId, memberId);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
      setLoading(false);
    }
  };

  // Add Equipment
  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setLoading(true);
      await createGymEquipment({
        organization_id: organizationId,
        name: eqName,
        category: eqCategory,
        status: eqStatus,
        last_inspection: eqInspection
      });

      setShowAddEquipment(false);
      setEqName("");
      setEqCategory("Cardio");
      setEqStatus("Working");
      setEqInspection(new Date().toISOString().split("T")[0]);
      
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to log equipment");
      setLoading(false);
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    try {
      setLoading(true);
      await deleteGymEquipment(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete equipment");
      setLoading(false);
    }
  };

  // Toggle Equipment Status
  const handleToggleStatus = async (id: string, currentStatus: GymEquipment["status"]) => {
    const statuses: GymEquipment["status"][] = ["Working", "Under Maintenance", "Broken"];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    try {
      setLoading(true);
      await updateGymEquipmentStatus(id, nextStatus);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update equipment status");
      setLoading(false);
    }
  };

  // Add Trainer
  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      setLoading(true);
      await createTrainer({
        organization_id: organizationId,
        full_name: trainerFullName,
        email: trainerEmail,
        phone: trainerPhone,
        specialization: trainerSpecialization,
        bio: trainerBio,
        status: "Active"
      });

      setShowAddTrainer(false);
      setTrainerFullName("");
      setTrainerEmail("");
      setTrainerPhone("");
      setTrainerSpecialization("General Fitness");
      setTrainerBio("");

      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Database table 'trainers' is not initialized in Supabase yet.\n\nPlease run the SQL migration script (20260721000000_trainers_and_gym_plans.sql) in your Supabase SQL Editor.");
      setLoading(false);
    }
  };

  // Toggle Trainer Status
  const handleToggleTrainerStatus = async (id: string, currentStatus: "Active" | "Inactive") => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      setLoading(true);
      await updateTrainerStatus(id, newStatus);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update trainer status");
      setLoading(false);
    }
  };

  // Delete Trainer
  const handleDeleteTrainer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this trainer?")) return;
    try {
      setLoading(true);
      await deleteTrainer(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete trainer");
      setLoading(false);
    }
  };

  // Calculate slots metrics
  const totalBookingsCount = Object.values(bookings).reduce((acc, curr) => acc + curr.length, 0);
  const totalCapacity = slots.reduce((acc, curr) => acc + curr.max_capacity, 0);
  const slotsEnrolledPercent = totalCapacity > 0 ? Math.round((totalBookingsCount / totalCapacity) * 100) : 0;

  // Calculate equipment metrics
  const eqTotal = equipment.length;
  const eqWorking = equipment.filter((e) => e.status === "Working").length;
  const eqMaintenance = equipment.filter((e) => e.status === "Under Maintenance").length;
  const eqBroken = equipment.filter((e) => e.status === "Broken").length;
  const eqOperationalPercent = eqTotal > 0 ? Math.round((eqWorking / eqTotal) * 100) : 0;

  if (loading && slots.length === 0 && equipment.length === 0 && trainers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading Gym details...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-fadeIn ${loading ? "opacity-60 pointer-events-none transition-opacity" : ""}`}>
      {/* ── TRAINING SLOTS TAB ── */}
      {activeTab === "slots" && (
        <div className="space-y-6">
          {/* STATS HEADER */}
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Slots</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{slots.length}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Bookings</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalBookingsCount}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Overall Capacity</p>
                  <span className="text-xs font-bold text-slate-700">{slotsEnrolledPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${slotsEnrolledPercent >= 90 ? "bg-red-500" : "bg-purple-600"}`}
                    style={{ width: `${Math.min(100, slotsEnrolledPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Training Session Schedule</h2>
              <p className="text-slate-500 text-xs mt-0.5">Manage class schedules, trainers, and strict booking capacity limits.</p>
            </div>
            <button
              onClick={() => setShowAddSlot(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" /> Add Training Slot
            </button>
          </div>

          {/* SLOTS GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => {
              const enrolledMemberIds = bookings[slot.id] || [];
              const enrolledCount = enrolledMemberIds.length;
              const isFull = enrolledCount >= slot.max_capacity;
              const capacityPercent = Math.round((enrolledCount / slot.max_capacity) * 100);

              return (
                <div 
                  key={slot.id} 
                  className={`bg-white rounded-2xl border ${isFull ? "border-amber-300 bg-amber-50/10" : "border-slate-200"} p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden`}
                >
                  {isFull && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      FULL CAPACITY
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        {slot.day_of_week}
                      </span>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-slate-400 hover:text-red-500 transition p-1"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-lg">{slot.trainer_name}</h4>

                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-2 font-medium">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>

                    {/* CAPACITY INDICATOR */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> Enrolled:
                        </span>
                        <span className={isFull ? "text-red-600 font-extrabold" : "text-slate-800"}>
                          {enrolledCount} / {slot.max_capacity} {isFull ? "(Full)" : ""}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isFull ? "bg-red-500" : capacityPercent >= 75 ? "bg-amber-500" : "bg-indigo-600"}`}
                          style={{ width: `${Math.min(100, capacityPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* ENROLLED MEMBERS LIST */}
                    {enrolledCount > 0 && (
                      <div className="mt-4 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Booked Members</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {enrolledMemberIds.map((mId) => {
                            const memberObj = members.find((m) => m.id === mId);
                            return (
                              <span 
                                key={mId} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
                              >
                                {memberObj?.full_name || "Member"}
                                <button 
                                  onClick={() => handleCancelBooking(slot.id, mId)}
                                  className="hover:text-red-600 ml-1 font-bold text-xs"
                                  title="Cancel booking"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUICK ENROLL ACTION */}
                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedSlotId(slot.id)}
                      disabled={isFull}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isFull 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {isFull ? "🚫 Class Full" : "➕ Enroll Member"}
                    </button>
                  </div>
                </div>
              );
            })}

            {slots.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">No training slots scheduled.</p>
                <p className="text-slate-400 text-xs mt-1">Click "Add Training Slot" to create your first session.</p>
              </div>
            )}
          </div>

          {/* ADD SLOT MODAL */}
          {showAddSlot && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">New Training Slot</h3>
                <p className="text-slate-500 text-sm mb-6">Schedule a slot for group sessions or personal trainers.</p>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Trainer / Instructor</label>
                    {trainers.length > 0 ? (
                      <select
                        value={trainerName}
                        onChange={(e) => setTrainerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select a Trainer</option>
                        {trainers.filter(t => t.status === "Active").map(t => (
                          <option key={t.id} value={t.full_name}>{t.full_name} ({t.specialization})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="E.g., Alex Johnson"
                        value={trainerName}
                        onChange={(e) => setTrainerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (Limit)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="15"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Bookings will automatically lock once this limit is reached.</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Save Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ENROLL MEMBER MODAL */}
          {selectedSlotId && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setSelectedSlotId(null)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Enroll Member into Slot</h3>
                <p className="text-slate-500 text-sm mb-6">Select an active member to assign to this session.</p>

                <form onSubmit={handleBookSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Member</label>
                    <select
                      required
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.email || m.phone || "No Contact"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSlotId(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Confirm Enrollment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TRAINERS TAB ── */}
      {activeTab === "trainers" && (
        <div className="space-y-6">
          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gym Trainers & Instructors</h2>
              <p className="text-slate-500 text-xs mt-0.5">Manage certified trainers, fitness instructors, and staff roster.</p>
            </div>
            <button
              onClick={() => setShowAddTrainer(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              <UserPlus className="w-4 h-4" /> Add New Trainer
            </button>
          </div>

          {/* TRAINERS GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl">
                    {trainer.full_name.charAt(0)}
                  </div>
                  <button
                    onClick={() => handleToggleTrainerStatus(trainer.id, trainer.status)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      trainer.status === "Active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {trainer.status}
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-slate-900 text-lg">{trainer.full_name}</h3>
                  <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg mt-1">
                    🎯 {trainer.specialization}
                  </span>
                  {trainer.bio && <p className="text-slate-500 text-xs mt-2 line-clamp-2">{trainer.bio}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  {trainer.email && <p>✉️ {trainer.email}</p>}
                  {trainer.phone && <p>📞 {trainer.phone}</p>}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteTrainer(trainer.id)}
                    className="text-slate-400 hover:text-red-500 font-bold p-1 transition flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Trainer
                  </button>
                </div>
              </div>
            ))}

            {trainers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">No trainers added yet.</p>
                <p className="text-slate-400 text-xs mt-1">Click "Add New Trainer" to register gym trainers.</p>
              </div>
            )}
          </div>

          {/* ADD TRAINER MODAL */}
          {showAddTrainer && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setShowAddTrainer(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New Trainer</h3>
                <p className="text-slate-500 text-sm mb-6">Register a personal trainer or group instructor.</p>

                <form onSubmit={handleAddTrainer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Marcus Vance"
                      value={trainerFullName}
                      onChange={(e) => setTrainerFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="marcus@gym.com"
                        value={trainerEmail}
                        onChange={(e) => setTrainerEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (Optional)</label>
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        value={trainerPhone}
                        onChange={(e) => setTrainerPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Bodybuilding, Yoga, HIIT"
                      value={trainerSpecialization}
                      onChange={(e) => setTrainerSpecialization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Brief info about experience or certifications..."
                      value={trainerBio}
                      onChange={(e) => setTrainerBio(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddTrainer(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Save Trainer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EQUIPMENT TAB ── */}
      {activeTab === "equipment" && (
        <div className="space-y-6">
          {/* STATS HEADER */}
          <div className="grid sm:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Equipment</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{eqTotal}</h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Working</p>
              <h3 className="text-2xl font-extrabold text-green-600 mt-1">{eqWorking}</h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Maintenance</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{eqMaintenance}</h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Broken</p>
              <h3 className="text-2xl font-extrabold text-red-600 mt-1">{eqBroken}</h3>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Equipment Inventory</h2>
              <p className="text-slate-500 text-xs mt-0.5">Track fitness machines, maintenance cycles, and condition status.</p>
            </div>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" /> Log Equipment
            </button>
          </div>

          {/* EQUIPMENT TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Equipment Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Last Inspection</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {equipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <Dumbbell className="w-4 h-4 text-indigo-500" />
                        {eq.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                          {eq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {eq.last_inspection ? new Date(eq.last_inspection).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          onClick={() => handleToggleStatus(eq.id, eq.status)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer select-none transition ${
                            eq.status === "Working"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : eq.status === "Under Maintenance"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                          title="Click to cycle status"
                        >
                          {eq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteEquipment(eq.id)}
                          className="text-slate-400 hover:text-red-500 font-bold p-1 transition"
                          title="Remove Equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {equipment.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No equipment logged yet. Click "Log Equipment" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD EQUIPMENT MODAL */}
          {showAddEquipment && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setShowAddEquipment(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Log New Equipment</h3>
                <p className="text-slate-500 text-sm mb-6">Inventory record for gyms and fitness centers.</p>

                <form onSubmit={handleAddEquipment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Cardio Run Pro Treadmill"
                      value={eqName}
                      onChange={(e) => setEqName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        value={eqCategory}
                        onChange={(e) => setEqCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {["Cardio", "Strength", "Flexibility", "Other"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                      <select
                        value={eqStatus}
                        onChange={(e) => setEqStatus(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Working">Working</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Broken">Broken</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Inspection Date</label>
                    <input
                      type="date"
                      required
                      value={eqInspection}
                      onChange={(e) => setEqInspection(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddEquipment(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Log Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
