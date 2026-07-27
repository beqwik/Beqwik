-- Create announcements table for Academy / EduLMS module
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'All',
    priority TEXT NOT NULL DEFAULT 'normal',
    author TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and insert announcements
CREATE POLICY "Allow authenticated read announcements" 
ON public.announcements FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert announcements" 
ON public.announcements FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete announcements" 
ON public.announcements FOR DELETE 
TO authenticated 
USING (true);

-- Index on organization_id for fast queries
CREATE INDEX IF NOT EXISTS idx_announcements_org ON public.announcements(organization_id);
