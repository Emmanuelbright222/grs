-- Fix 1: Create a secure public view for profiles that excludes sensitive data
DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  artist_name,
  bio,
  avatar_url,
  genre,
  created_at
FROM public.profiles;

-- Fix 2: Create separate table for public/unauthenticated demo submissions
CREATE TABLE IF NOT EXISTS public.public_demo_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  artist_name text,
  genre text,
  message text,
  file_url text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on public submissions
ALTER TABLE public.public_demo_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all public submissions" ON public.public_demo_submissions;
DROP POLICY IF EXISTS "Anyone can submit public demos" ON public.public_demo_submissions;

-- Only admins can view public submissions
CREATE POLICY "Admins can view all public submissions"
ON public.public_demo_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (rate limiting handled at application level)
CREATE POLICY "Anyone can submit public demos"
ON public.public_demo_submissions
FOR INSERT
WITH CHECK (true);

-- Migrate any NULL user_id records from demo_uploads to public_demo_submissions
INSERT INTO public.public_demo_submissions (name, email, artist_name, genre, message, file_url, status, created_at)
SELECT name, email, artist_name, genre, message, file_url, status, created_at
FROM public.demo_uploads
WHERE user_id IS NULL
ON CONFLICT DO NOTHING;

-- Delete migrated records
DELETE FROM public.demo_uploads WHERE user_id IS NULL;

-- Make user_id NOT NULL in demo_uploads
ALTER TABLE public.demo_uploads ALTER COLUMN user_id SET NOT NULL;