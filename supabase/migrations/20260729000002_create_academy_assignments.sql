-- =============================================================================
-- ACADEMY ASSIGNMENTS & HOMEWORK TABLE MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    submissions_count INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 30,
    status TEXT DEFAULT 'active',
    author TEXT DEFAULT 'Teacher',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for academy_assignments
ALTER TABLE public.academy_assignments ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
DROP POLICY IF EXISTS "Tenant Isolation Academic Assignments Select" ON public.academy_assignments;
CREATE POLICY "Tenant Isolation Academic Assignments Select" ON public.academy_assignments
    FOR SELECT USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academic Assignments Insert" ON public.academy_assignments;
CREATE POLICY "Tenant Isolation Academic Assignments Insert" ON public.academy_assignments
    FOR INSERT WITH CHECK (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academic Assignments Update" ON public.academy_assignments;
CREATE POLICY "Tenant Isolation Academic Assignments Update" ON public.academy_assignments
    FOR UPDATE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academic Assignments Delete" ON public.academy_assignments;
CREATE POLICY "Tenant Isolation Academic Assignments Delete" ON public.academy_assignments
    FOR DELETE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

-- Index for fast lookup by organization
CREATE INDEX IF NOT EXISTS idx_academy_assignments_org ON public.academy_assignments(organization_id);
