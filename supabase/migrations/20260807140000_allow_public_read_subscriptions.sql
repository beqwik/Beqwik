-- =====================================================
-- ALLOW PUBLIC READ ON subscriptions TABLE
-- Required for member portal custom authentication (localStorage auth)
-- =====================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read subscriptions" ON public.subscriptions;

CREATE POLICY "Allow public read subscriptions" ON public.subscriptions
    FOR SELECT TO public
    USING (true);
