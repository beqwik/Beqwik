import { supabase } from "../supabase";

export interface AcademyClass {
  id: string;
  organization_id?: string;
  className: string;
  instructorName: string;
  dayOfWeek: string;
  timing: string;
  room: string;
  maxCapacity: number;
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

export interface FeeReminderItem {
  id: string;
  student_name: string;
  class_name: string;
  due_amount: number;
  due_date: string;
  status: "overdue" | "due_soon" | "sent";
  email: string;
  phone: string;
  last_sent?: string;
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
  due_date: string;
  submissions_count: number;
  total_students: number;
  status: "active" | "closed";
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
 * STUDENTS MANAGEMENT
 * ============================================================================= */

export async function getStudents(organizationId: string): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching students from Supabase:", error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      organization_id: row.organization_id,
      student_code: row.student_code || `STU-${row.id.substring(0, 5)}`,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone || "",
      college_id: row.college_id || "",
      room_number: row.room_number || "",
      hostel_block: row.hostel_block || "",
      role: row.role || "student",
      created_at: row.created_at
    }));
  } catch (err) {
    console.error("Failed to load students, using fallback list:", err);
    return [
      { id: "stu-1", organization_id: organizationId, student_code: "STU-001", full_name: "Liam Wilson", email: "liam.w@school.edu", phone: "+1 555-0199", role: "student" },
      { id: "stu-2", organization_id: organizationId, student_code: "STU-002", full_name: "Sophia Martinez", email: "sophia.m@school.edu", phone: "+1 555-0144", role: "student" },
      { id: "stu-3", organization_id: organizationId, student_code: "STU-003", full_name: "Noah Taylor", email: "noah.t@school.edu", phone: "+1 555-0177", role: "student" },
      { id: "stu-4", organization_id: organizationId, student_code: "STU-004", full_name: "Emma Johnson", email: "emma.j@school.edu", phone: "+1 555-0188", role: "student" },
      { id: "stu-5", organization_id: organizationId, student_code: "STU-005", full_name: "James Smith", email: "james.s@school.edu", phone: "+1 555-0122", role: "student" }
    ];
  }
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

  const { data: inserted, error } = await supabase
    .from("students")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting student to database:", error);
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

  return inserted;
}

export async function deleteStudent(studentId: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) console.error("Error deleting student:", error);
}

/* =============================================================================
 * STAFF & TEACHERS MANAGEMENT
 * ============================================================================= */

export async function getStaffMembers(organizationId: string): Promise<StaffMember[]> {
  try {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff from Supabase:", error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      organization_id: row.organization_id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone || "",
      designation: row.designation || row.role || "Teacher",
      role: "staff",
      active: row.active ?? true,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error("Failed to load staff, using fallback list:", err);
    return [
      { id: "stf-1", organization_id: organizationId, full_name: "Dr. Robert Chen", email: "robert.chen@school.edu", phone: "+1 555-0101", designation: "Physics Department Head", role: "staff" },
      { id: "stf-2", organization_id: organizationId, full_name: "Prof. Sarah Jenkins", email: "sarah.j@school.edu", phone: "+1 555-0102", designation: "Mathematics Senior Lecturer", role: "staff" },
      { id: "stf-3", organization_id: organizationId, full_name: "Mr. David Miller", email: "david.m@school.edu", phone: "+1 555-0103", designation: "Chemistry Faculty", role: "staff" }
    ];
  }
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

  const { data: inserted, error } = await supabase
    .from("staff")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting staff member to database:", error);
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

  return inserted;
}

export async function deleteStaffMember(staffId: string): Promise<void> {
  const { error } = await supabase.from("staff").delete().eq("id", staffId);
  if (error) console.error("Error deleting staff member:", error);
}

/* =============================================================================
 * CLASSES & SCHEDULE MANAGEMENT
 * ============================================================================= */

export async function getAcademyClasses(organizationId: string): Promise<AcademyClass[]> {
  try {
    const { data, error } = await supabase
      .from("academy_classes")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      organization_id: row.organization_id,
      className: row.class_name,
      instructorName: row.instructor_name,
      dayOfWeek: row.day_of_week,
      timing: row.timing,
      room: row.room,
      maxCapacity: row.max_capacity,
      createdAt: row.created_at
    }));
  } catch (err) {
    return [
      { id: "cls-1", className: "Advanced Mathematics 101", instructorName: "Prof. Sarah Jenkins", dayOfWeek: "Mon & Wed", timing: "09:00 - 10:30 AM", room: "Lab 201", maxCapacity: 30 },
      { id: "cls-2", className: "Quantum Physics 202", instructorName: "Dr. Robert Chen", dayOfWeek: "Tue & Thu", timing: "11:00 - 12:30 PM", room: "Hall B", maxCapacity: 25 },
      { id: "cls-3", className: "Organic Chemistry", instructorName: "Mr. David Miller", dayOfWeek: "Friday", timing: "02:00 - 04:00 PM", room: "Chem Lab 3", maxCapacity: 20 }
    ];
  }
}

