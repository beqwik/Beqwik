import { BarChart2 } from "lucide-react";
import type { TestResultItem } from "../../../../services/organization/academyService";

interface ResultsModuleProps {
  results: TestResultItem[];
}

export default function ResultsModule({ results }: ResultsModuleProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" /> Exam Results & Gradebook
          </h2>
          <p className="text-slate-500 text-xs font-medium">Student performance scorecards</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Exam Title</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {results.map(res => (
              <tr key={res.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900">{res.student_name}</td>
                <td className="px-4 py-3 text-slate-600">{res.exam_title}</td>
                <td className="px-4 py-3 font-extrabold text-slate-900">{res.score} / {res.total_marks}</td>
                <td className="px-4 py-3 font-extrabold text-indigo-600">{res.percentage}% ({res.grade})</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase ${res.status === "Passed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
