-- COMPLETE FIX: Profile creation via database function + trigger
-- This ensures profiles are created even if RLS blocks client inserts

-- Step 1: Create a function that can create/update profiles (bypasses RLS)
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
SECURITY DEFINER  -- Runs with elevated privileges, bypasses RLS
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
BEGIN
  -- Check for duplicate email (if not updating same user)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = p_email AND user_id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Email already exists. Please use a different email.';
  END IF;
  
  -- Check for duplicate artist name (if not updating same user)
  IF p_artist_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE artist_name = p_artist_name AND user_id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Artist name already exists. Please choose a different name.';
  END IF;
  
  -- Check for duplicate phone number (if provided and not updating same user)
  IF p_phone_number IS NOT NULL AND p_phone_number != '' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone_number = p_phone_number AND user_id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Phone number already in use. Please use a different number.';
  END IF;
  
  -- Insert or update profile (is_approved defaults to false for new signups)
  INSERT INTO public.profiles (user_id, full_name, artist_name, email, genre, phone_number, is_approved)
  VALUES (p_user_id, p_full_name, p_artist_name, p_email, p_genre, p_phone_number, false)
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

-- Update function grants
DROP FUNCTION IF EXISTS public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT);
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- Step 2: Ensure trigger creates basic profile
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create basic profile immediately
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Step 3: Fix INSERT policy to allow client inserts (backup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 4: Fix UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;

