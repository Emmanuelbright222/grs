-- Fix 1: Create a secure public view for profiles that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  artist_name,
  bio,
  avatar_url,
  genre,
  created_at
FROM public.profiles;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view artist profiles (limited fields)" ON public.profiles;

-- Create new restricted policy for public access
CREATE POLICY "Public can view limited profile fields via application" 
ON public.profiles 
FOR SELECT 
USING (false);  -- Block direct table access, force use of application logic

-- Keep the full access policy for users viewing their own profile
-- (already exists: "Users can view full own profile")

-- Fix 2: Make user_id NOT NULL in demo_uploads for authenticated submissions
-- First, we need to handle any existing NULL user_id records
-- We'll create a separate table for public/unauthenticated demo submissions

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

-- Only admins can view public submissions
CREATE POLICY "Admins can view all public submissions"
ON public.public_demo_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (rate limiting handled at edge function level)
CREATE POLICY "Anyone can submit public demos"
ON public.public_demo_submissions
FOR INSERT
WITH CHECK (true);

-- Now make user_id required in demo_uploads (for authenticated artist uploads)
-- First migrate any NULL user_id records to public_demo_submissions
INSERT INTO public.public_demo_submissions (name, email, artist_name, genre, message, file_url, status, created_at)
SELECT name, email, artist_name, genre, message, file_url, status, created_at
FROM public.demo_uploads
WHERE user_id IS NULL;

-- Delete migrated records
DELETE FROM public.demo_uploads WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.demo_uploads ALTER COLUMN user_id SET NOT NULL;

-- Fix 3: Add updated_at trigger to public_demo_submissions
CREATE TRIGGER update_public_demo_submissions_updated_at
BEFORE UPDATE ON public.public_demo_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();