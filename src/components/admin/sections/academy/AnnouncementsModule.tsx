import { BellRing, Plus } from "lucide-react";
import type { AnnouncementItem } from "../../../../services/organization/academyService";

interface AnnouncementsModuleProps {
  announcements: AnnouncementItem[];
  onCreateAnnouncement: (anc: any) => void;
}

export default function AnnouncementsModule({ announcements, onCreateAnnouncement }: AnnouncementsModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-orange-500" /> Notice Board & Announcements
          </h2>
          <p className="text-slate-500 text-xs font-medium">Broadcast notices to students and teachers</p>
        </div>
        <button
          onClick={() => {
            const title = prompt("Enter Announcement Title:");
            const content = prompt("Enter Announcement Message:");
            if (title && content) {
              onCreateAnnouncement({
                title,
                content,
                target_audience: "All",
                priority: "high"
              });
            }
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(anc => (
          <div key={anc.id} className="bg-slate-50/70 border border-slate-200/60 rounded-[16px] p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                anc.priority === "urgent" ? "bg-rose-100 text-rose-700" :
                anc.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
              }`}>
                {anc.priority} Priority • Target: {anc.target_audience}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{anc.created_at}</span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-base">{anc.title}</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{anc.content}</p>
            <p className="text-[10px] text-slate-400 font-medium">Posted by: {anc.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
