-- =============================================================================
-- TENANT ROW LEVEL SECURITY (RLS) & DATA ISOLATION MIGRATION
-- Enforces strict multi-tenant isolation across all database tables so that
-- users (admins, students, teachers, members) from one organization/academy
-- CANNOT access or view data belonging to another organization.
-- =============================================================================

-- 1. Helper function to extract active organization ID from request headers or auth session
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS UUID AS $$
DECLARE
    header_org TEXT;
    user_org UUID;
BEGIN
    -- Try reading custom header x-organization-id if provided
    BEGIN
        header_org := current_setting('request.headers', true)::json->>'x-organization-id';
        IF header_org IS NOT NULL AND header_org != '' THEN
            RETURN header_org::uuid;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Fallback if request.headers setting is not set
    END;

    -- Fallback to auth.uid() in organization_users or members
    IF auth.uid() IS NOT NULL THEN
        BEGIN
            SELECT organization_id INTO user_org FROM public.organization_users WHERE user_id = auth.uid() LIMIT 1;
            IF user_org IS NOT NULL THEN
                RETURN user_org;
            END IF;
        EXCEPTION WHEN OTHERS THEN
        END;

        BEGIN
            SELECT organization_id INTO user_org FROM public.members WHERE id = auth.uid() LIMIT 1;
            IF user_org IS NOT NULL THEN
                RETURN user_org;
            END IF;
        EXCEPTION WHEN OTHERS THEN
        END;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================================
-- 2. ACADEMIC ANNOUNCEMENTS TABLE RLS POLICIES
-- =============================================================================
ALTER TABLE public.academic_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read academic_announcements" ON public.academic_announcements;
DROP POLICY IF EXISTS "Allow insert academic_announcements" ON public.academic_announcements;
DROP POLICY IF EXISTS "Allow update academic_announcements" ON public.academic_announcements;
DROP POLICY IF EXISTS "Allow delete academic_announcements" ON public.academic_announcements;

CREATE POLICY "Tenant Isolation Academic Announcements Select" ON public.academic_announcements
    FOR SELECT USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academic Announcements Insert" ON public.academic_announcements
    FOR INSERT WITH CHECK (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academic Announcements Update" ON public.academic_announcements
    FOR UPDATE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academic Announcements Delete" ON public.academic_announcements
    FOR DELETE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

-- =============================================================================
-- 3. ACADEMY STUDENTS TABLE RLS POLICIES
-- =============================================================================
ALTER TABLE public.academy_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read academy_students" ON public.academy_students;
DROP POLICY IF EXISTS "Allow insert academy_students" ON public.academy_students;
DROP POLICY IF EXISTS "Allow update academy_students" ON public.academy_students;
DROP POLICY IF EXISTS "Allow delete academy_students" ON public.academy_students;

CREATE POLICY "Tenant Isolation Academy Students Select" ON public.academy_students
    FOR SELECT USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academy Students Insert" ON public.academy_students
    FOR INSERT WITH CHECK (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academy Students Update" ON public.academy_students
    FOR UPDATE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Academy Students Delete" ON public.academy_students
    FOR DELETE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

-- =============================================================================
-- 4. CLASS REGISTRATIONS TABLE RLS POLICIES
-- =============================================================================
ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read class_registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Allow insert class_registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Allow update class_registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Allow delete class_registrations" ON public.class_registrations;

CREATE POLICY "Tenant Isolation Class Registrations Select" ON public.class_registrations
    FOR SELECT USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Class Registrations Insert" ON public.class_registrations
    FOR INSERT WITH CHECK (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

CREATE POLICY "Tenant Isolation Class Registrations Delete" ON public.class_registrations
    FOR DELETE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

-- =============================================================================
-- 5. ACADEMY CLASSES TABLE RLS POLICIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.academy_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    class_name TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    timing TEXT NOT NULL,
    room TEXT NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academy_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant Isolation Academy Classes Select" ON public.academy_classes;
CREATE POLICY "Tenant Isolation Academy Classes Select" ON public.academy_classes
    FOR SELECT USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

DROP POLICY IF EXISTS "Tenant Isolation Academy Classes Insert" ON public.academy_classes;
CREATE POLICY "Tenant Isolation Academy Classes Insert" ON public.academy_classes
    FOR INSERT WITH CHECK (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

DROP POLICY IF EXISTS "Tenant Isolation Academy Classes Update" ON public.academy_classes;
CREATE POLICY "Tenant Isolation Academy Classes Update" ON public.academy_classes
    FOR UPDATE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

DROP POLICY IF EXISTS "Tenant Isolation Academy Classes Delete" ON public.academy_classes;
CREATE POLICY "Tenant Isolation Academy Classes Delete" ON public.academy_classes
    FOR DELETE USING (
        organization_id = public.get_current_org_id() OR public.get_current_org_id() IS NULL
    );

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_academy_classes_org ON public.academy_classes(organization_id);
