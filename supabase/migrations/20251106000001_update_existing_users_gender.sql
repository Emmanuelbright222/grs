-- Optional: Update gender for existing users
-- This script provides options for updating gender for existing profiles

-- Option 1: Set a default gender for all users who don't have one set
-- Uncomment ONE of the lines below and change the gender value to your desired default
-- UPDATE public.profiles SET gender = 'Male' WHERE gender IS NULL OR gender = '';
-- UPDATE public.profiles SET gender = 'Female' WHERE gender IS NULL OR gender = '';
-- UPDATE public.profiles SET gender = 'Other' WHERE gender IS NULL OR gender = '';

-- Option 2: Leave all existing users' gender as NULL so they can set it themselves
-- No action needed - users can update their gender through their profile page

-- Note: The gender column allows NULL values, so existing users can continue using the app
-- and update their gender through:
-- 1. Artist Profile Page: /profile (for artists)
-- 2. Admin Artists Page: /admin/artists (for admins to update any artist)

-- To check which users don't have gender set:
SELECT user_id, full_name, artist_name, email, gender 
FROM public.profiles 
WHERE gender IS NULL OR gender = '';

-- To update individual users manually through SQL:
-- First, run the SELECT query above to find the user_id you want to update
-- Then replace '00000000-0000-0000-0000-000000000000' with the actual user_id UUID
-- Example:
-- UPDATE public.profiles SET gender = 'Male' WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;
-- UPDATE public.profiles SET gender = 'Female' WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;
-- UPDATE public.profiles SET gender = 'Other' WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- To update gender by email (replace 'example@email.com' with actual email):
-- UPDATE public.profiles SET gender = 'Male' WHERE email = 'example@email.com';
-- UPDATE public.profiles SET gender = 'Female' WHERE email = 'example@email.com';
-- UPDATE public.profiles SET gender = 'Other' WHERE email = 'example@email.com';

-- To update gender by artist name (replace 'Artist Name' with actual artist name):
-- UPDATE public.profiles SET gender = 'Male' WHERE artist_name = 'Artist Name';
-- UPDATE public.profiles SET gender = 'Female' WHERE artist_name = 'Artist Name';
-- UPDATE public.profiles SET gender = 'Other' WHERE artist_name = 'Artist Name';