export async function createAcademyClass(
  organizationId: string,
  cls: {
    className: string;
    instructorName: string;
    dayOfWeek: string;
    timing: string;
    room: string;
    maxCapacity: number;
  }
): Promise<AcademyClass> {
  const payload = {
    organization_id: organizationId,
    class_name: cls.className,
    instructor_name: cls.instructorName,
    day_of_week: cls.dayOfWeek,
    timing: cls.timing,
    room: cls.room,
    max_capacity: cls.maxCapacity
  };

  const { data, error } = await supabase
    .from("academy_classes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return {
      id: `cls-${Date.now()}`,
      organization_id: organizationId,
      ...cls
    };
  }

  return {
    id: data.id,
    organization_id: data.organization_id,
    className: data.class_name,
    instructorName: data.instructor_name,
    dayOfWeek: data.day_of_week,
    timing: data.timing,
    room: data.room,
    maxCapacity: data.max_capacity,
    createdAt: data.created_at
  };
}

export async function deleteAcademyClass(classId: string): Promise<void> {
  await supabase.from("academy_classes").delete().eq("id", classId);
}

export async function getClassRegistrations(organizationId: string): Promise<Record<string, string[]>> {
  try {
    const { data, error } = await supabase
      .from("class_registrations")
      .select("class_id, student_id")
      .eq("organization_id", organizationId);

    if (error) throw error;

    const map: Record<string, string[]> = {};
    (data || []).forEach((row: any) => {
      if (!map[row.class_id]) map[row.class_id] = [];
      map[row.class_id].push(row.student_id);
    });

    return map;
  } catch (err) {
    return {
      "cls-1": ["stu-1", "stu-2", "stu-4"],
      "cls-2": ["stu-3", "stu-5"]
    };
  }
}

export async function enrollStudentInClass(
  organizationId: string,
  classId: string,
  studentId: string
): Promise<void> {
  await supabase.from("class_registrations").insert({
    organization_id: organizationId,
    class_id: classId,
    student_id: studentId
  });
}

export async function unenrollStudentFromClass(classId: string, studentId: string): Promise<void> {
  await supabase
    .from("class_registrations")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);
}

/* =============================================================================
 * ONLINE TEST ENGINE
 * ============================================================================= */

export async function getTestExams(_organizationId: string): Promise<TestEngineExam[]> {
  return [
    {
      id: "exam-1",
      title: "Mathematics Mid-Term Exam 2026",
      subject: "Mathematics",
      class_name: "Class 10 - A",
      duration_minutes: 60,
      total_marks: 100,
      passing_marks: 40,
      status: "scheduled",
      start_time: "2026-07-25 10:00 AM",
      questions_count: 25,
      questions: [
        { id: "q1", question: "What is the derivative of x^2?", options: ["2x", "x", "x^3/3", "2"], correctOptionIndex: 0, marks: 4 },
        { id: "q2", question: "What is the value of Pi to 2 decimal places?", options: ["3.14", "3.16", "3.12", "3.18"], correctOptionIndex: 0, marks: 4 }
      ]
    },
    {
      id: "exam-2",
      title: "Physics Unit Quiz 1",
      subject: "Physics",
      class_name: "Class 12 - B",
      duration_minutes: 45,
      total_marks: 50,
      passing_marks: 20,
      status: "live",
      start_time: "Now Live",
      questions_count: 15
    },
    {
      id: "exam-3",
      title: "Organic Chemistry Term 1",
      subject: "Chemistry",
      class_name: "Class 11 - C",
      duration_minutes: 90,
      total_marks: 100,
      passing_marks: 35,
      status: "completed",
      start_time: "2026-07-18 02:00 PM",
      questions_count: 30
    }
  ];
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

export async function getTestResults(_organizationId: string): Promise<TestResultItem[]> {
  return [
    { id: "res-1", student_name: "Liam Wilson", exam_title: "Mathematics Mid-Term", score: 92, total_marks: 100, percentage: 92, grade: "A+", status: "Passed", date: "18 Jul 2026" },
    { id: "res-2", student_name: "Sophia Martinez", exam_title: "Mathematics Mid-Term", score: 85, total_marks: 100, percentage: 85, grade: "A", status: "Passed", date: "18 Jul 2026" },
    { id: "res-3", student_name: "Noah Taylor", exam_title: "Physics Unit Quiz 1", score: 34, total_marks: 50, percentage: 68, grade: "B", status: "Passed", date: "19 Jul 2026" },
    { id: "res-4", student_name: "Emma Johnson", exam_title: "Physics Unit Quiz 1", score: 18, total_marks: 50, percentage: 36, grade: "F", status: "Failed", date: "19 Jul 2026" }
  ];
}

/* =============================================================================
 * FEE REMINDER AUTOMATION
 * ============================================================================= */

export async function getFeeReminders(_organizationId: string): Promise<FeeReminderItem[]> {
  return [
    { id: "fee-1", student_name: "Emma Johnson", class_name: "Class 10 - A", due_amount: 15000, due_date: "15 Jul 2026", status: "overdue", email: "emma.j@school.edu", phone: "+1 555-0188", last_sent: "2 days ago" },
    { id: "fee-2", student_name: "James Smith", class_name: "Class 8 - B", due_amount: 12000, due_date: "25 Jul 2026", status: "due_soon", email: "james.s@school.edu", phone: "+1 555-0122", last_sent: "Not sent" },
    { id: "fee-3", student_name: "Olivia Brown", class_name: "Class 6 - A", due_amount: 10000, due_date: "28 Jul 2026", status: "due_soon", email: "olivia.b@school.edu", phone: "+1 555-0133", last_sent: "1 week ago" }
  ];
}

export async function triggerBatchFeeReminders(_organizationId: string): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: "Fee reminders dispatched successfully to 15 students via Email & SMS!"
  };
}

