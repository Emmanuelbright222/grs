-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Update create_or_update_profile function to include gender
CREATE OR REPLACE FUNCTION public.create_or_update_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_artist_name TEXT,
  p_email TEXT,
  p_genre TEXT,
  p_phone_number TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
  v_user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users FIRST
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User account not found. Please ensure you are logged in.';
  END IF;
  
  -- Check for duplicate email (case-insensitive, trim whitespace)
  -- This prevents creating duplicate profiles when email already exists
  IF p_email IS NOT NULL AND p_email != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email)) 
      AND (user_id != p_user_id OR user_id IS NULL) 
      AND email IS NOT NULL 
      AND email != ''
  ) THEN
    RAISE EXCEPTION 'Email already exists. Please use a different email.';
  END IF;
  
  -- Check for duplicate artist name (if not updating same user)
  IF p_artist_name IS NOT NULL AND p_artist_name != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(TRIM(artist_name)) = LOWER(TRIM(p_artist_name)) 
      AND (user_id != p_user_id OR user_id IS NULL) 
      AND artist_name IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Artist name already exists. Please choose a different name.';
  END IF;
  
  -- Check for duplicate phone number (if provided and not updating same user)
  IF p_phone_number IS NOT NULL AND p_phone_number != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE TRIM(phone_number) = TRIM(p_phone_number) 
      AND (user_id != p_user_id OR user_id IS NULL) 
      AND phone_number IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Phone number already in use. Please use a different number.';
  END IF;
  
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, full_name, artist_name, email, genre, phone_number, gender)
  VALUES (p_user_id, p_full_name, p_artist_name, p_email, p_genre, p_phone_number, p_gender)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    artist_name = EXCLUDED.artist_name,
    email = EXCLUDED.email,
    genre = EXCLUDED.genre,
    phone_number = EXCLUDED.phone_number,
    gender = EXCLUDED.gender,
    updated_at = now()
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

-- Update admin_create_profile function to include gender
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  p_full_name TEXT,
  p_artist_name TEXT,
  p_email TEXT,
  p_phone_number TEXT DEFAULT NULL,
  p_genre TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT false,
  p_is_approved BOOLEAN DEFAULT false,
  p_avatar_url TEXT DEFAULT NULL,
  p_artist_image_url TEXT DEFAULT NULL,
  p_spotify_url TEXT DEFAULT NULL,
  p_apple_music_url TEXT DEFAULT NULL,
  p_youtube_music_url TEXT DEFAULT NULL,
  p_audiomack_url TEXT DEFAULT NULL,
  p_boomplay_url TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
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
    gender,
    is_featured,
    is_approved,
    avatar_url,
    artist_image_url,
    spotify_url,
    apple_music_url,
    youtube_music_url,
    audiomack_url,
    boomplay_url
  )
  VALUES (
    NULL,
    p_full_name,
    p_artist_name,
    p_email,
    p_phone_number,
    p_genre,
    p_bio,
    p_gender,
    p_is_featured,
    p_is_approved,
    p_avatar_url,
    p_artist_image_url,
    p_spotify_url,
    p_apple_music_url,
    p_youtube_music_url,
    p_audiomack_url,
    p_boomplay_url
  )
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Grant execute permissions on create_or_update_profile function
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

