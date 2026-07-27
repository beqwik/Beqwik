import { useState } from "react";
import { BellRing, Plus, Trash2, Megaphone } from "lucide-react";
import type { AnnouncementItem } from "../../../../services/organization/academyService";
import CreateAnnouncementModal from "./modals/CreateAnnouncementModal";

interface AnnouncementsModuleProps {
  announcements: AnnouncementItem[];
  onCreateAnnouncement: (anc: any) => Promise<void> | void;
  onDeleteAnnouncement?: (id: string) => Promise<void> | void;
}

export default function AnnouncementsModule({
  announcements,
  onCreateAnnouncement,
  onDeleteAnnouncement
}: AnnouncementsModuleProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-600" /> Notice Board & Announcements
          </h2>
          <p className="text-slate-500 text-xs font-medium">Broadcast notices and announcements to students and teachers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-indigo-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((anc) => (
            <div
              key={anc.id}
              className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 rounded-[18px] p-5 space-y-3 transition group relative"
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      anc.priority === "urgent"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : anc.priority === "high"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    }`}
                  >
                    {anc.priority} Priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-200/70 text-slate-700">
                    Target: {anc.target_audience}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold">{anc.created_at}</span>
                  {onDeleteAnnouncement && (
                    <button
                      onClick={() => onDeleteAnnouncement(anc.id)}
                      title="Delete Announcement"
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{anc.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mt-1">{anc.content}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>Posted by: <strong className="text-slate-600">{anc.author}</strong></span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-[18px] border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-500">No announcements posted yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              Post the first announcement now
            </button>
          </div>
        )}
      </div>

      {/* Modern Modal Component */}
      <CreateAnnouncementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (newAnc) => {
          await onCreateAnnouncement(newAnc);
        }}
      />
    </div>
  );
}
