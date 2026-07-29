-- =============================================================================
-- ACADEMY STUDY MATERIALS TABLE MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'pdf',
    file_size TEXT DEFAULT '2.5 MB',
    downloads INTEGER DEFAULT 0,
    uploaded_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for academy_study_materials
ALTER TABLE public.academy_study_materials ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
DROP POLICY IF EXISTS "Tenant Isolation Study Materials Select" ON public.academy_study_materials;
CREATE POLICY "Tenant Isolation Study Materials Select" ON public.academy_study_materials
    FOR SELECT USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Study Materials Insert" ON public.academy_study_materials;
CREATE POLICY "Tenant Isolation Study Materials Insert" ON public.academy_study_materials
    FOR INSERT WITH CHECK (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Study Materials Update" ON public.academy_study_materials;
CREATE POLICY "Tenant Isolation Study Materials Update" ON public.academy_study_materials
    FOR UPDATE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Study Materials Delete" ON public.academy_study_materials;
CREATE POLICY "Tenant Isolation Study Materials Delete" ON public.academy_study_materials
    FOR DELETE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

-- Index for fast lookup by organization
CREATE INDEX IF NOT EXISTS idx_academy_materials_org ON public.academy_study_materials(organization_id);
