-- Create gym_slots table
CREATE TABLE IF NOT EXISTS public.gym_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    trainer_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create gym_slot_bookings table
CREATE TABLE IF NOT EXISTS public.gym_slot_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES public.gym_slots(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT gym_slot_bookings_slot_id_member_id_key UNIQUE (slot_id, member_id)
);

-- Create gym_equipment table
CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Working', -- 'Working' | 'Under Maintenance' | 'Broken'
    last_inspection DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gym_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

-- Establish RLS Security Policies

-- Gym Slots Policies
CREATE POLICY "Admins can manage slots for their organization" ON public.gym_slots
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

CREATE POLICY "Allow public/members to read slots" ON public.gym_slots
    FOR SELECT TO public USING (true);


-- Gym Slot Bookings Policies
CREATE POLICY "Admins can manage bookings of slots belonging to their organization" ON public.gym_slot_bookings
    FOR ALL TO authenticated
    USING (
        slot_id IN (
            SELECT id FROM public.gym_slots WHERE organization_id IN (
                SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Allow public/members to manage slot bookings" ON public.gym_slot_bookings
    FOR ALL TO public USING (true);


-- Gym Equipment Policies
CREATE POLICY "Admins can manage equipment for their organization" ON public.gym_equipment
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

CREATE POLICY "Allow public/members to read equipment" ON public.gym_equipment
    FOR SELECT TO public USING (true);
