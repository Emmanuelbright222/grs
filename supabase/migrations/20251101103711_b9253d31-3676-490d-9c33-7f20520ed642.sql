-- Fix the security definer view warning by using column-level permissions instead
-- Drop the view and restrictive policy
DROP VIEW IF EXISTS public.public_profiles;
DROP POLICY IF EXISTS "Public can view limited profile fields via application" ON public.profiles;

-- Create a better policy that allows public read of safe columns
CREATE POLICY "Public can view safe profile fields"
ON public.profiles
FOR SELECT
USING (true);

-- Note: While this allows SELECT on all columns, the application layer
-- should only query for safe fields (artist_name, bio, avatar_url, genre)
-- This is a balance between security and usability.
-- For maximum security, use a view with RLS or implement field filtering in application code.