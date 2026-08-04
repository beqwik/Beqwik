-- =========================================================================================
-- MIGRATION SCRIPT: Create academy_results table
-- =========================================================================================

-- Create the academy_results table
CREATE TABLE IF NOT EXISTS public.academy_results (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  organization_id uuid NOT NULL,
  student_email text NULL,
  student_name text NOT NULL,
  exam_title text NOT NULL,
  score numeric NOT NULL,
  total_marks numeric NOT NULL,
  grade text NULL,
  status text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT academy_results_pkey PRIMARY KEY (id),
  CONSTRAINT academy_results_org_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.academy_results ENABLE ROW LEVEL SECURITY;

-- Create policies allowing anon users to read results (similar to attendance)
CREATE POLICY "Enable read access for anon users on academy_results"
ON public.academy_results
FOR SELECT
TO anon
USING (true);

-- Allow authenticated access
CREATE POLICY "Enable read access for authenticated users on academy_results"
ON public.academy_results
FOR SELECT
TO authenticated
USING (true);

-- Allow anon to insert results
CREATE POLICY "Enable insert for anon users on academy_results"
ON public.academy_results
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated to insert results
CREATE POLICY "Enable insert for authenticated users on academy_results"
ON public.academy_results
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow update
CREATE POLICY "Enable update for anon users on academy_results"
ON public.academy_results
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow delete
CREATE POLICY "Enable delete for anon users on academy_results"
ON public.academy_results
FOR DELETE
TO anon
USING (true);
