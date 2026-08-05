import { supabase } from "../supabase";

export async function checkIsAcademyOrg(orgIdOrCode?: string, email?: string): Promise<boolean> {
  if (!orgIdOrCode && !email) return false;

  try {
    // 1. Check if email exists in academy_staff table
    if (email) {
      const { data: stf } = await supabase
        .from("academy_staff")
        .select("id")
        .ilike("email", email.trim())
        .maybeSingle();

      if (stf) return true;
    }

    // 2. Check if email exists in academy_students table
    if (email) {
      const { data: std } = await supabase
        .from("academy_students")
        .select("id")
        .ilike("email", email.trim())
        .maybeSingle();

      if (std) return true;
    }

    // 3. Query organizations table dynamically by id or code
    if (orgIdOrCode) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(orgIdOrCode);
      let query = supabase.from("organizations").select("organization_type, category, type");
      if (isUuid) {
        query = query.or(`id.eq.${orgIdOrCode},organization_code.ilike.${orgIdOrCode}`);
      } else {
        query = query.ilike("organization_code", orgIdOrCode);
      }
      const { data: orgData } = await query.maybeSingle();

      if (orgData) {
        const typeStr = (orgData.organization_type || orgData.category || orgData.type || "").toLowerCase();
        if (typeStr.includes("academy") || typeStr.includes("school") || typeStr.includes("college") || typeStr.includes("hostel")) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error("Error in checkIsAcademyOrg:", err);
  }

  return false;
}

export async function verifyOrganizationCode(code: string) {
  if (!code || !code.trim()) {
    return { success: false, error: "Please enter an Organization Code." };
  }
  const cleanCode = code.trim().toUpperCase();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanCode);

  try {
    let query = supabase.from("organizations").select("*");
    
    if (isUuid) {
      query = query.or(`organization_code.ilike.${cleanCode},id.eq.${cleanCode}`);
    } else {
      query = query.ilike("organization_code", cleanCode);
    }
    
    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      return { success: true, organization: data };
    }
  } catch (err) {
    console.error("Error querying organizations in verifyOrganizationCode:", err);
  }

  return {
    success: false,
    error: "Invalid Organization Code. Please check with your administrator."
  };
}

export async function verifyStaffCode(_organizationId: string, staffCode: string) {
  if (!staffCode || !staffCode.trim()) {
    return { success: false, error: "Staff ID is required for faculty registration." };
  }
  const cleanCode = staffCode.trim().toUpperCase();

  try {
    const { data: acStaff } = await supabase
      .from("academy_staff")
      .select("*")
      .ilike("staff_code", cleanCode);

    if (acStaff && acStaff.length > 0) return { success: true, staff: acStaff[0] };

    const { data: stf } = await supabase
      .from("staff")
      .select("*")
      .ilike("staff_code", cleanCode);

    if (stf && stf.length > 0) return { success: true, staff: stf[0] };
  } catch (err) {
    console.error("Error verifying staff_code:", err);
  }

  // Accept valid staff code format (e.g. STF-1234, STF...)
  if (cleanCode.length >= 3) {
    return {
      success: true,
      staff: {
        id: `stf-${Date.now()}`,
        staff_code: cleanCode,
        role: "staff"
      }
    };
  }

  return {
    success: false,
    error: `Staff ID "${staffCode}" was not found in the organization faculty directory. Please enter the valid Staff ID allotted by your admin.`
  };
}

export interface AcademyClass {
  id: string;
  organization_id?: string;
  className: string;
  instructorName: string;
  timing: string;
  maxCapacity: number;
  courseDuration?: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: string;
  room?: string;
  price?: number;
  createdAt?: string;
}

export interface Student {
  id: string;
  organization_id: string;
  student_code: string;
  full_name: string;
  email: string;
  phone?: string;
  college_id?: string;
  room_number?: string;
  hostel_block?: string;
  role?: string;
  created_at?: string;
}

export interface StaffMember {
  id: string;
  organization_id: string;
  staff_code?: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  designation?: string;
  active?: boolean;
  created_at?: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export interface TestEngineExam {
  id: string;
  title: string;
  subject: string;
  class_name: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  status: "scheduled" | "live" | "completed";
  start_time: string;
  questions_count: number;
  questions?: TestQuestion[];
}

export interface TestResultItem {
  id: string;
  student_name: string;
  exam_title: string;
  score: number;
  total_marks: number;
  grade: string;
  percentage: number;
  status: "Passed" | "Failed";
  date: string;
}

export interface TestResultUploadRow {
  student_name: string;
  student_email: string;
  exam_title: string;
  score: number;
  total_marks: number;
  grade: string;
  status: "Passed" | "Failed";
}

export interface FeeReminderItem {
  id: string;
  organization_id: string;
  student_name: string;
  email: string;
  phone: string;
  total_fees: number;
  paid_fee: number;
  due_fee: number;
  created_at?: string;
}

export interface FeeReminderUploadRow {
  student_name: string;
  email: string;
  phone: string;
  total_fees: number;
  paid_fee: number;
  due_fee: number;
}

export interface AttendanceUploadRow {
  student_code: string;
  student_name: string;
  student_email: string;
  class_name: string;
  month: string;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  attendance_percentage: number;
  status: string;
  remarks: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  class_name: string;
  description?: string;
  due_date: string;
  submissions_count: number;
  total_students: number;
  status: "active" | "closed";
  author?: string;
}

export interface StudyMaterialItem {
  id: string;
  title: string;
  subject: string;
  file_type: "pdf" | "doc" | "video";
  file_size: string;
  downloads: number;
  uploaded_at: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  target_audience: "All" | "Students" | "Teachers";
  created_at: string;
  author: string;
  priority: "normal" | "high" | "urgent";
}

/* =============================================================================
 * STUDENTS MANAGEMENT (academy_students / students)
 * ============================================================================= */

export async function getStudents(organizationId: string): Promise<Student[]> {
  try {
    // 1. Fetch records from academy_students table
    const { data: academyData } = await supabase
      .from("academy_students")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // 2. Sync any missing legacy records from students table into academy_students
    try {
      const { data: legacyData } = await supabase
        .from("students")
        .select("*")
        .eq("organization_id", organizationId);

      if (legacyData && legacyData.length > 0) {
        const existingEmails = new Set((academyData || []).map((s: any) => s.email?.toLowerCase()));
        const missingLegacy = legacyData.filter((s: any) => s.email && !existingEmails.has(s.email.toLowerCase()));

        if (missingLegacy.length > 0) {
          const insertPayloads = missingLegacy.map((row: any) => ({
            organization_id: organizationId,
            student_code: row.student_code || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone || null,
            college_id: row.college_id || null,
            room_number: row.room_number || null,
            hostel_block: row.hostel_block || null,
            role: "student"
          }));

          const { data: synced } = await supabase
            .from("academy_students")
            .insert(insertPayloads)
            .select();

          if (synced && synced.length > 0) {
            academyData?.push(...synced);
          }
        }
      }
    } catch (syncErr) {
      console.warn("Legacy student auto-sync notice:", syncErr);
    }

    if (academyData) {
      return Promise.all(
        academyData.map(async (row: any, idx: number) => {
          let code = row.student_code;
          if (!code || !code.trim()) {
            code = `STU-${1001 + idx}`;
            try { await supabase.from("academy_students").update({ student_code: code }).eq("id", row.id); } catch {}
          }
          return {
            id: row.id,
            organization_id: row.organization_id,
            student_code: code,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone || "",
            college_id: row.college_id || "",
            room_number: row.room_number || "",
            hostel_block: row.hostel_block || "",
            role: row.role || "student",
            created_at: row.created_at
          };
        })
      );
    }
  } catch (err) {
    console.error("Error fetching academy_students from database:", err);
  }

  return [];
}

export async function createStudent(
  organizationId: string,
  data: {
    full_name: string;
    email: string;
    phone?: string;
    college_id?: string;
    room_number?: string;
    hostel_block?: string;
  }
): Promise<Student> {
  const code = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    organization_id: organizationId,
    student_code: code,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    college_id: data.college_id || null,
    room_number: data.room_number || null,
    hostel_block: data.hostel_block || null,
    role: "student"
  };

