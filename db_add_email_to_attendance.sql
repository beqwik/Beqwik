-- =========================================================================================
-- MIGRATION SCRIPT: Add student_email to student_academic_attendance
-- =========================================================================================

-- Add the student_email column if it doesn't already exist
ALTER TABLE public.student_academic_attendance
ADD COLUMN IF NOT EXISTS student_email text;
