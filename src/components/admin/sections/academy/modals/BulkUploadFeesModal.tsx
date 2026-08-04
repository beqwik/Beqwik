import React, { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, IndianRupee } from "lucide-react";
import * as XLSX from "xlsx";
import { bulkCreateFeeReminders, type FeeReminderUploadRow } from "../../../../../services/organization/academyService";

interface BulkUploadFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: (newFees: any[]) => void;
}

interface ParsedFeeRow {
  student_name: string;
  email: string;
  phone: string;
  total_fees: number;
  paid_fee: number;
  due_fee: number;
  isValid: boolean;
  error?: string;
}

export default function BulkUploadFeesModal({
  isOpen,
  onClose,
  organizationId,
  onSuccess
}: BulkUploadFeesModalProps) {
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedFeeRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Student Name": "John Doe",
        "Email": "john@example.com",
        "Phone": "1234567890",
        "Total Fees": 7000,
        "Paid Fee": 5000,
        "Due Fee": 2000
      },
      {
        "Student Name": "Jane Smith",
        "Email": "jane@example.com",
        "Phone": "0987654321",
        "Total Fees": 2500,
        "Paid Fee": 2500,
        "Due Fee": 0
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fees Template");
    XLSX.writeFile(workbook, "fees_upload_template.xlsx");
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

        const rows: ParsedFeeRow[] = json.map((row) => {
          const keys = Object.keys(row);
          const getValue = (candidates: string[]) => {
            const matchedKey = keys.find((k) =>
              candidates.some((c) => k.trim().toLowerCase() === c.toLowerCase())
            );
            return matchedKey ? String(row[matchedKey]).trim() : "";
          };

          const student_name = getValue(["student name", "student_name", "name"]);
          const email = getValue(["email", "email address"]);
          const phone = getValue(["phone", "phone number", "contact"]);
          const rawTotal = getValue(["total fees", "total_fees", "total amount"]);
          const rawPaid = getValue(["paid fee", "paid_fee", "paid amount"]);
          const rawDue = getValue(["due fee", "due_fee", "due amount"]);

          const total_fees = Number(rawTotal) || 0;
          const paid_fee = Number(rawPaid) || 0;
          const due_fee = Number(rawDue) || 0;

          let isValid = true;
          let error = "";

          if (!student_name) {
            isValid = false;
            error = "Missing Student Name";
          } else if (isNaN(total_fees) || isNaN(paid_fee) || isNaN(due_fee)) {
            isValid = false;
            error = "Invalid Fee Amount";
          }

          return {
            student_name,
            email,
            phone,
            total_fees,
            paid_fee,
            due_fee,
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
      setErrorMsg("No valid fee rows to upload.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");

      const payload: FeeReminderUploadRow[] = validRows.map((r) => ({
        student_name: r.student_name,
        email: r.email,
        phone: r.phone,
        total_fees: r.total_fees,
        paid_fee: r.paid_fee,
        due_fee: r.due_fee
      }));

      const res = await bulkCreateFeeReminders(organizationId, payload);

      if (res.success && res.data) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to upload fee reminders to database.");
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
              <IndianRupee className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Bulk Upload Fee Reminders</h3>
              <p className="text-emerald-100 text-xs font-medium">Upload pending fee list from CSV or Excel file</p>
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
                <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider">Download Fees Template</h4>
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
                      <th className="px-4 py-3 text-left border-r border-slate-100">Student Name</th>
                      <th className="px-4 py-3 text-left border-r border-slate-100">Email</th>
                      <th className="px-4 py-3 text-left border-r border-slate-100">Phone</th>
                      <th className="px-4 py-3 text-left border-r border-slate-100">Total Fees</th>
                      <th className="px-4 py-3 text-left border-r border-slate-100">Paid Fee</th>
                      <th className="px-4 py-3 text-left border-r border-slate-100">Due Fee</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}>
                        <td className="px-4 py-3 border-r border-slate-100">
                          {row.student_name}
                          {!row.student_name && <span className="text-rose-500 font-bold italic">Missing Name</span>}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-100 text-slate-500">{row.email || "-"}</td>
                        <td className="px-4 py-3 border-r border-slate-100 text-slate-500">{row.phone || "-"}</td>
                        <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-700">₹{row.total_fees}</td>
                        <td className="px-4 py-3 border-r border-slate-100 font-bold text-emerald-600">₹{row.paid_fee}</td>
                        <td className="px-4 py-3 border-r border-slate-100 font-black text-rose-600">₹{row.due_fee}</td>
                        <td className="px-4 py-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]"><AlertTriangle className="w-3 h-3 text-rose-500" /> {row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">{validRows.length > 0 ? `Ready to import ${validRows.length} fee reminder(s)` : "Upload a file to begin"}</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={uploading} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-[12px] transition disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={uploading || validRows.length === 0} className="px-6 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:opacity-95 text-white text-xs font-black rounded-[12px] shadow-md transition flex items-center gap-2 disabled:opacity-50">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading...</span></> : <><Upload className="w-4 h-4" /><span>Upload {validRows.length} Fees</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