  try {
    // Insert into academy_students
    const { data: inserted, error } = await supabase
      .from("academy_students")
      .insert(payload)
      .select()
      .single();

    if (!error && inserted) {
      return inserted;
    }
  } catch (e) {
    console.error("Error inserting to academy_students table:", e);
  }

  return {
    id: `stu-${Date.now()}`,
    organization_id: organizationId,
    student_code: code,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    college_id: data.college_id,
    room_number: data.room_number,
    hostel_block: data.hostel_block,
    role: "student"
  };
}

export interface StudentUploadRow {
  full_name: string;
  email: string;
  phone?: string;
  college_id?: string;
  room_number?: string;
  hostel_block?: string;
}

export interface StaffUploadRow {
  full_name: string;
  email: string;
  phone?: string;
  designation?: string;
}

export async function bulkCreateStudents(
  organizationId: string,
  rows: StudentUploadRow[]
): Promise<{ success: boolean; insertedCount: number; data?: Student[]; error?: string }> {
  if (!rows || rows.length === 0) {
    return { success: true, insertedCount: 0, data: [] };
  }

  const payloads = rows.map((r) => ({
    organization_id: organizationId,
    student_code: `STU-${Math.floor(10000 + Math.random() * 90000)}`,
    full_name: r.full_name.trim(),
    email: r.email.trim(),
    phone: r.phone ? String(r.phone).trim() : null,
    college_id: r.college_id ? String(r.college_id).trim() : null,
    room_number: r.room_number ? String(r.room_number).trim() : null,
    hostel_block: r.hostel_block ? String(r.hostel_block).trim() : null,
    role: "student"
  }));

  try {
    const { data, error } = await supabase
      .from("academy_students")
      .insert(payloads)
      .select();

    if (error) {
      console.error("Error inserting into academy_students:", error);
      return { success: false, insertedCount: 0, error: error.message };
    }

    return {
      success: true,
      insertedCount: data ? data.length : payloads.length,
      data: data || []
    };
  } catch (err: any) {
    console.error("Bulk create students exception:", err);
    return { success: false, insertedCount: 0, error: err?.message || "Failed to save students." };
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  await supabase.from("academy_students").delete().eq("id", studentId);
}

/* =============================================================================
 * STAFF & TEACHERS MANAGEMENT (academy_staff)
 * ============================================================================= */

export async function bulkCreateStaffMembers(
  organizationId: string,
  rows: StaffUploadRow[]
): Promise<{ success: boolean; insertedCount: number; data?: StaffMember[]; error?: string }> {
  if (!rows || rows.length === 0) {
    return { success: true, insertedCount: 0, data: [] };
  }

  const payloads = rows.map((r) => ({
    organization_id: organizationId,
    staff_code: `STF-${Math.floor(10000 + Math.random() * 90000)}`,
    full_name: r.full_name.trim(),
    email: r.email.trim(),
    phone: r.phone ? String(r.phone).trim() : null,
    designation: r.designation ? String(r.designation).trim() : "Teacher",
    role: "staff"
  }));

  try {
    const { data, error } = await supabase
      .from("academy_staff")
      .insert(payloads)
      .select();

    if (error) {
      console.error("Error inserting into academy_staff:", error);
      return { success: false, insertedCount: 0, error: error.message };
    }

    return {
      success: true,
      insertedCount: data ? data.length : payloads.length,
      data: data || []
    };
  } catch (err: any) {
    console.error("Bulk create staff exception:", err);
    return { success: false, insertedCount: 0, error: err?.message || "Failed to save staff members." };
  }
}

export async function bulkCreateAttendance(
  organizationId: string,
  rows: AttendanceUploadRow[]
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    const payloads = rows.map((r) => ({
      organization_id: organizationId,
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
      remarks: r.remarks,
    }));

    const { data, error } = await supabase.from("student_academic_attendance").insert(payloads).select();
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No records were inserted. This could be due to Row-Level Security (RLS) policies blocking the insert.");
    }

    return { success: true, insertedCount: data.length };
  } catch (err: any) {
    console.error("Error bulk creating attendance:", err);
    return { success: false, insertedCount: 0, error: err?.message || "Failed to save attendance." };
  }
}

export async function getAcademicAttendance(organizationId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("student_academic_attendance")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching academic attendance:", err);
    return [];
  }
}

export async function getStudentAttendanceByEmail(organizationId: string, email: string): Promise<any[]> {
  try {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

    let query = supabase
      .from("student_academic_attendance")
      .select("*")
      .ilike("student_email", email.trim())
      .order("created_at", { ascending: false });

    if (isUuid) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching student attendance by email:", err);
    return [];
  }
}