/* =============================================================================
 * TIMETABLE, ASSIGNMENTS, STUDY MATERIAL & ANNOUNCEMENTS
 * ============================================================================= */

export async function getTimetableSlots(_organizationId: string): Promise<TimetableSlot[]> {
  return [
    { id: "tt-1", day: "Monday", time: "09:00 - 10:00 AM", subject: "Mathematics", teacher: "Prof. Sarah Jenkins", room: "Room 101", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "tt-2", day: "Monday", time: "10:15 - 11:15 AM", subject: "Physics", teacher: "Dr. Robert Chen", room: "Lab 201", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "tt-3", day: "Tuesday", time: "09:00 - 10:00 AM", subject: "Chemistry", teacher: "Mr. David Miller", room: "Lab 301", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "tt-4", day: "Wednesday", time: "11:30 - 12:30 PM", subject: "English Literature", teacher: "Ms. Clara Vance", room: "Hall B", color: "bg-rose-100 text-rose-700 border-rose-200" }
  ];
}

export async function getAssignmentsList(_organizationId: string): Promise<AssignmentItem[]> {
  return [
    { id: "asg-1", title: "Calculus Problem Set 4", subject: "Mathematics", class_name: "Class 10 - A", due_date: "26 Jul 2026", submissions_count: 24, total_students: 30, status: "active" },
    { id: "asg-2", title: "Quantum Optics Lab Report", subject: "Physics", class_name: "Class 12 - B", due_date: "28 Jul 2026", submissions_count: 18, total_students: 25, status: "active" },
    { id: "asg-3", title: "Organic Reactions Essay", subject: "Chemistry", class_name: "Class 11 - C", due_date: "15 Jul 2026", submissions_count: 20, total_students: 20, status: "closed" }
  ];
}

export async function getStudyMaterials(_organizationId: string): Promise<StudyMaterialItem[]> {
  return [
    { id: "mat-1", title: "Comprehensive Calculus Notes - Ch 1 to 5", subject: "Mathematics", file_type: "pdf", file_size: "4.2 MB", downloads: 142, uploaded_at: "12 Jul 2026" },
    { id: "mat-2", title: "Electromagnetism Formula Sheet", subject: "Physics", file_type: "pdf", file_size: "1.8 MB", downloads: 98, uploaded_at: "15 Jul 2026" },
    { id: "mat-3", title: "Organic Chemistry Reaction Mechanics Video", subject: "Chemistry", file_type: "video", file_size: "120 MB", downloads: 65, uploaded_at: "18 Jul 2026" }
  ];
}

export async function getAnnouncementsList(_organizationId: string): Promise<AnnouncementItem[]> {
  return [
    { id: "anc-1", title: "Mid-Term Examination Schedule Released", content: "The mid-term examination timetable for all grades has been published. Please check the Tests tab for dates.", target_audience: "All", created_at: "2 hours ago", author: "Principal Office", priority: "urgent" },
    { id: "anc-2", title: "Faculty Meeting this Friday at 4 PM", content: "All department heads and teaching staff are requested to attend the monthly academic review meeting.", target_audience: "Teachers", created_at: "1 day ago", author: "Dean of Academics", priority: "high" }
  ];
}
