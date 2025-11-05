-- Update admin_create_profile function to include streaming platform URLs
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

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.admin_create_profile(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, 
  TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

