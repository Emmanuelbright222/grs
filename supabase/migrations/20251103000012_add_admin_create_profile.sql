-- Allow admins to create and manage profiles (for manually added artists)
-- This fixes the RLS error when admins try to create artists

-- Step 1: Create a function for admins to create profiles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  p_full_name TEXT,
  p_artist_name TEXT,
  p_email TEXT,
  p_phone_number TEXT DEFAULT NULL,
  p_genre TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT false,
  p_is_approved BOOLEAN DEFAULT false,
  p_avatar_url TEXT DEFAULT NULL,
  p_artist_image_url TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges, bypasses RLS
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can create profiles';
  END IF;

  -- Check for duplicate email
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = p_email AND email IS NOT NULL AND email != ''
  ) THEN
    RAISE EXCEPTION 'Email already exists. Please use a different email.';
  END IF;
  
  -- Check for duplicate artist name
  IF p_artist_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE artist_name = p_artist_name AND artist_name IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Artist name already exists. Please choose a different name.';
  END IF;
  
  -- Check for duplicate phone number (if provided)
  IF p_phone_number IS NOT NULL AND p_phone_number != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone_number = p_phone_number AND phone_number IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Phone number already in use. Please use a different number.';
  END IF;
  
  -- Insert profile (user_id can be NULL for manually added artists)
  INSERT INTO public.profiles (
    user_id,
    full_name,
    artist_name,
    email,
    phone_number,
    genre,
    bio,
    is_featured,
    is_approved,
    avatar_url,
    artist_image_url
  )
  VALUES (
    NULL,  -- NULL user_id for manually added artists
    p_full_name,
    p_artist_name,
    p_email,
    p_phone_number,
    p_genre,
    p_bio,
    p_is_featured,
    p_is_approved,
    p_avatar_url,
    p_artist_image_url
  )
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.admin_create_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT) TO authenticated;

-- Step 2: Add RLS policy to allow admins to insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 3: Ensure admins can update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 4: Make user_id nullable (if not already)
-- This allows manually added artists without auth users
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

