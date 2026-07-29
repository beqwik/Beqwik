-- =====================================================
-- Migration: Create trainer_sessions table
-- Purpose: Store trainer schedule sessions & bookings for Gym SaaS
-- Isolation: Row Level Security (RLS) ensures each gym only
--            manages its own trainer sessions.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trainer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.gym_trainers(id) ON DELETE SET NULL,
    trainer_name TEXT NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    session_name TEXT NOT NULL, -- e.g. "Chest and Bicep", "CrossFit (Level 1)"
    session_type TEXT NOT NULL DEFAULT 'Personal Training'
        CHECK (session_type IN ('Personal Training', 'Group Class', 'CrossFit', 'Yoga', 'HIIT')),
    status TEXT NOT NULL DEFAULT 'Upcoming'
        CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL, -- e.g. '05:00:00'
    end_time TIME NOT NULL,   -- e.g. '06:00:00'
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_trainer_sessions_org ON public.trainer_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainer_sessions_date ON public.trainer_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_trainer_sessions_trainer ON public.trainer_sessions(trainer_id);

-- Enable RLS
ALTER TABLE public.trainer_sessions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Gym Admins can manage sessions for their organization
DROP POLICY IF EXISTS "Admins can manage trainer_sessions for their organization" ON public.trainer_sessions;
CREATE POLICY "Admins can manage trainer_sessions for their organization" ON public.trainer_sessions
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
        )
    );

-- Policy 2: Allow members/public to read trainer sessions
DROP POLICY IF EXISTS "Allow members to read trainer_sessions" ON public.trainer_sessions;
CREATE POLICY "Allow members to read trainer_sessions" ON public.trainer_sessions
    FOR SELECT TO public USING (true);
