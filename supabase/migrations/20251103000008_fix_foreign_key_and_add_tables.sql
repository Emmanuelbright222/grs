-- Fix foreign key constraint issue and add events table
-- Also add unique constraints for email, artist_name, phone_number

-- Add unique constraints to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON public.profiles(email) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_artist_name_unique 
ON public.profiles(artist_name) 
WHERE artist_name IS NOT NULL AND artist_name != '';

-- Update function to handle case where auth user might not exist yet
CREATE OR REPLACE FUNCTION public.create_or_update_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_artist_name TEXT,
  p_email TEXT,
  p_genre TEXT,
  p_phone_number TEXT DEFAULT NULL
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
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User account not found. Please ensure you are logged in.';
  END IF;
  
  -- Check for duplicate email (if not updating same user)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = p_email AND user_id != p_user_id AND email IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Email already exists. Please use a different email.';
  END IF;
  
  -- Check for duplicate artist name (if not updating same user)
  IF p_artist_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE artist_name = p_artist_name AND user_id != p_user_id AND artist_name IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Artist name already exists. Please choose a different name.';
  END IF;
  
  -- Check for duplicate phone number (if provided and not updating same user)
  IF p_phone_number IS NOT NULL AND p_phone_number != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone_number = p_phone_number AND user_id != p_user_id AND phone_number IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Phone number already in use. Please use a different number.';
  END IF;
  
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, full_name, artist_name, email, genre, phone_number)
  VALUES (p_user_id, p_full_name, p_artist_name, p_email, p_genre, p_phone_number)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    artist_name = EXCLUDED.artist_name,
    email = EXCLUDED.email,
    genre = EXCLUDED.genre,
    phone_number = EXCLUDED.phone_number,
    updated_at = now()
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

-- Create events table for admin to manage events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT NOT NULL,
  venue TEXT,
  description TEXT,
  image_url TEXT,
  ticket_url TEXT,
  is_past_event BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own events"
  ON public.events FOR ALL
  USING (auth.uid() = user_id);

-- Update releases table to add release_type field if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'releases' AND column_name = 'release_type'
  ) THEN
    ALTER TABLE public.releases ADD COLUMN release_type TEXT;
    -- Add check constraint for release_type
    ALTER TABLE public.releases ADD CONSTRAINT releases_release_type_check 
      CHECK (release_type IS NULL OR release_type IN ('Album', 'EP', 'Compilation', 'Single'));
  END IF;
END $$;

-- Add streaming_url field for releases (single URL instead of multiple platform URLs)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'releases' AND column_name = 'streaming_url'
  ) THEN
    ALTER TABLE public.releases ADD COLUMN streaming_url TEXT;
  END IF;
END $$;

