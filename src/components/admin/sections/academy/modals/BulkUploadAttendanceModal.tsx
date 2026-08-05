import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, CalendarDays } from "lucide-react";
import * as XLSX from "xlsx";
import { bulkCreateAttendance, type AttendanceUploadRow } from "../../../../../services/organization/academyService";

interface BulkUploadAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

interface ParsedAttendanceRow {
  student_code: string;
  date: string;
  status: string;
  isValid: boolean;
  error?: string;
}

export default function BulkUploadAttendanceModal({
  isOpen,
  onClose,
  organizationId,
  onSuccess
}: BulkUploadAttendanceModalProps) {
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedAttendanceRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Student ID": "STU-792205",
        "Student Name": "Student1",
        "Student Email": "student1@example.com",
        "Class": "Student",
        "Month": "August 2026",
        "Total Working Days": 26,
        "Present Days": 25,
        "Absent Days": 1,
        "Leave Days": 0,
        "Attendance %": "96.15%",
        "Status": "Excellent",
        "Remarks": "Regular"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Template");
    XLSX.writeFile(workbook, "attendance_upload_template.xlsx");
  };

  const processFile = (file: File) => {
    setErrorMsg("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) return;

        const data = new Uint8Array(buffer as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (json.length === 0) {
          setErrorMsg("The selected file is empty. Please upload a valid CSV or Excel sheet.");
          setParsedRows([]);
          return;
        }

        const rows: any[] = json.map((row) => {
          const keys = Object.keys(row);
          const getValue = (candidates: string[]) => {
            const matchedKey = keys.find((k) =>
              candidates.some((c) => k.trim().toLowerCase() === c.toLowerCase())
            );
            return matchedKey ? String(row[matchedKey]).trim() : "";
          };

          const student_code = getValue(["student id", "student_code", "student_id", "code", "student code"]);
          const student_name = getValue(["student name", "student_name", "name"]);
          const student_email = getValue(["student email", "email", "student_email"]);
          const class_name = getValue(["class", "class name", "class_name"]);
          const month = getValue(["month"]);
          const total_working_days = Number(getValue(["total working days", "working days", "total_working_days"])) || 0;
          const present_days = Number(getValue(["present days", "present", "present_days"])) || 0;
          const absent_days = Number(getValue(["absent days", "absent", "absent_days"])) || 0;
          const leave_days = Number(getValue(["leave days", "leave", "leave_days"])) || 0;
          
          let attendance_percentage = 0;
          const rawPercentage = getValue(["attendance %", "percentage", "attendance percentage", "attendance_percentage"]);
          if (rawPercentage) {
            attendance_percentage = Number(rawPercentage.replace("%", "")) || 0;
          }

          const status = getValue(["status"]);
          const remarks = getValue(["remarks", "remark"]);

          let isValid = true;
          let error = "";

          if (!student_code) {
            isValid = false;
            error = "Missing Student ID";
          } else if (!student_email) {
            isValid = false;
            error = "Missing Student Email";
          } else if (!month) {
            isValid = false;
            error = "Missing Month";
          }

          return {
            student_code,
            student_name,
            student_email,
            class_name,
            month,
            total_working_days,
            present_days,
            absent_days,
            leave_days,
            attendance_percentage,
            status,
            remarks,
            isValid,
            error
          };
        });

        setParsedRows(rows);
      } catch (err: any) {
        console.error("Error parsing spreadsheet file:", err);
        setErrorMsg("Failed to read the file. Please ensure it is a valid CSV or Excel (.xlsx, .xls) file.");
        setParsedRows([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);

  const handleSubmit = async () => {
    if (validRows.length === 0) {
      setErrorMsg("No valid attendance rows to upload.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");

      const payload: AttendanceUploadRow[] = validRows.map((r) => ({
        student_code: r.student_code,
        student_name: r.student_name,
        student_email: r.student_email,
        class_name: r.class_name,
        month: r.month,
        total_working_days: r.total_working_days,
        present_days: r.present_days,
        absent_days: r.absent_days,
        leave_days: r.leave_days,
        attendance_percentage: r.attendance_percentage,
        status: r.status,
        remarks: r.remarks
      }));

      const res = await bulkCreateAttendance(organizationId, payload);

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to upload attendance to database.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "An unexpected error occurred during bulk upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <CalendarDays className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Bulk Upload Attendance</h3>
              <p className="text-emerald-100 text-xs font-medium">Upload student attendance records from CSV or Excel file</p>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between bg-teal-50/70 border border-teal-100 rounded-[16px] p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider">Download Attendance Template</h4>
                <p className="text-xs text-teal-700">Use our pre-formatted spreadsheet template</p>
              </div>
            </div>
            <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold rounded-[12px] transition flex items-center gap-1.5 shrink-0">
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Template (.xlsx)</span>
            </button>
          </div>

          <div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-[20px] p-8 text-center transition flex flex-col items-center justify-center gap-3 relative ${isDragOver ? "border-teal-600 bg-teal-50/50 scale-[0.99]" : "border-slate-200 hover:border-teal-400 bg-slate-50/50"}`}>
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">{fileName ? fileName : "Drag & drop your CSV or Excel file here, or click to browse"}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Supports .csv, .xlsx, and .xls files</p>
            </div>
          </div>

          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>File Preview</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono text-[10px]">{parsedRows.length} Total Rows</span>
                </h4>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} Valid</span>
                  {parsedRows.length - validRows.length > 0 && (
                    <span className="text-rose-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {parsedRows.length - validRows.length} Invalid</span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-[16px] overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Validation</th>
                      <th className="px-4 py-2.5">Student ID</th>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Student Email</th>
                      <th className="px-4 py-2.5">Month</th>
                      <th className="px-4 py-2.5">Total Days</th>
                      <th className="px-4 py-2.5">Present</th>
                      <th className="px-4 py-2.5">%</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={!row.isValid ? "bg-red-50" : ""}>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Valid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 font-bold" title={row.error}>
                              <AlertTriangle className="w-4 h-4" /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{row.student_code || "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{row.student_name || "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{row.student_email || "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{row.month || "—"}</td>
                        <td className="px-4 py-3 text-slate-700 font-bold">{row.total_working_days}</td>
                        <td className="px-4 py-3 text-emerald-600 font-bold">{row.present_days}</td>
                        <td className="px-4 py-3 text-slate-700 font-black">{row.attendance_percentage}%</td>
                        <td className="px-4 py-3 text-slate-500">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">{validRows.length > 0 ? `Ready to import ${validRows.length} attendance record(s)` : "Upload a file to begin"}</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={uploading} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-[12px] transition disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={uploading || validRows.length === 0} className="px-6 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:opacity-95 text-white text-xs font-black rounded-[12px] shadow-md transition flex items-center gap-2 disabled:opacity-50">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading...</span></> : <><Upload className="w-4 h-4" /><span>Upload {validRows.length} Records</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
