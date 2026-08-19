-- Fix storage policies to allow anonymous uploads for collaboration form
-- This allows unauthenticated users to upload demo files

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload demos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own demos" ON storage.objects;

-- Allow anyone to upload to demos bucket (for collaboration form)
CREATE POLICY "Anyone can upload demos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'demos');

-- Allow public read access to demo files
CREATE POLICY "Anyone can view demo files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'demos');

-- Make sure the bucket exists and is public
UPDATE storage.buckets
SET public = true
WHERE id = 'demos';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('demos', 'demos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