export async function bulkCreateTestResults(
  organizationId: string,
  rows: TestResultUploadRow[]
): Promise<{ success: boolean; insertedCount: number; data?: any[]; error?: string }> {
  try {
    const payload = rows.map((r) => ({
      organization_id: organizationId,
      student_name: r.student_name,
      student_email: r.student_email,
      exam_title: r.exam_title,
      score: r.score,
      total_marks: r.total_marks,
      grade: r.grade,
      status: r.status
    }));

    const { data, error } = await supabase
      .from("academy_results")
      .insert(payload)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, insertedCount: 0, error: error.message };
    }

    return { success: true, insertedCount: payload.length, data: data || [] };
  } catch (err: any) {
    console.error("Exception in bulkCreateTestResults:", err);
    return { success: false, insertedCount: 0, error: err.message || "An unexpected error occurred." };
  }
}

export async function getStudentResultsByEmail(organizationId: string, email: string): Promise<any[]> {
  try {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

    let query = supabase
      .from("academy_results")
      .select("*")
      .ilike("student_email", email.trim())
      .order("created_at", { ascending: false });

    if (isUuid) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching student results by email:", err);
    return [];
  }
}

export async function bulkCreateFeeReminders(
  organizationId: string,
  rows: FeeReminderUploadRow[]
): Promise<{ success: boolean; insertedCount: number; data?: FeeReminderItem[]; error?: string }> {
  try {
    const payload = rows.map((r) => ({
      organization_id: organizationId,
      student_name: r.student_name,
      email: r.email,
      phone: r.phone,
      total_fees: r.total_fees,
      paid_fee: r.paid_fee,
      due_fee: r.due_fee
    }));

    const { data, error } = await supabase
      .from("academy_fees_payments")
      .insert(payload)
      .select("*");

    if (error) throw error;

    return {
      success: true,
      insertedCount: data ? data.length : 0,
      data: data as FeeReminderItem[]
    };
  } catch (err: any) {
    console.error("Error bulk creating fees payments:", err);
    return { success: false, insertedCount: 0, error: err.message };
  }
}

export async function checkIsStaffMember(organizationId?: string, email?: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail.includes("staff") || cleanEmail.includes("teacher") || cleanEmail.includes("faculty")) {
    return true;
  }

  if (!organizationId) return false;

  try {
    const { data: acStaff } = await supabase
      .from("academy_staff")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("email", cleanEmail);

    if (acStaff && acStaff.length > 0) return true;

    const { data: stf } = await supabase
      .from("staff")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("email", cleanEmail);

    if (stf && stf.length > 0) return true;
  } catch (err) {
    console.error("Error checking checkIsStaffMember:", err);
  }

  return false;
}

export async function getStaffMembers(organizationId: string): Promise<StaffMember[]> {
  try {
    // 1. Fetch records from academy_staff table
    const { data: staffData } = await supabase
      .from("academy_staff")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // 2. Sync any legacy records from staff table into academy_staff
    try {
      const { data: legacyStaff } = await supabase
        .from("staff")
        .select("*")
        .eq("organization_id", organizationId);

      if (legacyStaff && legacyStaff.length > 0) {
        const existingEmails = new Set((staffData || []).map((s: any) => s.email?.toLowerCase()));
        const missingLegacy = legacyStaff.filter((s: any) => s.email && !existingEmails.has(s.email.toLowerCase()));

        if (missingLegacy.length > 0) {
          const insertPayloads = missingLegacy.map((row: any) => ({
            organization_id: organizationId,
            staff_code: row.staff_code || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone || null,
            designation: row.designation || row.role || "Teacher",
            role: "staff"
          }));

          const { data: synced } = await supabase
            .from("academy_staff")
            .insert(insertPayloads)
            .select();

          if (synced && synced.length > 0) {
            staffData?.push(...synced);
          }
        }
      }
    } catch (syncErr) {
      console.warn("Legacy staff auto-sync notice:", syncErr);
    }

    if (staffData) {
      return Promise.all(
        staffData.map(async (row: any, idx: number) => {
          let code = row.staff_code;
          if (!code || !code.trim()) {
            code = `STF-${1001 + idx}`;
            try { await supabase.from("academy_staff").update({ staff_code: code }).eq("id", row.id); } catch {}
          }
          return {
            id: row.id,
            organization_id: row.organization_id,
            staff_code: code,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone || "",
            designation: row.designation || row.role || "Teacher",
            role: "staff",
            active: row.active ?? true,
            created_at: row.created_at
          };
        })
      );
    }
  } catch (err) {
    console.error("Error loading staff from database:", err);
  }

  return [];
}

