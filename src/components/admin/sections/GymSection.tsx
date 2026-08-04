import React, { useState, useEffect, useCallback } from "react";
import { Dumbbell, Calendar, Plus, Clock, Users, Check, X, AlertTriangle, Activity, Trash2, UserCheck, ShieldCheck, UserPlus, Trophy, Target, Mail, Phone, CheckCircle2, XCircle, Wrench, Megaphone } from "lucide-react";
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
import TrainerScheduleManager from "./TrainerScheduleManager";

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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function GymSection({ activeTab, organizationId, members }: GymSectionProps) {
  // Slots Sub-Tab state: "slots" (Manage Recurring Slots) vs "timeline" (Simultaneous Timeline)
  const [slotsSubTab, setSlotsSubTab] = useState<"slots" | "timeline">("slots");

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

      if (fetchedTrainers.length > 0 && !trainerName) {
        setTrainerName(fetchedTrainers[0].full_name);
      }
    } catch (err) {
      console.error("Error loading gym data:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, trainerName]);

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
        trainer_name: trainerName || (trainers.length > 0 ? trainers[0].full_name : "General Trainer"),
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
      const msg = err?.message || err?.error_description || "Failed to save trainer.";
      alert(msg);
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
      {/* ── TRAINING SLOTS / TRAINER SCHEDULE TAB ── */}
      {(activeTab === "slots" || activeTab === "trainer-schedule") && (
        <div className="space-y-6">
          {/* VIEW SWITCHER SUB-NAV BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1.5">
              <button
                onClick={() => setSlotsSubTab("slots")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  slotsSubTab === "slots"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Calendar className="w-4 h-4" /> Training Slots ({slots.length})
              </button>
              <button
                onClick={() => setSlotsSubTab("timeline")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  slotsSubTab === "timeline"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" /> Timeline Schedule View
              </button>
            </div>

            {slotsSubTab === "slots" && (
              <button
                onClick={() => {
                  if (trainers.length > 0 && !trainerName) {
                    setTrainerName(trainers[0].full_name);
                  }
                  setShowAddSlot(true);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" /> Create Training Slot
              </button>
            )}
          </div>

          {/* VIEW 1: RECURRING TRAINING SLOTS MANAGEMENT */}
          {slotsSubTab === "slots" && (
            <div className="space-y-6">
              {/* METRIC CARDS */}
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Training Slots</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{slots.length}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Enrolled Members</p>
                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalBookingsCount}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-lg">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Capacity Enrollment</p>
                    <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{slotsEnrolledPercent}%</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{totalBookingsCount} / {totalCapacity} spots filled</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* SLOTS GRID */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot) => {
                  const enrolledMemberIds = bookings[slot.id] || [];
                  const count = enrolledMemberIds.length;
                  const percent = Math.round((count / slot.max_capacity) * 100);

                  return (
                    <div key={slot.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        {/* Slot Header */}
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-wider rounded-lg border border-indigo-100">
                            {slot.day_of_week}
                          </span>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Slot Details */}
                        <div className="mt-4">
                          <h4 className="font-extrabold text-slate-900 text-lg">Trainer: {slot.trainer_name}</h4>
                          <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            Time: {slot.start_time} - {slot.end_time}
                          </p>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="mt-5">
                          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                            <span className="text-slate-600">Capacity Enrolled</span>
                            <span className={count >= slot.max_capacity ? "text-amber-600" : "text-indigo-600"}>
                              {count}/{slot.max_capacity} Enrolled
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                count >= slot.max_capacity ? "bg-amber-500" : "bg-indigo-600"
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>

                        {/* Enrolled Members List */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Enrolled Members ({count})
                          </p>
                          {count > 0 ? (
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                              {enrolledMemberIds.map((mId) => {
                                const memberObj = members.find((m) => m.id === mId);
                                const memberName = memberObj?.full_name || memberObj?.email || `Member (${mId.slice(0, 6)})`;
                                return (
                                  <div key={mId} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                        {memberName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-semibold text-slate-800 truncate">{memberName}</span>
                                    </div>
                                    <button
                                      onClick={() => handleCancelBooking(slot.id, mId)}
                                      className="text-slate-400 hover:text-red-500 transition text-[11px] font-bold"
                                      title="Cancel Booking"
                                    >
                                      <X className="w-4 h-4 inline-block" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No members reserved for this slot yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setSelectedMemberId(members.length > 0 ? members[0].id : "");
                          }}
                          disabled={count >= slot.max_capacity}
                          className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {count >= slot.max_capacity ? "Slot Full" : "Enroll Member"}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {slots.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-base">No Training Slots Created Yet</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                      Create training slots for your trainers (e.g. Monday 09:00 - 10:00 Trainer: ABC). Members will see these slots on their dashboard to book reservations.
                    </p>
                    <button
                      onClick={() => setShowAddSlot(true)}
                      className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
                    >
                      + Create First Training Slot
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: SIMULTANEOUS TIMELINE VIEW */}
          {slotsSubTab === "timeline" && (
            <TrainerScheduleManager organizationId={organizationId} members={members} />
          )}

          {/* CREATE TRAINING SLOT MODAL */}
          {showAddSlot && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-7 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  <X className="w-4 h-4 inline-block" />
                </button>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Create Training Slot</h3>
                <p className="text-slate-500 text-xs mb-5">Members can view and reserve this slot on their dashboard.</p>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Trainer / Instructor <span className="text-rose-500">*</span>
                    </label>
                    {trainers.length > 0 ? (
                      <select
                        value={trainerName}
                        onChange={(e) => setTrainerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                        required
                      >
                        {trainers.map((t) => (
                          <option key={t.id} value={t.full_name}>
                            {t.full_name} ({t.specialization})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={trainerName}
                        onChange={(e) => setTrainerName(e.target.value)}
                        placeholder="e.g. ABC"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Day of Week <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      required
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Start Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        End Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Max Member Capacity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
                    >
                      Create Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ENROLL MEMBER MODAL */}
          {selectedSlotId && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-7 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setSelectedSlotId(null)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  <X className="w-4 h-4 inline-block" />
                </button>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Enroll Member into Slot</h3>
                <p className="text-slate-500 text-xs mb-5">Select a registered gym member to reserve this slot.</p>

                <form onSubmit={handleBookSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Member <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name || m.email} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSlotId(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
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
                    <Target className="w-5 h-5 inline-block text-red-500" /> {trainer.specialization}
                  </span>
                  {trainer.bio && <p className="text-slate-500 text-xs mt-2 line-clamp-2">{trainer.bio}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  {trainer.email && <p><Mail className="w-4 h-4 inline-block text-slate-400" />️ {trainer.email}</p>}
                  {trainer.phone && <p><Phone className="w-4 h-4 inline-block text-slate-400" /> {trainer.phone}</p>}
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
              <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-8 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowAddTrainer(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  <X className="w-4 h-4 inline-block" />
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New Trainer</h3>
                <p className="text-slate-500 text-sm mb-6">Register a personal trainer or group instructor.</p>

                <form onSubmit={handleAddTrainer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={trainerFullName}
                      onChange={(e) => setTrainerFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={trainerEmail}
                      onChange={(e) => setTrainerEmail(e.target.value)}
                      placeholder="alex@gym.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={trainerPhone}
                      onChange={(e) => setTrainerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                    <select
                      value={trainerSpecialization}
                      onChange={(e) => setTrainerSpecialization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="General Fitness">General Fitness</option>
                      <option value="Personal Training">Personal Training</option>
                      <option value="CrossFit & Strength">CrossFit & Strength</option>
                      <option value="HIIT & Cardio">HIIT & Cardio</option>
                      <option value="Yoga & Core">Yoga & Core</option>
                      <option value="Bodybuilding">Bodybuilding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Notes</label>
                    <textarea
                      rows={2}
                      value={trainerBio}
                      onChange={(e) => setTrainerBio(e.target.value)}
                      placeholder="Certifications, experience..."
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
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-200"
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
          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Equipment Inventory & Health Status</h2>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Track machines, free weights, inspection dates, and maintenance logs.</p>
            </div>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" /> Log New Equipment
            </button>
          </div>

          {/* EQUIPMENT GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                      item.status === "Working"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : item.status === "Under Maintenance"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {item.status === "Working" && <Check className="w-3 h-3" />}
                    {item.status === "Under Maintenance" && <Clock className="w-3 h-3" />}
                    {item.status === "Broken" && <AlertTriangle className="w-3 h-3" />}
                    {item.status}
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-slate-900 text-lg">{item.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Last Inspection: {item.last_inspection ? new Date(item.last_inspection).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 italic">Click status to toggle</span>
                  <button
                    onClick={() => handleDeleteEquipment(item.id)}
                    className="text-slate-400 hover:text-red-500 font-bold p-1 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}

            {equipment.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">No gym equipment logged yet.</p>
                <p className="text-slate-400 text-xs mt-1">Click "Log New Equipment" to add machines, treadmills, weights...</p>
              </div>
            )}
          </div>

          {/* ADD EQUIPMENT MODAL */}
          {showAddEquipment && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-8 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowAddEquipment(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  <X className="w-4 h-4 inline-block" />
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Log New Equipment</h3>
                <p className="text-slate-500 text-sm mb-6">Add machine or weight set to tracking roster.</p>

                <form onSubmit={handleAddEquipment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercial Treadmill T80"
                      value={eqName}
                      onChange={(e) => setEqName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
