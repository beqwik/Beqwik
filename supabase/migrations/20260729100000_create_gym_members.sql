-- =====================================================
-- CREATE gym_members TABLE
-- Dedicated table for gym org users, separate from
-- the generic `members` table used by Academy/Hostel.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gym_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    role        TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('member', 'trainer')),
    active      BOOLEAN NOT NULL DEFAULT true,
    join_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (organization_id, email)
);

-- Index for fast org-scoped queries
CREATE INDEX IF NOT EXISTS idx_gym_members_org ON public.gym_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_email ON public.gym_members(email);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on their own org's gym members
DROP POLICY IF EXISTS "Org admins manage gym_members" ON public.gym_members;
CREATE POLICY "Org admins manage gym_members" ON public.gym_members
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_users
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_users
            WHERE user_id = auth.uid()
        )
    );

-- Allow service-role full access (edge functions use service role)
DROP POLICY IF EXISTS "Service role full access gym_members" ON public.gym_members;
CREATE POLICY "Service role full access gym_members" ON public.gym_members
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon/public read for member self-lookup (login flow)
DROP POLICY IF EXISTS "Allow public read gym_members" ON public.gym_members;
CREATE POLICY "Allow public read gym_members" ON public.gym_members
    FOR SELECT TO public
    USING (true);

-- =====================================================
-- DROP FK CONSTRAINTS ON member_id
-- This allows member_id to reference either members.id
-- (non-gym orgs) or gym_members.id (gym orgs).
-- =====================================================
ALTER TABLE public.member_credentials
    DROP CONSTRAINT IF EXISTS member_credentials_member_id_fkey;

ALTER TABLE public.gym_slot_bookings
    DROP CONSTRAINT IF EXISTS gym_slot_bookings_member_id_fkey;

ALTER TABLE public.trainer_sessions
    DROP CONSTRAINT IF EXISTS trainer_sessions_member_id_fkey;

ALTER TABLE public.payments
    DROP CONSTRAINT IF EXISTS payments_member_id_fkey;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_gym_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gym_members_updated_at ON public.gym_members;
CREATE TRIGGER trg_gym_members_updated_at
    BEFORE UPDATE ON public.gym_members
    FOR EACH ROW EXECUTE FUNCTION public.set_gym_members_updated_at();
