import React, { useState, useEffect } from "react";
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
  Trash2
} from "lucide-react";

interface GymSectionProps {
  activeTab: string;
  organizationId: string;
  members: any[];
}

interface GymSlot {
  id: string;
  trainerName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

interface GymEquipment {
  id: string;
  name: string;
  category: string;
  status: "Working" | "Under Maintenance" | "Broken";
  lastInspection: string;
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

  // Load from local storage scoped by organization
  useEffect(() => {
    if (!organizationId) return;

    const storedSlots = localStorage.getItem(`gym_slots_${organizationId}`);
    if (storedSlots) {
      setSlots(JSON.parse(storedSlots));
    } else {
      // Default slots
      const defaultSlots = [
        { id: "1", trainerName: "Alex Mercer", dayOfWeek: "Monday", startTime: "07:00", endTime: "08:30", maxCapacity: 10 },
        { id: "2", trainerName: "Sarah Connor", dayOfWeek: "Tuesday", startTime: "18:00", endTime: "19:30", maxCapacity: 12 },
        { id: "3", trainerName: "Mike Tyson", dayOfWeek: "Wednesday", startTime: "06:00", endTime: "07:30", maxCapacity: 8 }
      ];
      setSlots(defaultSlots);
      localStorage.setItem(`gym_slots_${organizationId}`, JSON.stringify(defaultSlots));
    }

    const storedBookings = localStorage.getItem(`gym_bookings_${organizationId}`);
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      setBookings({});
    }

    const storedEquipment = localStorage.getItem(`gym_equipment_${organizationId}`);
    if (storedEquipment) {
      setEquipment(JSON.parse(storedEquipment));
    } else {
      // Default equipment
      const defaultEquipment: GymEquipment[] = [
        { id: "1", name: "Treadmill Pro-X", category: "Cardio", status: "Working", lastInspection: "2026-06-15" },
        { id: "2", name: "Dumbbell Set (2.5kg - 30kg)", category: "Strength", status: "Working", lastInspection: "2026-06-20" },
        { id: "3", name: "Stationary Bike v3", category: "Cardio", status: "Under Maintenance", lastInspection: "2026-06-10" },
        { id: "4", name: "Leg Press Machine", category: "Strength", status: "Broken", lastInspection: "2026-06-22" }
      ];
      setEquipment(defaultEquipment);
      localStorage.setItem(`gym_equipment_${organizationId}`, JSON.stringify(defaultEquipment));
    }
  }, [organizationId]);

  // Save updates helper
  const saveSlots = (updated: GymSlot[]) => {
    setSlots(updated);
    localStorage.setItem(`gym_slots_${organizationId}`, JSON.stringify(updated));
  };

  const saveBookings = (updated: Record<string, string[]>) => {
    setBookings(updated);
    localStorage.setItem(`gym_bookings_${organizationId}`, JSON.stringify(updated));
  };

  const saveEquipment = (updated: GymEquipment[]) => {
    setEquipment(updated);
    localStorage.setItem(`gym_equipment_${organizationId}`, JSON.stringify(updated));
  };

