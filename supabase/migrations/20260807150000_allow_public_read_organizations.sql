-- =====================================================
-- ALLOW PUBLIC READ ON organizations TABLE
-- Required for member registration to verify organization code
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read organizations" ON public.organizations;

CREATE POLICY "Allow public read organizations" ON public.organizations
    FOR SELECT TO public
    USING (true);
