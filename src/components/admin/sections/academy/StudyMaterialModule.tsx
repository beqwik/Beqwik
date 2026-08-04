import { useState } from "react";
import { FolderDown, Download, Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";
import type { StudyMaterialItem } from "../../../../services/organization/academyService";
import CreateStudyMaterialModal from "./modals/CreateStudyMaterialModal";

interface StudyMaterialModuleProps {
  materials: StudyMaterialItem[];
  onCreateStudyMaterial?: (data: any) => Promise<void> | void;
  onUpdateStudyMaterial?: (id: string, data: any) => Promise<void> | void;
  onDeleteStudyMaterial?: (id: string) => Promise<void> | void;
}

export default function StudyMaterialModule({
  materials,
  onCreateStudyMaterial,
  onUpdateStudyMaterial,
  onDeleteStudyMaterial
}: StudyMaterialModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyMaterialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: StudyMaterialItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (editingItem && onUpdateStudyMaterial) {
      await onUpdateStudyMaterial(editingItem.id, data);
    } else if (onCreateStudyMaterial) {
      await onCreateStudyMaterial(data);
    }
  };

  const filteredMaterials = materials.filter(
    mat =>
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-indigo-600" /> Study Material & Lecture Notes
          </h2>
          <p className="text-slate-500 text-xs font-medium">Downloadable course resources and notes</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study material..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:opacity-95 text-white rounded-[14px] text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-slate-50/60 hover:bg-slate-50 border border-slate-200/60 rounded-[18px] p-5 space-y-3 transition group relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[9px] uppercase tracking-wider">
                    {mat.file_type}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{mat.file_size}</span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        title="Edit Study Material"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteStudyMaterial && (
                        <button
                          onClick={() => onDeleteStudyMaterial(mat.id)}
                          title="Delete Study Material"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{mat.title}</h3>
                  <p className="text-indigo-600 text-xs font-bold mt-0.5">{mat.subject}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium">{mat.downloads} Downloads</span>
                <button
                  onClick={() => alert(`Downloading ${mat.title}...`)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50/50 rounded-[18px] border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">No study materials uploaded yet.</p>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Upload the first lecture material now
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateStudyMaterialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />
    </div>
  );
}
