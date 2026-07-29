import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, Users } from "lucide-react";
import * as XLSX from "xlsx";
import {
  bulkCreateStudents,
  type StudentUploadRow,
  type Student
} from "../../../../../services/organization/academyService";

interface BulkUploadStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: (newStudents: Student[]) => void;
}

interface ParsedStudentRow {
  full_name: string;
  email: string;
  phone: string;
  college_id: string;
  room_number: string;
  hostel_block: string;
  isValid: boolean;
  error?: string;
}

export default function BulkUploadStudentsModal({
  isOpen,
  onClose,
  organizationId,
  onSuccess
}: BulkUploadStudentsModalProps) {
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Full Name": "Alexander Wright",
        "Email": "alex.wright@example.com",
        "Phone": "+1 555-0144",
        "College ID": "COL-9801",
        "Room Number": "204",
        "Hostel Block": "Block A"
      },
      {
        "Full Name": "Sophia Martinez",
        "Email": "sophia.m@example.com",
        "Phone": "+1 555-0189",
        "College ID": "COL-9802",
        "Room Number": "308",
        "Hostel Block": "Block B"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Template");
    XLSX.writeFile(workbook, "students_upload_template.xlsx");
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

        const rows: ParsedStudentRow[] = json.map((row) => {
          // Normalize header keys case-insensitively
          const keys = Object.keys(row);
          const getValue = (candidates: string[]) => {
            const matchedKey = keys.find((k) =>
              candidates.some((c) => k.trim().toLowerCase() === c.toLowerCase())
            );
            return matchedKey ? String(row[matchedKey]).trim() : "";
          };

          const full_name = getValue(["full name", "fullName", "student name", "name", "full_name"]);
          const email = getValue(["email", "email address", "mail", "email_address"]);
          const phone = getValue(["phone", "phone number", "contact", "mobile", "phone_number"]);
          const college_id = getValue(["college id", "collegeid", "student id", "roll no", "roll number", "college_id"]);
          const room_number = getValue(["room number", "room no", "room", "room_number"]);
          const hostel_block = getValue(["hostel block", "block", "hostel", "hostel_block"]);

          let isValid = true;
          let error = "";

          if (!full_name) {
            isValid = false;
            error = "Missing Full Name";
          } else if (!email || !email.includes("@")) {
            isValid = false;
            error = "Invalid Email";
          }

          return {
            full_name,
            email,
            phone,
            college_id,
            room_number,
            hostel_block,
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
      setErrorMsg("No valid student rows to upload.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");

      const payload: StudentUploadRow[] = validRows.map((r) => ({
        full_name: r.full_name,
        email: r.email,
        phone: r.phone || undefined,
        college_id: r.college_id || undefined,
        room_number: r.room_number || undefined,
        hostel_block: r.hostel_block || undefined
      }));

      const res = await bulkCreateStudents(organizationId, payload);

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to upload student list to database.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "An unexpected error occurred during bulk upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Users className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Bulk Upload Academy Students</h3>
              <p className="text-indigo-100 text-xs font-medium">Upload & store student list from CSV or Excel file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[14px] text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Row: Download Template */}
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-[16px] p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Download Standard Template</h4>
                <p className="text-xs text-indigo-700">Use our pre-formatted spreadsheet template with sample fields</p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-[12px] transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Template (.xlsx)</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[20px] p-8 text-center transition flex flex-col items-center justify-center gap-3 relative ${
              isDragOver
                ? "border-indigo-600 bg-indigo-50/50 scale-[0.99]"
                : "border-slate-200 hover:border-indigo-400 bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">
                {fileName ? fileName : "Drag & drop your CSV or Excel file here, or click to browse"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Supports .csv, .xlsx, and .xls files</p>
            </div>
          </div>

          {/* Parsed Preview Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>File Preview</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono text-[10px]">
                    {parsedRows.length} Total Rows
                  </span>
                </h4>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} Valid
                  </span>
                  {parsedRows.length - validRows.length > 0 && (
                    <span className="text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {parsedRows.length - validRows.length} Invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-[16px] overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Full Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">College ID</th>
                      <th className="px-4 py-2.5">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}>
                        <td className="px-4 py-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> {row.error}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{row.full_name || "—"}</td>
                        <td className="px-4 py-2.5 text-slate-700">{row.email || "—"}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.phone || "—"}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{row.college_id || "—"}</td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {row.room_number ? `${row.room_number} ${row.hostel_block ? `(${row.hostel_block})` : ""}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            {validRows.length > 0 ? `Ready to import ${validRows.length} student(s) to database` : "Upload a file to begin"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-[12px] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || validRows.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-black rounded-[12px] shadow-md shadow-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Database...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload {validRows.length} Students</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
