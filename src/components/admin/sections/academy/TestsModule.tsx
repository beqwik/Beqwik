import { useState } from "react";
import { Award, Plus, Clock, FileText, Trophy, Target, Mail, Phone, AlertTriangle, CheckCircle2, XCircle, Wrench, X, Users, Megaphone } from "lucide-react";
import type { TestEngineExam } from "../../../../services/organization/academyService";
import CreateTestModal from "./modals/CreateTestModal";

interface TestsModuleProps {
  tests: TestEngineExam[];
  onCreateTest: (testData: any) => void;
}

export default function TestsModule({ tests, onCreateTest }: TestsModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Online Test Engine</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Create, schedule, and conduct live exams</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Test
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test.id} className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex justify-between items-start">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                test.status === "live" ? "bg-rose-100 text-rose-700 animate-pulse" :
                test.status === "scheduled" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
              }`}>
                {test.status === "live" ? <><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Live Now</> : test.status}
              </span>
              <span className="text-xs font-bold text-slate-400">{test.subject}</span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{test.title}</h3>
              <p className="text-slate-500 text-xs mt-1">{test.class_name}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {test.duration_minutes} mins
              </span>
              <span className="flex items-center gap-1 font-bold">
                <Award className="w-3.5 h-3.5 text-amber-500" /> {test.total_marks} Marks
              </span>
            </div>

            <button className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-[14px] border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> View Question Paper
            </button>
          </div>
        ))}
      </div>

      {/* Modal for creating a new test */}
      <CreateTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateTest}
      />
    </div>
  );
}
