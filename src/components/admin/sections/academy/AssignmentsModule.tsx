import { useState } from "react";
import { FileText, Calendar, Plus, Pencil, Trash2, BookOpen, Search, CheckCircle2 } from "lucide-react";
import type { AssignmentItem } from "../../../../services/organization/academyService";
import CreateAssignmentModal from "./modals/CreateAssignmentModal";

interface AssignmentsModuleProps {
  assignments: AssignmentItem[];
  onCreateAssignment?: (asg: any) => Promise<void> | void;
  onUpdateAssignment?: (id: string, asg: any) => Promise<void> | void;
  onDeleteAssignment?: (id: string) => Promise<void> | void;
}

export default function AssignmentsModule({
  assignments,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment
}: AssignmentsModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AssignmentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: AssignmentItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (editingItem && onUpdateAssignment) {
      await onUpdateAssignment(editingItem.id, data);
    } else if (onCreateAssignment) {
      await onCreateAssignment(data);
    }
  };

  const filteredAssignments = assignments.filter(
    asg =>
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Homework & Assignments
          </h2>
          <p className="text-slate-500 text-xs font-medium">Track and manage student submissions</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 rounded-[18px] p-5 space-y-3 transition group relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/60">
                    {asg.subject}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                        asg.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {asg.status}
                    </span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEdit(asg)}
                        title="Edit Assignment"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteAssignment && (
                        <button
                          onClick={() => onDeleteAssignment(asg.id)}
                          title="Delete Assignment"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{asg.title}</h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">Class: {asg.class_name}</p>
                  {asg.description && (
                    <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium">
                      {asg.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: <strong className="text-slate-700">{asg.due_date}</strong>
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
                  {asg.submissions_count} / {asg.total_students} Done
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50/50 rounded-[18px] border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">No assignments created yet.</p>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Create the first homework assignment now
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateAssignmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />
    </div>
  );
}
