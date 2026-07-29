-- =============================================================================
-- ACADEMY RESULTS & SCORECARDS TABLE MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_marks NUMERIC NOT NULL DEFAULT 100,
    percentage NUMERIC NOT NULL,
    grade TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Passed',
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for academy_results
ALTER TABLE public.academy_results ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
DROP POLICY IF EXISTS "Tenant Isolation Results Select" ON public.academy_results;
CREATE POLICY "Tenant Isolation Results Select" ON public.academy_results
    FOR SELECT USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Results Insert" ON public.academy_results;
CREATE POLICY "Tenant Isolation Results Insert" ON public.academy_results
    FOR INSERT WITH CHECK (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Results Update" ON public.academy_results;
CREATE POLICY "Tenant Isolation Results Update" ON public.academy_results
    FOR UPDATE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Results Delete" ON public.academy_results;
CREATE POLICY "Tenant Isolation Results Delete" ON public.academy_results
    FOR DELETE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

-- Index for fast lookup by organization
CREATE INDEX IF NOT EXISTS idx_academy_results_org ON public.academy_results(organization_id);
