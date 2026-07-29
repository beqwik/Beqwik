import { useState } from "react";
import { X, Award, Clock, BookOpen, Layers } from "lucide-react";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testData: any) => void;
}

export default function CreateTestModal({ isOpen, onClose, onSubmit }: CreateTestModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("Class 10 - A");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [startTime, setStartTime] = useState("Tomorrow 10:00 AM");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      class_name: className,
      duration_minutes: Number(durationMinutes),
      total_marks: Number(totalMarks),
      passing_marks: Number(passingMarks),
      status: "scheduled",
      start_time: startTime,
      questions_count: 20
    });

    setTitle("");
    setSubject("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Create New Test / Exam</h3>
              <p className="text-indigo-200 text-xs font-medium">Schedule online assessment for students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              Test / Exam Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 font-bold placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-xs"
              placeholder="e.g. Mid-Term Physics Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 font-bold placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-xs"
                placeholder="e.g. Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                Class / Batch
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 font-bold placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-xs"
                placeholder="Class 10 - A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Total Marks
              </label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              Scheduled Date & Time
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs"
              placeholder="e.g. Tomorrow 10:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              Create Test Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
