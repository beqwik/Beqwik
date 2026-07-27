import { FolderDown, Download } from "lucide-react";
import type { StudyMaterialItem } from "../../../../services/organization/academyService";

interface StudyMaterialModuleProps {
  materials: StudyMaterialItem[];
}

export default function StudyMaterialModule({ materials }: StudyMaterialModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-indigo-600" /> Study Material & Lecture Notes
          </h2>
          <p className="text-slate-500 text-xs font-medium">Downloadable course resources</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(mat => (
          <div key={mat.id} className="bg-slate-50/60 rounded-[16px] border border-slate-200/60 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[9px] uppercase">
                {mat.file_type}
              </span>
              <span className="text-xs text-slate-400 font-medium">{mat.file_size}</span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">{mat.title}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{mat.subject}</p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-medium">{mat.downloads} Downloads</span>
              <button onClick={() => alert("Downloading file...")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] font-bold flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