  // Add training slot
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: GymSlot = {
      id: Date.now().toString(),
      trainerName,
      dayOfWeek,
      startTime,
      endTime,
      maxCapacity: parseInt(maxCapacity) || 10
    };
    const updated = [...slots, newSlot];
    saveSlots(updated);
    setShowAddSlot(false);
    setTrainerName("");
    setDayOfWeek("Monday");
    setStartTime("09:00");
    setEndTime("10:00");
    setMaxCapacity("15");
  };

  // Delete slot
  const handleDeleteSlot = (id: string) => {
    if (!confirm("Are you sure you want to remove this training slot?")) return;
    const updated = slots.filter((s) => s.id !== id);
    saveSlots(updated);
    // Also remove bookings for this slot
    const updatedBookings = { ...bookings };
    delete updatedBookings[id];
    saveBookings(updatedBookings);
  };

  // Book a slot for a member
  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedMemberId) return;

    const currentBookings = bookings[selectedSlotId] || [];
    if (currentBookings.includes(selectedMemberId)) {
      alert("This member is already registered in this slot.");
      return;
    }

    const slot = slots.find((s) => s.id === selectedSlotId);
    if (slot && currentBookings.length >= slot.maxCapacity) {
      alert("This slot is already at full capacity.");
      return;
    }

    const updatedBookings = {
      ...bookings,
      [selectedSlotId]: [...currentBookings, selectedMemberId]
    };
    saveBookings(updatedBookings);
    setSelectedSlotId(null);
    setSelectedMemberId("");
    alert("Slot successfully booked for member!");
  };

  // Remove a booking
  const handleCancelBooking = (slotId: string, memberId: string) => {
    if (!confirm("Are you sure you want to remove this booking?")) return;
    const current = bookings[slotId] || [];
    const updatedBookings = {
      ...bookings,
      [slotId]: current.filter((id) => id !== memberId)
    };
    saveBookings(updatedBookings);
  };

  // Add Equipment
  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newEq: GymEquipment = {
      id: Date.now().toString(),
      name: eqName,
      category: eqCategory,
      status: eqStatus,
      lastInspection: eqInspection
    };
    const updated = [...equipment, newEq];
    saveEquipment(updated);
    setShowAddEquipment(false);
    setEqName("");
    setEqCategory("Cardio");
    setEqStatus("Working");
    setEqInspection(new Date().toISOString().split("T")[0]);
  };

  // Delete Equipment
  const handleDeleteEquipment = (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    const updated = equipment.filter((eq) => eq.id !== id);
    saveEquipment(updated);
  };

  // Toggle Equipment Status
  const handleToggleStatus = (id: string, currentStatus: GymEquipment["status"]) => {
    const statuses: GymEquipment["status"][] = ["Working", "Under Maintenance", "Broken"];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    const updated = equipment.map((eq) => {
      if (eq.id === id) {
        return { 
          ...eq, 
          status: nextStatus,
          lastInspection: new Date().toISOString().split("T")[0]
        };
      }
      return eq;
    });
    saveEquipment(updated);
  };

  // Calculate slots metrics
  const totalBookingsCount = Object.values(bookings).reduce((acc, curr) => acc + curr.length, 0);
  const totalCapacity = slots.reduce((acc, curr) => acc + curr.maxCapacity, 0);
  const slotsEnrolledPercent = totalCapacity > 0 ? Math.round((totalBookingsCount / totalCapacity) * 100) : 0;

  // Calculate equipment metrics
  const eqTotal = equipment.length;
  const eqWorking = equipment.filter((e) => e.status === "Working").length;
  const eqMaintenance = equipment.filter((e) => e.status === "Under Maintenance").length;
  const eqBroken = equipment.filter((e) => e.status === "Broken").length;
  const eqOperationalPercent = eqTotal > 0 ? Math.round((eqWorking / eqTotal) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
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
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Capacity Booked</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{slotsEnrolledPercent}%</h3>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="flex justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Training Schedules & Bookings</h3>
            <button
              onClick={() => setShowAddSlot(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Training Slot
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => {
              const currentBookedIds = bookings[slot.id] || [];
              const vacancy = slot.maxCapacity - currentBookedIds.length;

              return (
                <div key={slot.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                        {slot.dayOfWeek}
                      </span>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">{slot.trainerName}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>

                    {/* BOOKINGS LIST */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>Enrolled Members</span>
                        <span>{currentBookedIds.length} / {slot.maxCapacity}</span>
                      </div>

                      {currentBookedIds.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 border border-slate-50 rounded-lg p-1.5 bg-slate-50/50">
                          {currentBookedIds.map((mId) => {
                            const member = members.find((m) => m.id === mId);
                            return (
                              <div key={mId} className="flex justify-between items-center bg-white border border-slate-100 rounded-md px-2 py-1 text-xs">
                                <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                  {member?.full_name || "Unknown Member"}
                                </span>
                                <button
                                  onClick={() => handleCancelBooking(slot.id, mId)}
                                  className="text-slate-400 hover:text-red-500 font-bold"
                                  title="Cancel Registration"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50/20 border border-dashed border-slate-200 rounded-lg">
                          No members registered.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-4">
                    <span className={`text-xs font-bold uppercase ${vacancy > 0 ? "text-green-600" : "text-red-500"}`}>
                      {vacancy > 0 ? `${vacancy} spots left` : "Slot Full"}
                    </span>
                    <button
                      onClick={() => setSelectedSlotId(slot.id)}
                      disabled={vacancy <= 0}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Member
                    </button>
                  </div>
                </div>
              );
            })}

            {slots.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-450 italic">
                No training slots scheduled. Click "Add Training Slot" to create one.
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
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Add Training Slot</h3>
                <p className="text-slate-500 text-sm mb-6">Schedule a slot for group sessions or personal trainers.</p>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Trainer / Instructor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., John Miller"
                      value={trainerName}
                      onChange={(e) => setTrainerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
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

          {/* BOOK MEMBER MODAL */}
          {selectedSlotId && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setSelectedSlotId(null)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Book Slot</h3>
                <p className="text-slate-500 text-sm mb-6">Select a registered member to book for this training slot.</p>

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
                          {m.full_name} ({m.email})
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
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EQUIPMENT TRACKER TAB ── */}
      {activeTab === "equipment" && (
        <div className="space-y-6">
          {/* STATS HEADER */}
          <div className="grid sm:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Equipment</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{eqTotal}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Operational</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{eqWorking} ({eqOperationalPercent}%)</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Maintenance</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{eqMaintenance}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Broken / Out</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{eqBroken}</h3>
              </div>
            </div>
          </div>

          {/* EQUIPMENT HEADER */}
          <div className="flex justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Equipment Inspection Status</h3>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Log Equipment
            </button>
          </div>

          {/* TABLE LOG */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-4">Equipment Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Inspection Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {equipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{eq.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-xs">
                          {eq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {eq.lastInspection}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          onClick={() => handleToggleStatus(eq.id, eq.status)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition ${
                            eq.status === "Working"
                              ? "bg-green-50 text-green-700 border border-green-150"
                              : eq.status === "Under Maintenance"
                              ? "bg-amber-50 text-amber-700 border border-amber-150"
                              : "bg-red-50 text-red-650 border border-red-150"
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
