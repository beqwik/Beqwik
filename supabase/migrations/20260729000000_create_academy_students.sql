-- =============================================================================
-- ACADEMY STUDENTS & COURSE REGISTRATIONS TABLES
-- =============================================================================

-- 1. Create academy_students table
CREATE TABLE IF NOT EXISTS public.academy_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    student_code TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college_id TEXT,
    room_number TEXT,
    hostel_block TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for academy_students
ALTER TABLE public.academy_students ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for academy_students
DROP POLICY IF EXISTS "Allow read academy_students" ON public.academy_students;
CREATE POLICY "Allow read academy_students" ON public.academy_students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert academy_students" ON public.academy_students;
CREATE POLICY "Allow insert academy_students" ON public.academy_students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update academy_students" ON public.academy_students;
CREATE POLICY "Allow update academy_students" ON public.academy_students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete academy_students" ON public.academy_students;
CREATE POLICY "Allow delete academy_students" ON public.academy_students FOR DELETE USING (true);

-- Create Index on organization_id & email
CREATE INDEX IF NOT EXISTS idx_academy_students_org ON public.academy_students(organization_id);
CREATE INDEX IF NOT EXISTS idx_academy_students_email ON public.academy_students(email);

-- 2. Create class_registrations table (Course Enrollments)
CREATE TABLE IF NOT EXISTS public.class_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for class_registrations
ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for class_registrations
DROP POLICY IF EXISTS "Allow read class_registrations" ON public.class_registrations;
CREATE POLICY "Allow read class_registrations" ON public.class_registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert class_registrations" ON public.class_registrations;
CREATE POLICY "Allow insert class_registrations" ON public.class_registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update class_registrations" ON public.class_registrations;
CREATE POLICY "Allow update class_registrations" ON public.class_registrations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete class_registrations" ON public.class_registrations;
CREATE POLICY "Allow delete class_registrations" ON public.class_registrations FOR DELETE USING (true);

-- Create Indices on class_registrations
CREATE INDEX IF NOT EXISTS idx_class_regs_org ON public.class_registrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_class_regs_class ON public.class_registrations(class_id);
CREATE INDEX IF NOT EXISTS idx_class_regs_student ON public.class_registrations(student_id);
