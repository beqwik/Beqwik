import React, { useState, useEffect } from "react";
import { FolderDown, X, Loader2, BookOpen, FileCode, AlertTriangle } from "lucide-react";
import type { StudyMaterialItem } from "../../../../../services/organization/academyService";

interface CreateStudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    subject: string;
    file_type: "pdf" | "doc" | "video";
    file_size?: string;
  }) => Promise<void> | void;
  initialData?: StudyMaterialItem | null;
}

export default function CreateStudyMaterialModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: CreateStudyMaterialModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "doc" | "video">("pdf");
  const [fileSize, setFileSize] = useState("2.5 MB");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSubject(initialData.subject || "");
      setFileType(initialData.file_type || "pdf");
      setFileSize(initialData.file_size || "2.5 MB");
    } else {
      setTitle("");
      setSubject("");
      setFileType("pdf");
      setFileSize("2.5 MB");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      setErrorMsg("Please fill out both the resource title and subject name.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        title: title.trim(),
        subject: subject.trim(),
        file_type: fileType,
        file_size: fileSize.trim() || "2.5 MB"
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save study material. Please try again.");
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
              <FolderDown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditing ? "Edit Study Material" : "Upload Study Material"}
              </h3>
              <p className="text-indigo-100 text-xs font-medium">
                {isEditing ? "Update existing lecture notes or resources" : "Publish notes or resources for students"}
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

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Resource / File Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry Reaction Mechanics Notes"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              required
            />
          </div>

          {/* Subject & File Format Row */}
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
                placeholder="e.g. Chemistry"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                required
              />
            </div>

            {/* File Type */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-600" /> File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition cursor-pointer"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="doc">Word / Text Doc (.doc)</option>
                <option value="video">Video Lecture (.mp4)</option>
              </select>
            </div>
          </div>

          {/* File Size */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              File Size Label
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="e.g. 4.2 MB"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
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
                  <FolderDown className="w-4 h-4 text-amber-300" />
                  <span>{isEditing ? "Save Changes" : "Upload Material"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
