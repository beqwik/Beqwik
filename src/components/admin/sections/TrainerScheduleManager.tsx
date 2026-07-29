import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  UserCheck,
  Dumbbell,
  Sparkles,
  Layers,
  Check
} from "lucide-react";
import {
  getTrainerSessions,
  createTrainerSession,
  updateTrainerSession,
  deleteTrainerSession,
  checkSchedulingConflict,
  formatTimeRangeDisplay,
  type TrainerSession
} from "../../../services/organization/trainerScheduleService";
import { getTrainers, type Trainer } from "../../../services/organization/gymService";
import { dashboardService } from "../../../services/dashboard/dashboardService";

interface TrainerScheduleManagerProps {
  organizationId: string;
  members?: any[];
}

// Session Type color configurations matching Google Calendar / Mindbody UI
const SESSION_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  "Personal Training": {
    bg: "bg-[#e8f8f0]",
    border: "border-[#bbf0d5]",
    text: "text-[#0e7a48]",
    badge: "bg-[#0e7a48] text-white"
  },
  "CrossFit": {
    bg: "bg-[#fef7e6]",
    border: "border-[#fde6b8]",
    text: "text-[#b45309]",
    badge: "bg-[#b45309] text-white"
  },
  "HIIT": {
    bg: "bg-[#fff0eb]",
    border: "border-[#ffd0c1]",
    text: "text-[#c2410c]",
    badge: "bg-[#c2410c] text-white"
  },
  "Yoga": {
    bg: "bg-[#f3eefc]",
    border: "border-[#ddd0fa]",
    text: "text-[#6d28d9]",
    badge: "bg-[#6d28d9] text-white"
  },
  "Group Class": {
    bg: "bg-[#eef2ff]",
    border: "border-[#c7d2fe]",
    text: "text-[#4338ca]",
    badge: "bg-[#4338ca] text-white"
  }
};

const DEFAULT_COLOR = {
  bg: "bg-slate-50",
  border: "border-slate-200",
  text: "text-slate-700",
  badge: "bg-slate-600 text-white"
};

// Timeline configuration (5:00 AM to 10:00 PM)
const START_HOUR = 5;  // 5:00 AM
const END_HOUR = 22;   // 10:00 PM
const HOUR_HEIGHT = 88; // pixels per hour (22px per 15 mins)

