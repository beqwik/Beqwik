import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import { getStudentResultsByEmail } from "../../services/organization/academyService";
import { Award, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function StudentResults() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const orgId = org?.id || member?.organization_id;
      if (!orgId || !member?.email) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentResultsByEmail(orgId, member.email);
        setResults(data);
      } catch (err) {
        console.error("Error loading student results:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [org?.id, member?.email]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <Award className="w-8 h-8 text-indigo-600" /> My Results
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Track your exam results, grades, and overall academic performance.
        </p>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-150 p-6 shadow-sm overflow-hidden">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Exam Title</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Total Marks</th>
                  <th className="px-4 py-3 text-center">Percentage</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {results.map((record) => {
                  const percentage = Math.round((Number(record.score) / Number(record.total_marks)) * 100) || 0;
                  const isPassed = record.status?.toLowerCase() === "passed" || percentage >= 40;
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                          {record.exam_title}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-indigo-600">{record.score}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-600">{record.total_marks}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] font-black text-xs border shadow-sm ${
                          percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          percentage >= 60 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          percentage >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-extrabold text-slate-800 text-lg">
                          {record.grade || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {record.status || (isPassed ? "Passed" : "Failed")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Results Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              Your exam results haven't been uploaded yet. Check back later or contact your administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
