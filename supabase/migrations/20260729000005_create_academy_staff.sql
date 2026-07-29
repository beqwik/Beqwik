-- =============================================================================
-- ACADEMY STAFF & TEACHERS TABLE MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    staff_code TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    designation TEXT DEFAULT 'Teacher',
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for academy_staff
ALTER TABLE public.academy_staff ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
DROP POLICY IF EXISTS "Tenant Isolation Academy Staff Select" ON public.academy_staff;
CREATE POLICY "Tenant Isolation Academy Staff Select" ON public.academy_staff
    FOR SELECT USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academy Staff Insert" ON public.academy_staff;
CREATE POLICY "Tenant Isolation Academy Staff Insert" ON public.academy_staff
    FOR INSERT WITH CHECK (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academy Staff Update" ON public.academy_staff;
CREATE POLICY "Tenant Isolation Academy Staff Update" ON public.academy_staff
    FOR UPDATE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

DROP POLICY IF EXISTS "Tenant Isolation Academy Staff Delete" ON public.academy_staff;
CREATE POLICY "Tenant Isolation Academy Staff Delete" ON public.academy_staff
    FOR DELETE USING (organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_academy_staff_org ON public.academy_staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_academy_staff_email ON public.academy_staff(email);
