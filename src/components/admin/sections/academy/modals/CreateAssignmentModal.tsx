import React, { useState, useEffect } from "react";
import { FileText, X, Loader2, BookOpen, Calendar, AlertTriangle, Layers } from "lucide-react";
import type { AssignmentItem } from "../../../../../services/organization/academyService";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    subject: string;
    class_name: string;
    description: string;
    due_date: string;
    status: "active" | "closed";
  }) => Promise<void> | void;
  initialData?: AssignmentItem | null;
}

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: CreateAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"active" | "closed">("active");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSubject(initialData.subject || "");
      setClassName(initialData.class_name || "");
      setDescription(initialData.description || "");
      setDueDate(initialData.due_date || "");
      setStatus(initialData.status || "active");
    } else {
      setTitle("");
      setSubject("");
      setClassName("");
      setDescription("");
      setDueDate("");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !className.trim() || !dueDate.trim()) {
      setErrorMsg("Please fill in all required fields (Title, Subject, Class, Due Date).");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        title: title.trim(),
        subject: subject.trim(),
        class_name: className.trim(),
        description: description.trim(),
        due_date: dueDate.trim(),
        status
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditing ? "Edit Assignment & Homework" : "Create New Assignment"}
              </h3>
              <p className="text-indigo-100 text-xs font-medium">
                {isEditing ? "Update existing assignment details" : "Publish homework to student portal"}
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

          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculus Chapter 4 Problem Set"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              required
            />
          </div>

          {/* Subject & Class Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>

            {/* Class Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" /> Class / Grade <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Class 10 - A"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Due Date & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. 05 Aug 2026"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="active">Active (Open)</option>
                <option value="closed">Closed (Submissions Ended)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Instructions & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assignment instructions, guidelines, chapter references..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition resize-none"
            />
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
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-black rounded-[14px] shadow-md shadow-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>{isEditing ? "Save Changes" : "Create Assignment"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