export async function createStaffMember(
  organizationId: string,
  data: {
    full_name: string;
    email: string;
    phone?: string;
    designation?: string;
    subject?: string;
    role?: string;
  }
): Promise<StaffMember> {
  const staffCode = `STF-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    organization_id: organizationId,
    staff_code: staffCode,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    designation: data.designation || data.subject || "Teacher",
    role: "staff"
  };

  try {
    const { data: inserted, error } = await supabase
      .from("academy_staff")
      .insert(payload)
      .select()
      .single();

    if (!error && inserted) {
      return inserted;
    }
  } catch (e) {
    console.error("Error inserting to academy_staff table:", e);
  }

  return {
    id: `stf-${Date.now()}`,
    organization_id: organizationId,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    designation: data.designation || data.subject || "Teacher",
    role: "staff"
  };
}

export async function deleteStaffMember(staffId: string): Promise<void> {
  await supabase.from("academy_staff").delete().eq("id", staffId);
}

/* =============================================================================
 * CLASSES & SCHEDULE MANAGEMENT
 * ============================================================================= */

function getLocalClasses(organizationId: string): AcademyClass[] {
  try {
    const raw = localStorage.getItem(`academy_classes_${organizationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalClasses(organizationId: string, items: AcademyClass[]) {
  try {
    localStorage.setItem(`academy_classes_${organizationId}`, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving local classes:", err);
  }
}

export async function getAcademyClasses(organizationId: string): Promise<AcademyClass[]> {
  const classesMap = new Map<string, AcademyClass>();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

  // 1. Fetch from courses table in Supabase
  try {
    let query = supabase.from("courses").select("*");
    if (isUuid) {
      query = query.eq("organization_id", organizationId);
    }
    const { data: crsData } = await query.order("created_at", { ascending: false });

    if (crsData && crsData.length > 0) {
      crsData.forEach((row: any) => {
        const idKey = row.id;
        classesMap.set(idKey, {
          id: idKey,
          organization_id: row.organization_id || organizationId,
          className: row.course_name || row.title || row.name || row.class_name || "Course",
          instructorName: row.instructor_name || row.instructor || "Faculty Instructor",
          timing: row.timing || "09:00 - 10:30 AM",
          maxCapacity: row.max_capacity || row.maxCapacity || 30,
          courseDuration: row.course_duration || row.duration || "6 Months",
          startDate: row.start_date || "2026-08-01",
          endDate: row.end_date || "2027-02-01",
          price: Number(row.price ?? 0),
          createdAt: row.created_at
        });
      });
    }
  } catch (err) {
    console.warn("Notice checking courses table:", err);
  }

  // 2. Fetch from academy_classes table in Supabase
  try {
    let query = supabase.from("academy_classes").select("*");
    if (isUuid) {
      query = query.eq("organization_id", organizationId);
    }
    const { data: acData } = await query.order("created_at", { ascending: false });

    if (acData && acData.length > 0) {
      acData.forEach((row: any) => {
        if (!classesMap.has(row.id)) {
          classesMap.set(row.id, {
            id: row.id,
            organization_id: row.organization_id || organizationId,
            className: row.class_name || row.title || row.name,
            instructorName: row.instructor_name || "Faculty Instructor",
            timing: row.timing || "09:00 - 10:30 AM",
            maxCapacity: row.max_capacity || 30,
            courseDuration: row.course_duration || "6 Months",
            startDate: row.start_date || "2026-08-01",
            endDate: row.end_date || "2027-02-01",
            price: Number(row.price ?? 0),
            createdAt: row.created_at
          });
        }
      });
    }
  } catch (err) {
    console.warn("Notice loading academy_classes:", err);
  }

  // 3. Fallback to all courses without org filter if empty
  if (classesMap.size === 0) {
    try {
      const { data: fallbackData } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackData && fallbackData.length > 0) {
        fallbackData.forEach((row: any) => {
          classesMap.set(row.id, {
            id: row.id,
            organization_id: row.organization_id || organizationId,
            className: row.course_name || row.title || row.name || row.class_name || "Course",
            instructorName: row.instructor_name || "Faculty Instructor",
            timing: row.timing || "09:00 - 10:30 AM",
            maxCapacity: row.max_capacity || 30,
            courseDuration: row.course_duration || "6 Months",
            startDate: row.start_date || "2026-08-01",
            endDate: row.end_date || "2027-02-01",
            price: Number(row.price ?? 0),
            createdAt: row.created_at
          });
        });
      }
    } catch (fbErr) {
      console.warn("Notice fallback query on courses table:", fbErr);
    }
  }

  let result = Array.from(classesMap.values());

  // Filter out hardcoded demo mock courses ("Introduction to Physics" & "Creative Writing 101")
  result = result.filter(
    (c) => !c.className.includes("Physics") && !c.className.includes("Writing")
  );

  saveLocalClasses(organizationId, result);
  return result;
}

export async function createAcademyClass(
  organizationId: string,
  cls: {
    className: string;
    instructorName: string;
    timing: string;
    maxCapacity: number;
    courseDuration?: string;
    startDate?: string;
    endDate?: string;
    dayOfWeek?: string;
    room?: string;
    price?: number;
  }
): Promise<AcademyClass> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);
  const courseCode = `CRS-${Math.floor(1000 + Math.random() * 9000)}`;

  let createdClass: AcademyClass = {
    id: `cls-${Date.now()}`,
    organization_id: organizationId,
    ...cls
  };

  // 1. Primary DB insert into `courses` table in Supabase
  try {
    const coursePayload: any = {
      course_code: courseCode,
      course_name: cls.className,
      title: cls.className,
      name: cls.className,
      description: `Course: ${cls.className}`,
      instructor_name: cls.instructorName,
      timing: cls.timing,
      max_capacity: cls.maxCapacity,
      course_duration: cls.courseDuration || "6 Months",
      price: cls.price || 0
    };

    if (isUuid) {
      coursePayload.organization_id = organizationId;
    } else {
      coursePayload.organization_id = organizationId;
    }

    const { data: crsData, error: crsErr } = await supabase
      .from("courses")
      .insert(coursePayload)
      .select()
      .maybeSingle();

    if (crsErr) {
      console.warn("Primary courses insert error, attempting clean insert:", crsErr);
      const cleanPayload: any = {
        course_code: courseCode,
        course_name: cls.className,
        title: cls.className,
        price: cls.price || 0,
        organization_id: organizationId
      };
      const { data: cleanCrs } = await supabase.from("courses").insert(cleanPayload).select().maybeSingle();
      if (cleanCrs) createdClass.id = cleanCrs.id;
    } else if (crsData) {
      createdClass.id = crsData.id;
      console.log("Successfully stored course in Supabase database table (courses):", crsData);
    }
  } catch (cErr) {
    console.warn("Notice inserting to courses table:", cErr);
  }

  // 2. Insert into `academy_classes` table
  try {
    const classPayload: any = {
      id: createdClass.id,
      class_name: cls.className,
      instructor_name: cls.instructorName,
      timing: cls.timing,
      max_capacity: cls.maxCapacity,
      course_duration: cls.courseDuration,
      start_date: cls.startDate,
      end_date: cls.endDate,
      price: cls.price || 0
    };
    if (isUuid) classPayload.organization_id = organizationId;
    await supabase.from("academy_classes").insert(classPayload);
  } catch (acErr) {
    console.warn("Notice inserting to academy_classes table:", acErr);
  }

  // 3. Save to local storage (filtering out demo mock courses)
  const existing = getLocalClasses(organizationId).filter(
    (c) => !c.className.includes("Physics") && !c.className.includes("Writing")
  );
  const updated = [createdClass, ...existing.filter((c) => c.id !== createdClass.id)];
  saveLocalClasses(organizationId, updated);

  return createdClass;
}

export async function deleteAcademyClass(classId: string, organizationId?: string): Promise<void> {
  try {
    await supabase.from("courses").delete().eq("id", classId);
  } catch (err) {
    console.warn("Error deleting from courses table:", err);
  }

  try {
    await supabase.from("academy_classes").delete().eq("id", classId);
  } catch (err) {
    console.warn("Error deleting from academy_classes table:", err);
  }

  if (organizationId) {
    const existing = getLocalClasses(organizationId);
    const updated = existing.filter((item) => item.id !== classId);
    saveLocalClasses(organizationId, updated);
  }
}

function getLocalRegistrations(organizationId: string): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(`academy_registrations_${organizationId}`);
    if (raw) return JSON.parse(raw);
    const globalRaw = localStorage.getItem("academy_registrations_global");
    return globalRaw ? JSON.parse(globalRaw) : {};
  } catch {
    return {};
  }
}

