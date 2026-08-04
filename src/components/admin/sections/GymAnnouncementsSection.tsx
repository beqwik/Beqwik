import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus, Trash2, BellRing, AlertTriangle, Loader2, Sparkles, X } from "lucide-react";
import {
  getGymAnnouncements,
  createGymAnnouncement,
  deleteGymAnnouncement,
  type GymAnnouncement,
} from "../../../services/organization/gymAnnouncementsService";

interface GymAnnouncementsSectionProps {
  organizationId: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-rose-100 text-rose-700 border border-rose-200",
  high: "bg-amber-100 text-amber-700 border border-amber-200",
  normal: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  low: "bg-slate-100 text-slate-600 border border-slate-200",
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  normal: "bg-indigo-500",
  low: "bg-slate-400",
};

// ─── Create Announcement Modal ───────────────────────
interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    message: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => Promise<void>;
}

function CreateGymAnnouncementModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill in both the title and message fields.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      await onSubmit({ title: title.trim(), message: message.trim(), priority });
      setTitle("");
      setMessage("");
      setPriority("normal");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to publish announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-blue-600 hover:bg-blue-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">New Gym Announcement</h3>
              <p className="text-white/80 text-xs font-medium">Broadcast alert to all gym members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gym Closed on Sunday — Public Holiday"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e05275] focus:bg-white transition"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-[#e05275]" /> Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["low", "normal", "high", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-[12px] text-[11px] font-black capitalize border transition ${
                    priority === p
                      ? PRIORITY_STYLES[p]
                      : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Announcement Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the notice clearly — schedule changes, maintenance alerts, event announcements..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[16px] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e05275] focus:bg-white transition resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[14px] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 hover:opacity-95 text-white text-xs font-black rounded-[14px] shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Publish Announcement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Gym Announcements Section ─────────────────
export default function GymAnnouncementsSection({
  organizationId,
}: GymAnnouncementsSectionProps) {
  const [announcements, setAnnouncements] = useState<GymAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const data = await getGymAnnouncements(organizationId);
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching gym announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (data: {
    title: string;
    message: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => {
    const created = await createGymAnnouncement({
      organization_id: organizationId,
      ...data,
    });
    setAnnouncements((prev) => [created, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gym announcement? This action cannot be undone.")) return;
    try {
      setDeletingId(id);
      await deleteGymAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      alert("Failed to delete announcement.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#e05275]" />
            Gym Announcements
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Post gym-wide alerts and notices — visible only to members of your gym.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(["urgent", "high", "normal"] as const).map((p) => {
          const count = announcements.filter((a) => a.priority === p).length;
          return (
            <div
              key={p}
              className="bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm flex items-center gap-3"
            >
              <div className={`w-3 h-3 rounded-full ${PRIORITY_DOT[p]}`} />
              <div>
                <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider capitalize">
                  {p} Priority
                </p>
                <p className="text-xl font-black text-slate-900">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading announcements...</span>
          </div>
        ) : announcements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-5 hover:bg-slate-50/60 transition group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                {/* Left Content */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className={`w-1 rounded-full self-stretch shrink-0 ${PRIORITY_DOT[anc.priority]}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${PRIORITY_STYLES[anc.priority]}`}
                      >
                        {anc.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {formatDate(anc.created_at)}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{anc.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">{anc.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      Posted by: <span className="font-bold text-slate-600">{anc.author}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(anc.id)}
                    disabled={deletingId === anc.id}
                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-2 rounded-[10px] hover:bg-rose-50 disabled:opacity-50"
                    title="Delete announcement"
                  >
                    {deletingId === anc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e05275]/10 to-[#b55fe6]/10 border border-[#e05275]/20 flex items-center justify-center mx-auto">
              <Megaphone className="w-7 h-7 text-[#e05275]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600">No gym announcements yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Broadcast notices about gym closures, events, or facility updates.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-bold text-[#e05275] hover:text-[#c44f8e] underline"
            >
              Post the first announcement now
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateGymAnnouncementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
