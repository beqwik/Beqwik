import React, { useState, useEffect } from "react";
import { BarChart2, X, Loader2, Award, AlertTriangle, Calendar } from "lucide-react";
import type { TestResultItem } from "../../../../../services/organization/academyService";

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    student_name: string;
    exam_title: string;
    score: number;
    total_marks: number;
    date?: string;
  }) => Promise<void> | void;
  initialData?: TestResultItem | null;
}

export default function UploadResultModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: UploadResultModalProps) {
  const [studentName, setStudentName] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [score, setScore] = useState<number | "">("");
  const [totalMarks, setTotalMarks] = useState<number | "">(100);
  const [date, setDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setStudentName(initialData.student_name || "");
      setExamTitle(initialData.exam_title || "");
      setScore(initialData.score ?? "");
      setTotalMarks(initialData.total_marks ?? 100);
      setDate(initialData.date || "");
    } else {
      setStudentName("");
      setExamTitle("");
      setScore("");
      setTotalMarks(100);
      setDate("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const numScore = Number(score) || 0;
  const numTotal = Number(totalMarks) || 100;
  const percentage = Math.round((numScore / (numTotal || 1)) * 100);
  const isPassed = percentage >= 40;
  const grade =
    percentage >= 90
      ? "A+"
      : percentage >= 80
      ? "A"
      : percentage >= 70
      ? "B"
      : percentage >= 60
      ? "C"
      : percentage >= 40
      ? "D"
      : "F";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !examTitle.trim() || score === "") {
      setErrorMsg("Please fill out Student Name, Exam Title, and Marks Score.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        student_name: studentName.trim(),
        exam_title: examTitle.trim(),
        score: numScore,
        total_marks: numTotal,
        date: date.trim() || undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save exam result. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditing ? "Edit Exam Result" : "Upload Exam Result"}
              </h3>
              <p className="text-indigo-100 text-xs font-medium">
                {isEditing ? "Update student scorecard & grade" : "Record score & calculate student gradebook"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Liam Wilson"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              required
            />
          </div>

          {/* Exam Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Exam / Test Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="e.g. Mathematics Mid-Term Exam 2026"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              required
            />
          </div>

          {/* Score & Total Marks Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Score */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Marks Obtained <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={score}
                onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 85"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>

            {/* Total Marks */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Total Max Marks
              </label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="100"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Exam Date
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. 29 Jul 2026"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Gradebook Calculation Live Preview Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[16px] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Calculated Gradebook</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {score !== "" ? `${percentage}% (${grade})` : "—"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                score === ""
                  ? "bg-slate-200 text-slate-600"
                  : isPassed
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-rose-100 text-rose-700 border border-rose-200"
              }`}
            >
              {score === "" ? "Pending" : isPassed ? "PASSED" : "FAILED"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[14px] transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:opacity-95 text-white text-xs font-black rounded-[14px] shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4 text-amber-300" />
                  <span>{isEditing ? "Save Changes" : "Upload Result"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