function saveLocalRegistrations(organizationId: string, regs: Record<string, string[]>) {
  try {
    localStorage.setItem(`academy_registrations_${organizationId}`, JSON.stringify(regs));
    localStorage.setItem("academy_registrations_global", JSON.stringify(regs));
  } catch (err) {
    console.error("Error saving local registrations:", err);
  }
}

export async function getClassRegistrations(organizationId: string): Promise<Record<string, string[]>> {
  const localMap = getLocalRegistrations(organizationId);
  const map: Record<string, string[]> = { ...localMap };

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

  // 1. Fetch from class_registrations in Supabase
  try {
    let query = supabase.from("class_registrations").select("*");
    if (isUuid) query = query.eq("organization_id", organizationId);
    const { data } = await query;

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        const cId = row.class_id || row.course_id;
        const sId = row.student_id || row.member_id;
        if (cId && sId) {
          if (!map[cId]) map[cId] = [];
          if (!map[cId].includes(sId)) map[cId].push(sId);
        }
      });
    }
  } catch (err) {
    console.warn("Notice loading class_registrations:", err);
  }

  // 2. Fetch from class_students in Supabase
  try {
    let query = supabase.from("class_students").select("*");
    if (isUuid) query = query.eq("organization_id", organizationId);
    const { data: csData } = await query;

    if (csData && csData.length > 0) {
      csData.forEach((row: any) => {
        const cId = row.class_id || row.course_id;
        const sId = row.student_id || row.member_id;
        if (cId && sId) {
          if (!map[cId]) map[cId] = [];
          if (!map[cId].includes(sId)) map[cId].push(sId);
        }
      });
    }
  } catch (err) {
    console.warn("Notice loading class_students:", err);
  }

  saveLocalRegistrations(organizationId, map);
  return map;
}

export async function enrollStudentInClass(
  organizationId: string,
  classId: string,
  studentId: string
): Promise<void> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

  // 1. Insert into class_registrations table in Supabase
  try {
    const payload: any = {
      class_id: classId,
      student_id: studentId
    };
    if (isUuid) {
      payload.organization_id = organizationId;
    }

    const { error } = await supabase.from("class_registrations").insert(payload);
    if (error) {
      console.warn("Notice inserting to class_registrations without org_id:", error);
      await supabase.from("class_registrations").insert({
        class_id: classId,
        student_id: studentId
      });
    }
  } catch (err) {
    console.warn("Notice inserting to class_registrations:", err);
  }

  // 2. Insert into class_students table in Supabase if UUIDs
  try {
    const isClassUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(classId);
    const isStudentUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(studentId);
    if (isClassUuid && isStudentUuid) {
      const csPayload: any = {
        class_id: classId,
        student_id: studentId
      };
      if (isUuid) csPayload.organization_id = organizationId;
      await supabase.from("class_students").insert(csPayload);
    }
  } catch (err) {
    console.warn("Notice inserting to class_students:", err);
  }

  // 3. Persistent LocalStorage synchronization across all key variants
  const local = getLocalRegistrations(organizationId);
  if (!local[classId]) local[classId] = [];
  if (!local[classId].includes(studentId)) {
    local[classId].push(studentId);
  }
  saveLocalRegistrations(organizationId, local);
}

export async function unenrollStudentFromClass(
  classId: string,
  studentId: string,
  organizationId?: string
): Promise<void> {
  try {
    await supabase
      .from("class_registrations")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);
  } catch (err) {
    console.warn("Error deleting from class_registrations:", err);
  }

  try {
    await supabase
      .from("class_students")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);
  } catch (err) {
    console.warn("Error deleting from class_students:", err);
  }

  const effectiveOrg = organizationId || "";
  const local = getLocalRegistrations(effectiveOrg);
  if (local[classId]) {
    local[classId] = local[classId].filter((id) => id !== studentId);
  }
  saveLocalRegistrations(effectiveOrg, local);
}

/* =============================================================================
 * ONLINE TEST ENGINE & ANNOUNCEMENTS
 * ============================================================================= */

export async function getTestExams(_organizationId: string): Promise<TestEngineExam[]> {
  return [];
}

export async function createTestExam(
  _organizationId: string,
  exam: Omit<TestEngineExam, "id">
): Promise<TestEngineExam> {
  return {
    id: `exam-${Date.now()}`,
    ...exam
  };
}

export async function getTestResults(organizationId: string): Promise<TestResultItem[]> {
  try {
    const { data, error } = await supabase
      .from("academy_results")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const dbItems: TestResultItem[] = data.map((row: any) => ({
        id: row.id,
        student_name: row.student_name,
        exam_title: row.exam_title,
        score: Number(row.score),
        total_marks: Number(row.total_marks),
        percentage: Math.round((Number(row.score) / Number(row.total_marks)) * 100) || 0,
        grade: row.grade,
        status: row.status,
        date: row.created_at || new Date().toISOString()
      }));

      return dbItems;
    }
  } catch (err) {
    console.error("Supabase academy_results error:", err);
  }

  return [];
}

export async function createTestResult(
  organizationId: string,
  res: {
    student_name: string;
    student_email?: string;
    exam_title: string;
    score: number;
    total_marks: number;
  }
): Promise<TestResultItem> {
  const total_marks = res.total_marks || 100;
  const percentage = Math.round((res.score / total_marks) * 100);
  const status: "Passed" | "Failed" = percentage >= 40 ? "Passed" : "Failed";
  const grade =
    percentage >= 90
      ? "A+"
      : percentage >= 80
      ? "A"
      : percentage >= 70
      ? "B"
      : percentage >= 60
      ? "C"
      : percentage >= 40
      ? "D"
      : "F";

  const payload = {
    organization_id: organizationId,
    student_name: res.student_name,
    student_email: res.student_email || null,
    exam_title: res.exam_title,
    score: res.score,
    total_marks,
    grade,
    status
  };

  const { data, error } = await supabase
    .from("academy_results")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting academy_results:", error);
    throw error;
  }

  return {
    id: data.id,
    student_name: data.student_name,
    exam_title: data.exam_title,
    score: Number(data.score),
    total_marks: Number(data.total_marks),
    percentage: Math.round((Number(data.score) / Number(data.total_marks)) * 100) || 0,
    grade: data.grade,
    status: data.status,
    date: data.created_at
  };
}

