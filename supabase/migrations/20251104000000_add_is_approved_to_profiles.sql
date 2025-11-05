-- Add is_approved field to profiles table for admin approval
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Make user_id nullable (for manually created artists without accounts)
ALTER TABLE public.profiles
ALTER COLUMN user_id DROP NOT NULL;

-- Create index for faster queries on approved artists
CREATE INDEX IF NOT EXISTS profiles_is_approved_idx ON public.profiles(is_approved) WHERE is_approved = true;

-- Update RLS policy to allow admins to approve/reject
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

