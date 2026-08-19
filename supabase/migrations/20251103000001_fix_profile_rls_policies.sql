-- Fix RLS policies for profiles table
-- Allow users to insert their own profile during signup
-- Allow admins to view all profiles

-- Ensure insert policy exists and allows signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure update policy allows users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR  -- Users can view their own
  public.has_role(auth.uid(), 'admin'::app_role)  -- Admins can view all
);

-- Allow public to view safe profile fields (for public artist pages)
DROP POLICY IF EXISTS "Public can view safe profile fields" ON public.profiles;
CREATE POLICY "Public can view safe profile fields"
ON public.profiles
FOR SELECT
USING (true);  -- Public can view, but application should filter sensitive fields