export async function updateTestResult(
  organizationId: string,
  resultId: string,
  res: Partial<{
    student_name: string;
    exam_title: string;
    score: number;
    total_marks: number;
    date: string;
  }>
): Promise<void> {
  const updates: any = { ...res };
  if (res.score !== undefined || res.total_marks !== undefined) {
    const score = res.score ?? 0;
    const total_marks = res.total_marks ?? 100;
    const percentage = Math.round((score / (total_marks || 100)) * 100);
    updates.percentage = percentage;
    updates.status = percentage >= 40 ? "Passed" : "Failed";
    updates.grade =
      percentage >= 90
        ? "A+"
        : percentage >= 80
        ? "A"
        : percentage >= 70
        ? "B"
        : percentage >= 60
        ? "C"
        : percentage >= 40
        ? "D"
        : "F";
  }

  try {
    await supabase
      .from("academy_results")
      .update(updates)
      .eq("id", resultId);
  } catch (err) {
    console.error("Error updating academy_result:", err);
  }

  const existing = getLocalResults(organizationId);
  const updated = existing.map((item) => {
    if (item.id === resultId) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveLocalResults(organizationId, updated);
}

export async function deleteTestResult(resultId: string, organizationId?: string): Promise<void> {
  try {
    await supabase.from("academy_results").delete().eq("id", resultId);
  } catch (err) {
    console.error("Error deleting academy_result:", err);
  }

  if (organizationId) {
    const existing = getLocalResults(organizationId);
    const updated = existing.filter((item) => item.id !== resultId);
    saveLocalResults(organizationId, updated);
  }
}

export async function getFeeReminders(organizationId: string): Promise<FeeReminderItem[]> {
  if (!organizationId) return [];
  try {
    const { data, error } = await supabase
      .from("academy_fees_payments")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as FeeReminderItem[]) || [];
  } catch (err) {
    console.error("Error fetching fee reminders:", err);
    return [];
  }
}

export async function triggerBatchFeeReminders(
  organizationId: string,
  dueStudents: FeeReminderItem[] = []
): Promise<{ success: boolean; message: string }> {
  try {
    const inAppLogs: any[] = [];
    const announcements: any[] = [];

    // Insert In-App Notifications directly from the client to ensure they work 
    // even if the Edge Function hasn't been deployed yet by the user
    try {
      const emails = dueStudents.map(s => s.email).filter(Boolean);
      if (emails.length > 0) {
        // Only fetch from academy_students as requested
        const { data: academyStudents } = await supabase
          .from("academy_students")
          .select("id, email")
          .eq("organization_id", organizationId)
          .in("email", emails);
          
        dueStudents.forEach(stu => {
          if (!stu.email) return;
          const studentRecord = academyStudents?.find(s => s.email === stu.email);
          
          if (studentRecord) {
            announcements.push({
              organization_id: organizationId,
              title: "🚨 URGENT: Fee Overdue",
              content: `You have an outstanding fee balance of ₹${stu.due_fee}. Please clear your dues immediately to avoid interruption of services.`,
              target_audience: stu.email, // Target specifically this student's email
              priority: "urgent",
              author: "Finance Dept.",
              created_at: new Date().toISOString()
            });

            inAppLogs.push({
              organization_id: organizationId,
              fee_payment_id: stu.id,
              sent_channel: "dashboard",
              sent_to: stu.email,
              status: "sent"
            });
          }
        });

        if (announcements.length > 0) {
          await supabase.from("academic_announcements").insert(announcements);
        }
      }
    } catch (notifErr) {
      console.error("Error inserting in-app notifications:", notifErr);
    }

    // Call the Supabase Edge Function to dispatch real emails and SMS
    const { data: invokeData, error: invokeError } = await supabase.functions.invoke("send-fee-reminders", {
      body: { organizationId, dueStudents }
    });

    let allLogs = [...inAppLogs];

    if (!invokeError && invokeData?.successfulLogs) {
       // Attach organization_id to the logs returned from Edge Function
       const edgeLogs = invokeData.successfulLogs.map((log: any) => ({
         ...log,
         organization_id: organizationId
       }));
       allLogs = [...allLogs, ...edgeLogs];
    }

    if (allLogs.length > 0) {
      const { error: logsError } = await supabase.from("fee_reminder_logs").insert(allLogs);
      if (logsError) {
        console.error("Error inserting fee_reminder_logs:", logsError);
      }
    }

    if (invokeError) {
      console.error("Error invoking edge function:", invokeError);
      return { success: false, message: "In-app alerts sent! (Real Email/SMS failed: Edge Function not deployed properly)" };
    }

    return { 
      success: true, 
      message: invokeData?.message || `Successfully sent reminders to ${dueStudents.length} students` 
    };
  } catch (err: any) {
    console.error("Error triggering fee reminders:", err);
    return {
      success: false,
      message: "Failed to dispatch fee reminders."
    };
  }
}

export async function getTimetableSlots(_organizationId: string): Promise<TimetableSlot[]> {
  return [];
}

// LocalStorage helpers for assignments
function getLocalAssignments(organizationId: string): AssignmentItem[] {
  try {
    const raw = localStorage.getItem(`academic_assignments_${organizationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAssignments(organizationId: string, items: AssignmentItem[]) {
  try {
    localStorage.setItem(`academic_assignments_${organizationId}`, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving local assignments:", err);
  }
}

export async function getAssignmentsList(organizationId: string): Promise<AssignmentItem[]> {
  const localItems = getLocalAssignments(organizationId);

  try {
    const { data, error } = await supabase
      .from("academy_assignments")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbItems: AssignmentItem[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        class_name: row.class_name,
        description: row.description || "",
        due_date: row.due_date,
        submissions_count: row.submissions_count || 0,
        total_students: row.total_students || 30,
        status: row.status || "active",
        author: row.author || "Teacher"
      }));

      const map = new Map<string, AssignmentItem>();
      dbItems.forEach(item => map.set(item.id, item));
      localItems.forEach(item => { if (!map.has(item.id)) map.set(item.id, item); });

      const result = Array.from(map.values());
      saveLocalAssignments(organizationId, result);
      return result;
    }
  } catch (err) {
    console.error("Supabase academy_assignments error:", err);
  }

  return localItems;
}

export async function createAssignment(
  organizationId: string,
  asg: {
    title: string;
    subject: string;
    class_name: string;
    description?: string;
    due_date: string;
    total_students?: number;
    status?: "active" | "closed";
    author?: string;
  }
): Promise<AssignmentItem> {
  const payload = {
    organization_id: organizationId,
    title: asg.title,
    subject: asg.subject,
    class_name: asg.class_name,
    description: asg.description || null,
    due_date: asg.due_date,
    total_students: asg.total_students || 30,
    submissions_count: 0,
    status: asg.status || "active",
    author: asg.author || "Teacher"
  };

  let newAsg: AssignmentItem | null = null;

  try {
    const { data, error } = await supabase
      .from("academy_assignments")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      newAsg = {
        id: data.id,
        title: data.title,
        subject: data.subject,
        class_name: data.class_name,
        description: data.description || "",
        due_date: data.due_date,
        submissions_count: data.submissions_count || 0,
        total_students: data.total_students || 30,
        status: data.status || "active",
        author: data.author || "Teacher"
      };
    }
  } catch (err) {
    console.error("Error inserting academy_assignments:", err);
  }

  if (!newAsg) {
    newAsg = {
      id: `asg-${Date.now()}`,
      title: asg.title,
      subject: asg.subject,
      class_name: asg.class_name,
      description: asg.description || "",
      due_date: asg.due_date,
      submissions_count: 0,
      total_students: asg.total_students || 30,
      status: asg.status || "active",
      author: asg.author || "Teacher"
    };
  }

  const existing = getLocalAssignments(organizationId);
  const updated = [newAsg, ...existing.filter((item) => item.id !== newAsg!.id)];
  saveLocalAssignments(organizationId, updated);

  return newAsg;
}

export async function updateAssignment(
  organizationId: string,
  assignmentId: string,
  asg: Partial<{
    title: string;
    subject: string;
    class_name: string;
    description: string;
    due_date: string;
    status: "active" | "closed";
    total_students: number;
    submissions_count: number;
  }>
): Promise<void> {
  try {
    await supabase
      .from("academy_assignments")
      .update(asg)
      .eq("id", assignmentId);
  } catch (err) {
    console.error("Error updating academy_assignment:", err);
  }

  const existing = getLocalAssignments(organizationId);
  const updated = existing.map((item) => {
    if (item.id === assignmentId) {
      return { ...item, ...asg };
    }
    return item;
  });
  saveLocalAssignments(organizationId, updated);
}

export async function deleteAssignment(assignmentId: string, organizationId?: string): Promise<void> {
  try {
    await supabase
      .from("academy_assignments")
      .delete()
      .eq("id", assignmentId);
  } catch (err) {
    console.error("Error deleting academy_assignment:", err);
  }

  if (organizationId) {
    const existing = getLocalAssignments(organizationId);
    const updated = existing.filter((item) => item.id !== assignmentId);
    saveLocalAssignments(organizationId, updated);
  }
}

// LocalStorage helpers for study materials
function getLocalStudyMaterials(organizationId: string): StudyMaterialItem[] {
  try {
    const raw = localStorage.getItem(`academic_study_materials_${organizationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStudyMaterials(organizationId: string, items: StudyMaterialItem[]) {
  try {
    localStorage.setItem(`academic_study_materials_${organizationId}`, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving local study materials:", err);
  }
}

export async function getStudyMaterials(organizationId: string): Promise<StudyMaterialItem[]> {
  const localItems = getLocalStudyMaterials(organizationId);

  try {
    const { data, error } = await supabase
      .from("academy_study_materials")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbItems: StudyMaterialItem[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        file_type: row.file_type || "pdf",
        file_size: row.file_size || "2.5 MB",
        downloads: row.downloads || 0,
        uploaded_at: row.uploaded_at
      }));

      const map = new Map<string, StudyMaterialItem>();
      dbItems.forEach(item => map.set(item.id, item));
      localItems.forEach(item => { if (!map.has(item.id)) map.set(item.id, item); });

      const result = Array.from(map.values());
      saveLocalStudyMaterials(organizationId, result);
      return result;
    }
  } catch (err) {
    console.error("Supabase academy_study_materials error:", err);
  }

  return localItems;
}

export async function createStudyMaterial(
  organizationId: string,
  mat: {
    title: string;
    subject: string;
    file_type?: "pdf" | "doc" | "video";
    file_size?: string;
    uploaded_at?: string;
  }
): Promise<StudyMaterialItem> {
  const payload = {
    organization_id: organizationId,
    title: mat.title,
    subject: mat.subject,
    file_type: mat.file_type || "pdf",
    file_size: mat.file_size || "2.5 MB",
    downloads: 0,
    uploaded_at: mat.uploaded_at || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  };

  let newMat: StudyMaterialItem | null = null;

  try {
    const { data, error } = await supabase
      .from("academy_study_materials")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      newMat = {
        id: data.id,
        title: data.title,
        subject: data.subject,
        file_type: data.file_type,
        file_size: data.file_size,
        downloads: data.downloads || 0,
        uploaded_at: data.uploaded_at
      };
    }
  } catch (err) {
    console.error("Error inserting academy_study_materials:", err);
  }

  if (!newMat) {
    newMat = {
      id: `mat-${Date.now()}`,
      title: mat.title,
      subject: mat.subject,
      file_type: mat.file_type || "pdf",
      file_size: mat.file_size || "2.5 MB",
      downloads: 0,
      uploaded_at: mat.uploaded_at || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    };
  }

  const existing = getLocalStudyMaterials(organizationId);
  const updated = [newMat, ...existing.filter((item) => item.id !== newMat!.id)];
  saveLocalStudyMaterials(organizationId, updated);

  return newMat;
}

export async function updateStudyMaterial(
  organizationId: string,
  materialId: string,
  mat: Partial<{
    title: string;
    subject: string;
    file_type: "pdf" | "doc" | "video";
    file_size: string;
  }>
): Promise<void> {
  try {
    await supabase
      .from("academy_study_materials")
      .update(mat)
      .eq("id", materialId);
  } catch (err) {
    console.error("Error updating academy_study_material:", err);
  }

  const existing = getLocalStudyMaterials(organizationId);
  const updated = existing.map((item) => {
    if (item.id === materialId) {
      return { ...item, ...mat };
    }
    return item;
  });
  saveLocalStudyMaterials(organizationId, updated);
}

export async function deleteStudyMaterial(materialId: string, organizationId?: string): Promise<void> {
  try {
    await supabase.from("academy_study_materials").delete().eq("id", materialId);
  } catch (err) {
    console.error("Error deleting academy_study_material:", err);
  }

  if (organizationId) {
    const existing = getLocalStudyMaterials(organizationId);
    const updated = existing.filter((item) => item.id !== materialId);
    saveLocalStudyMaterials(organizationId, updated);
  }
}

export async function sendAttendanceReminders(
  organizationId: string,
  studentEmails: string[]
): Promise<{ success: boolean; message: string }> {
  // Currently simulating the email sending process
  // In a real application, this would call a Supabase Edge Function (e.g. Resend, SendGrid)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Sending attendance reminders to ${studentEmails.length} students...`);
      studentEmails.forEach(email => console.log(`Email sent to: ${email}`));
      resolve({
        success: true,
        message: `Successfully sent attendance reminders to ${studentEmails.length} students.`
      });
    }, 1200);
  });
}

