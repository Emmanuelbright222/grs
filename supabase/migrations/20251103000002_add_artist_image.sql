-- Add artist_image_url field to profiles table
-- This is separate from avatar_url - avatar is profile picture, artist_image is for display on artist pages

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS artist_image_url TEXT;

