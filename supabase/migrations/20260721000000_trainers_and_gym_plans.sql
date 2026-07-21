-- Create trainers table
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT NOT NULL DEFAULT 'General Fitness',
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active' | 'Inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create gym_plans table (custom membership tier plans per organization)
CREATE TABLE IF NOT EXISTS public.gym_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_months INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;

-- RLS Security Policies for trainers
CREATE POLICY "Admins can manage trainers for their organization" ON public.trainers
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

CREATE POLICY "Allow public/members to read trainers" ON public.trainers
    FOR SELECT TO public USING (true);


-- RLS Security Policies for gym_plans
CREATE POLICY "Admins can manage gym_plans for their organization" ON public.gym_plans
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

CREATE POLICY "Allow public/members to read gym_plans" ON public.gym_plans
    FOR SELECT TO public USING (true);
