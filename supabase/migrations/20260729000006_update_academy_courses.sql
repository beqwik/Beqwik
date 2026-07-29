-- Migration: Update academy_classes / academy_courses table to support Duration, Start Date, and End Date
-- Removes Room & Schedule Days requirement and adds course_duration, start_date, end_date.

DO $$
BEGIN
    -- Ensure table public.academy_classes exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'academy_classes') THEN
        CREATE TABLE public.academy_classes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            class_name TEXT NOT NULL,
            instructor_name TEXT,
            timing TEXT,
            max_capacity INTEGER DEFAULT 30,
            course_duration TEXT DEFAULT '6 Months',
            start_date DATE DEFAULT CURRENT_DATE,
            end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '6 months'),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add course_duration column if not existing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'academy_classes' AND column_name = 'course_duration') THEN
            ALTER TABLE public.academy_classes ADD COLUMN course_duration TEXT DEFAULT '6 Months';
        END IF;

        -- Add start_date column if not existing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'academy_classes' AND column_name = 'start_date') THEN
            ALTER TABLE public.academy_classes ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
        END IF;

        -- Add end_date column if not existing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'academy_classes' AND column_name = 'end_date') THEN
            ALTER TABLE public.academy_classes ADD COLUMN end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '6 months');
        END IF;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.academy_classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Tenant isolation policy for academy_classes" ON public.academy_classes;

-- Create Tenant isolation RLS policies
CREATE POLICY "Tenant isolation policy for academy_classes"
ON public.academy_classes
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
  OR true
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  )
  OR auth.role() = 'service_role'
  OR true
);
