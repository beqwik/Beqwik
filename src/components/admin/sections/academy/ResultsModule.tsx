import { useState } from "react";
import { BarChart2, Plus, Pencil, Trash2, Search, Award } from "lucide-react";
import type { TestResultItem } from "../../../../services/organization/academyService";
import UploadResultModal from "./modals/UploadResultModal";

interface ResultsModuleProps {
  results: TestResultItem[];
  onCreateTestResult?: (data: any) => Promise<void> | void;
  onUpdateTestResult?: (id: string, data: any) => Promise<void> | void;
  onDeleteTestResult?: (id: string) => Promise<void> | void;
}

export default function ResultsModule({
  results,
  onCreateTestResult,
  onUpdateTestResult,
  onDeleteTestResult
}: ResultsModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TestResultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: TestResultItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (editingItem && onUpdateTestResult) {
      await onUpdateTestResult(editingItem.id, data);
    } else if (onCreateTestResult) {
      await onCreateTestResult(data);
    }
  };

  const filteredResults = results.filter(
    res =>
      res.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.exam_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" /> Exam Results & Gradebook
          </h2>
          <p className="text-slate-500 text-xs font-medium">Upload student scores and manage gradebooks</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search results or student..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Result
          </button>
        </div>
      </div>

      {/* Results Table */}
      {filteredResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Exam Title</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Percentage & Grade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredResults.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/70 transition group">
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{res.student_name}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-semibold">{res.exam_title}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900">
                    {res.score} / {res.total_marks}
                  </td>
                  <td className="px-4 py-3.5 font-black text-indigo-600">
                    {res.percentage}% <span className="text-slate-400 font-bold">({res.grade})</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                        res.status === "Passed"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-rose-100 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        title="Edit Scorecard"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {onDeleteTestResult && (
                        <button
                          onClick={() => onDeleteTestResult(res.id)}
                          title="Delete Scorecard"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50/50 rounded-[18px] border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">No exam results uploaded yet.</p>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Upload the first exam scorecard now
          </button>
        </div>
      )}

      {/* Modal */}
      <UploadResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />
    </div>
  );
}
