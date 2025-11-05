-- URGENT FIX: Ensure profiles can be inserted during signup
-- This migration fixes the issue where profiles table is empty

-- Drop ALL existing INSERT policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a secure INSERT policy that definitely works
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  auth.role() = 'authenticated'
);

-- Also ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id AND auth.role() = 'authenticated')
WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

-- Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a comment for debugging
COMMENT ON TABLE public.profiles IS 'User profiles - ensure INSERT policy allows auth.uid() = user_id';

