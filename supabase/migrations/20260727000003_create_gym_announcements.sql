-- =====================================================
-- Migration: Create gym_announcements table
-- Purpose: Store gym-specific alerts & announcements
-- Isolation: Row Level Security ensures each gym only
--            sees its own organization's announcements
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gym_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    author TEXT NOT NULL DEFAULT 'Gym Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast queries filtered by organization
CREATE INDEX IF NOT EXISTS idx_gym_announcements_org 
    ON public.gym_announcements(organization_id);

CREATE INDEX IF NOT EXISTS idx_gym_announcements_created 
    ON public.gym_announcements(created_at DESC);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.gym_announcements ENABLE ROW LEVEL SECURITY;

-- Policy 1: Gym Admins (organization_users) can do full CRUD 
-- only for their own gym's announcements
DROP POLICY IF EXISTS "gym_admin_full_access" ON public.gym_announcements;
CREATE POLICY "gym_admin_full_access" ON public.gym_announcements
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_users 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 2: Gym members (organization_members / member_credentials)
-- can only SELECT announcements from their own gym
DROP POLICY IF EXISTS "gym_member_read_own_org" ON public.gym_announcements;
CREATE POLICY "gym_member_read_own_org" ON public.gym_announcements
    FOR SELECT TO anon, authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE member_id IN (
                SELECT member_id 
                FROM public.member_credentials 
                WHERE email = auth.email() 
                  AND active = true
            )
        )
    );