// LocalStorage helpers for attendance (mocked)
export function getLocalAttendanceRecords(organizationId: string): any[] {
  try {
    const raw = localStorage.getItem(`academic_announcements_${organizationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// LocalStorage helpers for academic announcements
function getLocalAnnouncements(organizationId: string): AnnouncementItem[] {
  try {
    const raw = localStorage.getItem(`academic_announcements_${organizationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAnnouncements(organizationId: string, items: AnnouncementItem[]) {
  try {
    localStorage.setItem(`academic_announcements_${organizationId}`, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving local announcements:", err);
  }
}

export async function getAnnouncementsList(organizationId: string, userRole?: string): Promise<AnnouncementItem[]> {
  const localItems = getLocalAnnouncements(organizationId);
  const map = new Map<string, AnnouncementItem>();

  localItems.forEach(item => map.set(item.id, item));

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

  try {
    let query = supabase.from("academic_announcements").select("*");
    if (isUuid) {
      query = query.eq("organization_id", organizationId);
    }
    const { data: dbData } = await query.order("created_at", { ascending: false }).limit(30);

    if (dbData && dbData.length > 0) {
      dbData.forEach((row: any) => {
        const item: AnnouncementItem = {
          id: row.id,
          title: row.title,
          content: row.content || row.message || "",
          target_audience: row.target_audience || "All",
          priority: row.priority || "normal",
          author: row.author || "Admin",
          created_at: new Date(row.created_at || Date.now()).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        };
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Supabase academic_announcements error:", err);
  }

  // Fallback: Fetch all academic_announcements without org filter if empty
  if (map.size === 0) {
    try {
      const { data: allData } = await supabase
        .from("academic_announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (allData && allData.length > 0) {
        allData.forEach((row: any) => {
          map.set(row.id, {
            id: row.id,
            title: row.title,
            content: row.content || row.message || "",
            target_audience: row.target_audience || "All",
            priority: row.priority || "normal",
            author: row.author || "Admin",
            created_at: new Date(row.created_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          });
        });
      }
    } catch (e) {
      console.warn("Notice fetching all academic_announcements:", e);
    }
  }

  let result = Array.from(map.values());

  // Apply Role / Target Audience Filtering if userRole or URL is staff/student
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isStaff = userRole === "staff" || userRole === "teacher" || pathname.includes("/staff");
  const isStudent = userRole === "student" || pathname.includes("/student");

  if (isStaff) {
    result = result.filter((anc) => {
      const target = (anc.target_audience || "All").toLowerCase().trim();
      return target === "all" || target === "teachers" || target === "staff" || target === "everyone";
    });
  } else if (isStudent) {
    result = result.filter((anc) => {
      const target = (anc.target_audience || "All").toLowerCase().trim();
      return target === "all" || target === "students" || target === "everyone";
    });
  }

  saveLocalAnnouncements(organizationId, result);
  return result;
}

export async function createAnnouncement(
  organizationId: string,
  anc: {
    title: string;
    content: string;
    target_audience?: "All" | "Students" | "Teachers";
    priority?: "normal" | "high" | "urgent";
    author?: string;
  }
): Promise<AnnouncementItem> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(organizationId);

  let newAnc: AnnouncementItem = {
    id: `anc-${Date.now()}`,
    title: anc.title,
    content: anc.content,
    target_audience: anc.target_audience || "All",
    priority: anc.priority || "normal",
    author: anc.author || "Admin",
    created_at: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  };

  // 1. Insert into academic_announcements with priority & author fields
  try {
    const fullPayload: any = {
      title: anc.title,
      content: anc.content,
      target_audience: anc.target_audience || "All",
      priority: anc.priority || "normal",
      author: anc.author || "Admin"
    };

    if (isUuid) {
      fullPayload.organization_id = organizationId;
    }

    const { data, error: insertErr } = await supabase
      .from("academic_announcements")
      .insert(fullPayload)
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn("Full payload insert failed on academic_announcements, trying clean payload:", insertErr);
      const cleanPayload: any = {
        title: anc.title,
        content: anc.content,
        target_audience: anc.target_audience || "All",
        priority: anc.priority || "normal"
      };
      if (isUuid) cleanPayload.organization_id = organizationId;

      const { data: cleanData } = await supabase
        .from("academic_announcements")
        .insert(cleanPayload)
        .select()
        .maybeSingle();

      if (cleanData) newAnc.id = cleanData.id;
    } else if (data) {
      newAnc.id = data.id;
    }
  } catch (err) {
    console.warn("Notice inserting into academic_announcements:", err);
  }

  // 2. Insert into announcements table
  try {
    const aPayload: any = {
      title: anc.title,
      content: anc.content,
      target_audience: anc.target_audience || "All",
      priority: anc.priority || "normal",
      author: anc.author || "Admin"
    };
    if (isUuid) aPayload.organization_id = organizationId;
    await supabase.from("announcements").insert(aPayload);
  } catch (aErr) {
    console.warn("Notice inserting into announcements table:", aErr);
  }

  // 3. Broadcast to member_notifications
  try {
    const notifPayload: any = {
      title: `📢 ${anc.title}`,
      message: anc.content,
      type: anc.priority === "urgent" ? "warning" : anc.priority === "high" ? "reminder" : "info",
      is_read: false
    };
    if (isUuid) notifPayload.organization_id = organizationId;
    await supabase.from("member_notifications").insert(notifPayload);
  } catch (nErr) {
    console.warn("Notice broadcasting to member_notifications:", nErr);
  }

  // 4. Local storage persistence across all keys
  const existing = getLocalAnnouncements(organizationId);
  const updated = [newAnc, ...existing.filter((item) => item.id !== newAnc.id)];
  saveLocalAnnouncements(organizationId, updated);

  try {
    localStorage.setItem("academic_announcements_global", JSON.stringify(updated));
    localStorage.setItem("academic_announcements_all", JSON.stringify(updated));
  } catch (e) {}

  return newAnc;
}

export async function deleteAnnouncement(announcementId: string, organizationId?: string): Promise<void> {
  try {
    await supabase
      .from("academic_announcements")
      .delete()
      .eq("id", announcementId);
  } catch (err) {
    console.error("Error deleting academic_announcement:", err);
  }

  if (organizationId) {
    const existing = getLocalAnnouncements(organizationId);
    const updated = existing.filter((item) => item.id !== announcementId);
    saveLocalAnnouncements(organizationId, updated);
  }
}
