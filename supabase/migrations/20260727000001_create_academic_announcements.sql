-- Create academic_announcements table for AcademySection module
CREATE TABLE IF NOT EXISTS public.academic_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'All',
    priority TEXT NOT NULL DEFAULT 'normal',
    author TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.academic_announcements ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated users full CRUD access
DROP POLICY IF EXISTS "Allow read academic_announcements" ON public.academic_announcements;
CREATE POLICY "Allow read academic_announcements" ON public.academic_announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert academic_announcements" ON public.academic_announcements;
CREATE POLICY "Allow insert academic_announcements" ON public.academic_announcements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update academic_announcements" ON public.academic_announcements;
CREATE POLICY "Allow update academic_announcements" ON public.academic_announcements FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete academic_announcements" ON public.academic_announcements;
CREATE POLICY "Allow delete academic_announcements" ON public.academic_announcements FOR DELETE USING (true);

-- Create index on organization_id
CREATE INDEX IF NOT EXISTS idx_academic_announcements_org ON public.academic_announcements(organization_id);