export default function TrainerScheduleManager({ organizationId }: TrainerScheduleManagerProps) {
  // Navigation & Date State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Data States
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Live Red Line State
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Modal / Drawer States
  const [selectedSession, setSelectedSession] = useState<TrainerSession | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModalDefaultTrainer, setNewModalDefaultTrainer] = useState("");
  const [newModalDefaultTime, setNewModalDefaultTime] = useState("08:00");

  // Form State for New / Edit Session
  const [formTrainerName, setFormTrainerName] = useState("");
  const [formMemberName, setFormMemberName] = useState("");
  const [formSessionName, setFormSessionName] = useState("");
  const [formSessionType, setFormSessionType] = useState<TrainerSession["session_type"]>("Personal Training");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("09:00");
  const [formNotes, setFormNotes] = useState("");
  const [formConflictWarning, setFormConflictWarning] = useState<string | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  // Member Dropdown Search State
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);

  // Scroll Container Ref
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Live Time Indicator Update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Trainers, Sessions & Members
  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const [fetchedTrainers, fetchedSessions, membersData] = await Promise.all([
        getTrainers(organizationId),
        getTrainerSessions(organizationId, selectedDate),
        dashboardService.getMembers(organizationId)
      ]);

      setTrainers(fetchedTrainers || []);
      setSessions(fetchedSessions || []);
      setOrgMembers(membersData || []);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close member dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Auto Scroll to Current Time on Mount
  useEffect(() => {
    if (gridContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollHour = Math.max(START_HOUR, Math.min(END_HOUR - 2, currentHour - 1));
      const scrollOffset = (scrollHour - START_HOUR) * HOUR_HEIGHT;
      gridContainerRef.current.scrollTop = scrollOffset;
    }
  }, [loading]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filter Trainers
  const displayTrainers = useMemo(() => {
    let list = trainers.filter((t) => t.status === "Active");
    if (selectedTrainerFilter !== "all") {
      list = list.filter((t) => t.full_name === selectedTrainerFilter || t.id === selectedTrainerFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.full_name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q));
    }
    return list.length > 0 ? list : trainers;
  }, [trainers, selectedTrainerFilter, searchQuery]);

  // Filter Sessions
  const displaySessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedTypeFilter !== "all" && s.session_type !== selectedTypeFilter) return false;
      if (selectedStatusFilter !== "all" && s.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTrainer = s.trainer_name.toLowerCase().includes(q);
        const matchMember = s.member_name.toLowerCase().includes(q);
        const matchSession = s.session_name.toLowerCase().includes(q);
        if (!matchTrainer && !matchMember && !matchSession) return false;
      }
      return true;
    });
  }, [sessions, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  // Time calculations for position
  const getSlotTopOffset = (startTimeStr: string) => {
    const parts = startTimeStr.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const totalMinsFromStart = (h - START_HOUR) * 60 + m;
    return (totalMinsFromStart / 60) * HOUR_HEIGHT;
  };

  const getSlotHeight = (durationMins: number) => {
    return Math.max(48, (durationMins / 60) * HOUR_HEIGHT);
  };

  // Live Red Line position
  const redLineTop = useMemo(() => {
    const startMins = START_HOUR * 60;
    const endMins = END_HOUR * 60;
    if (nowMinutes < startMins || nowMinutes > endMins) return null;
    const offsetMins = nowMinutes - startMins;
    return (offsetMins / 60) * HOUR_HEIGHT;
  }, [nowMinutes]);

  // Open New Session Modal on empty slot click
  const handleOpenNewModal = (trainerName: string, timeHour: number) => {
    const formattedHour = timeHour < 10 ? `0${timeHour}:00` : `${timeHour}:00`;
    const formattedEnd = timeHour + 1 < 10 ? `0${timeHour + 1}:00` : `${timeHour + 1}:00`;
    setFormTrainerName(trainerName);
    setFormMemberName("");
    setFormSessionName("Chest and Bicep");
    setFormSessionType("Personal Training");
    setFormStartTime(formattedHour);
    setFormEndTime(formattedEnd);
    setFormNotes("");
    setFormConflictWarning(null);
    setMemberSearch("");
    setMemberDropdownOpen(false);
    setShowNewModal(true);
  };

  // Check Conflict in Form
  const handleFormTimeChange = (start: string, end: string, trainer: string) => {
    setFormStartTime(start);
    setFormEndTime(end);
    if (!trainer || !start || !end) return;

    const conflict = checkSchedulingConflict(
      sessions,
      trainer,
      selectedDate,
      start,
      end,
      selectedSession?.id
    );

    if (conflict) {
      setFormConflictWarning(
        `⚠️ Scheduling Conflict: ${trainer} already has "${conflict.session_name}" with ${conflict.member_name} from ${conflict.start_time} to ${conflict.end_time}.`
      );
    } else {
      setFormConflictWarning(null);
    }
  };

  // Submit Create Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTrainerName || !formMemberName || !formSessionName) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setSavingSession(true);
      const startMins = (parseInt(formStartTime.split(":")[0]) || 0) * 60 + (parseInt(formStartTime.split(":")[1]) || 0);
      const endMins = (parseInt(formEndTime.split(":")[0]) || 0) * 60 + (parseInt(formEndTime.split(":")[1]) || 0);
      const duration = Math.max(15, endMins - startMins);

      const created = await createTrainerSession({
        organization_id: organizationId,
        trainer_name: formTrainerName,
        member_name: formMemberName,
        session_name: formSessionName,
        session_type: formSessionType,
        status: "Upcoming",
        session_date: selectedDate,
        start_time: formStartTime,
        end_time: formEndTime,
        duration_minutes: duration,
        notes: formNotes
      });

      setSessions((prev) => [...prev, created]);
      setMemberSearch("");
      setMemberDropdownOpen(false);
      setShowNewModal(false);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save session: " + (err.message || err));
    } finally {
      setSavingSession(false);
    }
  };

  // Mark Session Status / Attendance
  const handleUpdateSessionStatus = async (status: TrainerSession["status"]) => {
    if (!selectedSession) return;
    try {
      const updated = await updateTrainerSession(selectedSession.id, { status });
      setSessions((prev) => prev.map((s) => (s.id === selectedSession.id ? updated : s)));
      setSelectedSession(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  // Delete Session
  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    if (!confirm("Are you sure you want to cancel and delete this session?")) return;
    try {
      await deleteTrainerSession(selectedSession.id);
      setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id));
      setShowDrawer(false);
      setSelectedSession(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete session.");
    }
  };

  // Format Date String for Header
  const formattedHeaderDate = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }, [selectedDate]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* ── TOP ACTION & CONTROL BAR ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Title & View Selector */}
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <CalendarIcon className="w-5 h-5 text-indigo-600" /> Trainer's Schedule
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Simultaneous timeline view for all certified trainers and class bookings.
            </p>
          </div>

          {/* Navigation Controls & Today Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-[14px]">
              <button
                onClick={handlePrevDay}
                className="p-2 hover:bg-white text-slate-600 hover:text-slate-900 rounded-[10px] transition shadow-2xs"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-white text-slate-900 text-xs font-extrabold rounded-[10px] shadow-xs transition"
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-white text-slate-600 hover:text-slate-900 rounded-[10px] transition shadow-2xs"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
              />
            </div>

            {/* View Switcher (Day / Week / Month) */}
            <div className="flex bg-slate-100 p-1 rounded-[14px] text-xs font-extrabold">
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-[10px] capitalize transition ${
                    viewMode === mode
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* New Session CTA */}
            <button
              onClick={() => {
                setFormTrainerName(displayTrainers[0]?.full_name || "Martin Diaz");
                setFormMemberName("");
                setFormSessionName("Chest and Bicep");
                setFormSessionType("Personal Training");
                setFormStartTime("08:00");
                setFormEndTime("09:00");
                setFormNotes("");
                setFormConflictWarning(null);
                setShowNewModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" /> Add Session
            </button>
          </div>
        </div>

        {/* ── SECONDARY FILTERS & SEARCH ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trainer, member, workout..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>

          {/* Trainer Filter */}
          <div>
            <select
              value={selectedTrainerFilter}
              onChange={(e) => setSelectedTrainerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              <option value="all">All Trainers ({trainers.length})</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.full_name}>
                  {t.full_name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Session Type Filter */}
          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              <option value="all">All Workout Types</option>
              <option value="Personal Training">Personal Training</option>
              <option value="CrossFit">CrossFit</option>
              <option value="Group Class">Group Class</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── GOOGLE CALENDAR / MINDBODY TIMELINE CONTAINER ── */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Date Display Ribbon */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/70 flex justify-between items-center text-xs font-bold text-slate-600">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Schedule for <strong className="text-slate-900">{formattedHeaderDate}</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            {displayTrainers.length} Trainers Active • {displaySessions.length} Sessions Total
          </span>
        </div>

        {/* Timeline Grid Table */}
        <div
          ref={gridContainerRef}
          className="overflow-x-auto overflow-y-auto max-h-[720px] relative custom-scrollbar"
        >
          <div className="min-w-[980px] relative">
            {/* ── STICKY TRAINER HEADERS ── */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200/90 flex divide-x divide-slate-100 shadow-2xs">
              {/* Top-left empty corner (sticky left + top) */}
              <div className="sticky left-0 z-40 bg-white w-24 shrink-0 border-r border-slate-200/90 p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  TIME
                </span>
              </div>

              {/* Trainer Column Headers */}
              {displayTrainers.map((trainer) => {
                const trainerSessionsCount = displaySessions.filter(
                  (s) => s.trainer_name === trainer.full_name
                ).length;

                return (
                  <div
                    key={trainer.id}
                    className="flex-1 min-w-[200px] p-4 text-center bg-white hover:bg-slate-50/50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm mb-2">
                      {trainer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {trainer.full_name}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                      {trainer.specialization}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full border border-indigo-100">
                        {trainerSessionsCount} Sessions Today
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── MAIN TIMELINE BODY ── */}
            <div className="relative flex divide-x divide-slate-100">
              {/* ── LEFT TIME AXIS ── */}
              <div className="sticky left-0 z-20 bg-white w-24 shrink-0 border-r border-slate-200/90 divide-y divide-slate-100">
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, idx) => {
                  const hour = START_HOUR + idx;
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  const formattedHourStr = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;

                  return (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="p-3 text-right text-[11px] font-extrabold text-slate-400 relative select-none flex flex-col justify-between"
                    >
                      <span className="text-slate-500">
                        {formattedHourStr} {ampm}
                      </span>
                      <span className="text-[9px] text-slate-300 font-semibold">
                        -- :30
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── TRAINER COLUMNS & SESSION CARDS ── */}
              {displayTrainers.map((trainer) => {
                const trainerSessions = displaySessions.filter(
                  (s) => s.trainer_name === trainer.full_name
                );

                return (
                  <div
                    key={trainer.id}
                    className="flex-1 min-w-[200px] relative divide-y divide-slate-100 bg-[#fafafa]/40"
                  >
                    {/* Hourly Horizontal Grid Lines */}
                    {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, idx) => {
                      const hour = START_HOUR + idx;
                      return (
                        <div
                          key={hour}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          onClick={() => handleOpenNewModal(trainer.full_name, hour)}
                          className="hover:bg-indigo-50/20 cursor-pointer transition relative group"
                          title={`Click to schedule session for ${trainer.full_name} at ${hour}:00`}
                        >
                          {/* 30-min dashed line */}
                          <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-200/60 pointer-events-none" />
                        </div>
                      );
                    })}

                    {/* Render Session Cards */}
                    {trainerSessions.map((session) => {
                      const top = getSlotTopOffset(session.start_time);
                      const height = getSlotHeight(session.duration_minutes);
                      const colorTheme = SESSION_TYPE_COLORS[session.session_type] || DEFAULT_COLOR;

                      return (
                        <motion.div
                          key={session.id}
                          layoutId={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                            setShowDrawer(true);
                          }}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: "6px",
                            right: "6px",
                            position: "absolute"
                          }}
                          whileHover={{ scale: 1.01, zIndex: 25 }}
                          className={`rounded-[14px] border ${colorTheme.bg} ${colorTheme.border} p-3 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between overflow-hidden group border-l-4`}
                        >
                          {/* Card Header: Session Name & Time */}
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h5 className={`font-extrabold text-xs leading-snug truncate ${colorTheme.text}`}>
                                {session.session_name}
                              </h5>
                              <span className="text-[10px] font-extrabold text-slate-500 shrink-0">
                                {formatTimeRangeDisplay(session.start_time, session.end_time)}
                              </span>
                            </div>
                          </div>

                          {/* Member Footer */}
                          <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-slate-200/40">
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                              {session.member_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 truncate">
                              {session.member_name}
                            </span>
                            {session.status === "Completed" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}

              {/* ── LIVE RED TIME INDICATOR LINE ── */}
              {redLineTop !== null && (
                <div
                  style={{ top: `${redLineTop}px` }}
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                >
                  <div className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-sm -ml-1.5 shrink-0" />
                  <div className="flex-1 h-0.5 bg-rose-500 shadow-xs" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SESSION DETAILS SIDE DRAWER ── */}
      <AnimatePresence>
        {showDrawer && selectedSession && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">
                    Session Details
                  </span>
                  <h3 className="text-lg font-black">{selectedSession.session_name}</h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Status Badge & Actions */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-[16px] border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CURRENT STATUS
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black capitalize ${
                        selectedSession.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedSession.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateSessionStatus("Completed")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-[10px] transition shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Complete
                    </button>
                    <button
                      onClick={() => handleUpdateSessionStatus("Cancelled")}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-[10px] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  {/* Trainer */}
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-[14px] border border-slate-100">
                    <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Trainer</p>
                      <p className="text-xs font-extrabold text-slate-900">{selectedSession.trainer_name}</p>
                    </div>
                  </div>

                  {/* Member */}
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-[14px] border border-slate-100">
                    <User className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Member</p>
                      <p className="text-xs font-extrabold text-slate-900">{selectedSession.member_name}</p>
                    </div>
                  </div>

                  {/* Schedule Time */}
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-[14px] border border-slate-100">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Time & Duration</p>
                      <p className="text-xs font-extrabold text-slate-900">
                        {formatTimeRangeDisplay(selectedSession.start_time, selectedSession.end_time)} ({selectedSession.duration_minutes} mins)
                      </p>
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-[14px] border border-slate-100">
                    <Dumbbell className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Workout Category</p>
                      <p className="text-xs font-extrabold text-slate-900">{selectedSession.session_type}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSession.notes && (
                    <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-[14px]">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Session Notes</p>
                      <p className="text-xs text-amber-900 font-medium mt-1 leading-relaxed">{selectedSession.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={handleDeleteSession}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold rounded-[12px] transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Session
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-extrabold rounded-[12px] transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── NEW SESSION MODAL ── */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Schedule New Session</h3>
                    <p className="text-indigo-100 text-xs font-medium">Assign workout session to a trainer</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                {formConflictWarning && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-[14px] text-amber-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{formConflictWarning}</span>
                  </div>
                )}

                {/* Trainer Select */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    Trainer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTrainerName}
                    onChange={(e) => {
                      setFormTrainerName(e.target.value);
                      handleFormTimeChange(formStartTime, formEndTime, e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                    required
                  >
                    {displayTrainers.map((t) => (
                      <option key={t.id} value={t.full_name}>
                        {t.full_name} ({t.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Member Name — Searchable Dropdown */}
                <div className="relative" ref={memberDropdownRef}>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    Member Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={memberSearch || formMemberName}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setFormMemberName(e.target.value);
                      setMemberDropdownOpen(true);
                    }}
                    onFocus={() => setMemberDropdownOpen(true)}
                    placeholder={orgMembers.length > 0 ? "Search member..." : "No members found"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                    required
                    autoComplete="off"
                  />
                  {memberDropdownOpen && orgMembers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-[14px] shadow-xl overflow-hidden max-h-44 overflow-y-auto">
                      {orgMembers
                        .filter((m) =>
                          !memberSearch ||
                          m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.email?.toLowerCase().includes(memberSearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setFormMemberName(m.full_name || m.email || "");
                              setMemberSearch("");
                              setMemberDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition text-xs"
                          >
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                              {(m.full_name || m.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{m.full_name || "—"}</p>
                              <p className="text-slate-400 text-[10px]">{m.email}</p>
                            </div>
                          </button>
                        ))}
                      {orgMembers.filter((m) =>
                        !memberSearch ||
                        m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        m.email?.toLowerCase().includes(memberSearch.toLowerCase())
                      ).length === 0 && (
                        <p className="px-4 py-3 text-xs text-slate-400 font-medium">No members match "{memberSearch}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Session Name & Category Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      Workout Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formSessionName}
                      onChange={(e) => setFormSessionName(e.target.value)}
                      placeholder="e.g. Chest and Bicep"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      Session Type
                    </label>
                    <select
                      value={formSessionType}
                      onChange={(e) => setFormSessionType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                    >
                      <option value="Personal Training">Personal Training</option>
                      <option value="CrossFit">CrossFit</option>
                      <option value="Group Class">Group Class</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Yoga">Yoga</option>
                    </select>
                  </div>
                </div>

                {/* Start & End Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => handleFormTimeChange(e.target.value, formEndTime, formTrainerName)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => handleFormTimeChange(formStartTime, e.target.value, formTrainerName)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Specific workout instructions or equipment requirements..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[14px] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSession}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-extrabold rounded-[14px] shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
                  >
                    {savingSession ? "Saving..." : "Save Session"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
