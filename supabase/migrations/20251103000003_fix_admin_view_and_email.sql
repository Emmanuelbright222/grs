-- Fix admin view of profiles and add email notification on artist signup

-- Drop ALL conflicting SELECT policies (including the one we're creating)
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view safe profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Public can view artist profiles (limited fields)" ON public.profiles;
DROP POLICY IF EXISTS "Public can view limited profile fields via application" ON public.profiles;
DROP POLICY IF EXISTS "Users can view full own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create unified SELECT policy that allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
-- 3. Public to view profiles (for public artist pages)
CREATE POLICY "Users and admins can view profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR  -- Users can view their own
  public.has_role(auth.uid(), 'admin'::app_role) OR  -- Admins can view all
  true  -- Public can view (for artist pages)
);

-- Note: Email notifications are handled by the edge function notify-new-artist
-- which is called from the client after successful profile creation

