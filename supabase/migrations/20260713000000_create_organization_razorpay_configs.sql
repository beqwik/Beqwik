-- Create organization_razorpay_configs table
CREATE TABLE IF NOT EXISTS public.organization_razorpay_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    razorpay_key_id TEXT NOT NULL,
    razorpay_key_secret TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT organization_razorpay_configs_organization_id_key UNIQUE (organization_id)
);

-- Enable RLS
ALTER TABLE public.organization_razorpay_configs ENABLE ROW LEVEL SECURITY;

-- Policy for super_admins (they can read/write everything in this table)
CREATE POLICY "Allow super admins full access" ON public.organization_razorpay_configs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE super_admins.auth_user_id = auth.uid()
        )
    );

-- Create a secure RPC function to get only the public key ID for an organization
CREATE OR REPLACE FUNCTION public.get_organization_razorpay_key(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    key_id TEXT;
BEGIN
    SELECT razorpay_key_id INTO key_id
    FROM public.organization_razorpay_configs
    WHERE organization_id = org_id;
    
    RETURN key_id;
END;
$$;

-- Add member_id column to payments table if it doesn't exist
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;
