-- Add is_featured field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for faster queries on featured artists
CREATE INDEX IF NOT EXISTS profiles_is_featured_idx ON public.profiles(is_featured) WHERE is_featured = true;

