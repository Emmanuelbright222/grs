-- Create storage bucket for news images

-- Create the 'news' bucket if it doesn't exist (or use existing 'events' bucket)
-- For now, we'll reuse the events bucket, but you can create a separate news bucket

-- If you want a separate news bucket, uncomment the following:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('news', 'news', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for 'news' bucket if they exist
DROP POLICY IF EXISTS "Admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete news images" ON storage.objects;

-- Allow authenticated users to upload news images (admins)
CREATE POLICY "Admins can upload news images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'news' AND
  public.has_role(auth.uid(), 'admin'::app_role) AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to news images
CREATE POLICY "Public can view news images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'news');

-- Allow admins to update their own news images
CREATE POLICY "Admins can update news images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'news' AND
  public.has_role(auth.uid(), 'admin'::app_role) AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to delete their own news images
CREATE POLICY "Admins can delete news images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'news' AND
  public.has_role(auth.uid(), 'admin'::app_role) AND
  (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Note: For now, news images will use the 'events' bucket created in migration 20251103000009_create_event_release_storage.sql
-- If you prefer a separate bucket, uncomment the code above

