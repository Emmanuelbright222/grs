-- Create separate bucket for audio demos
-- This bucket will be used for demo submissions from both artists and collaboration form

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-demos',
  'audio-demos',
  true, -- Public bucket for easy access
  52428800, -- 50MB file size limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload audio demos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-demos');

-- Create storage policy: Allow anonymous users to upload (for collaboration form)
CREATE POLICY "Allow anonymous users to upload audio demos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'audio-demos');

-- Create storage policy: Allow public read access
CREATE POLICY "Allow public read access to audio demos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-demos');

-- Create storage policy: Allow users to update their own files
CREATE POLICY "Allow users to update their own audio demos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-demos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete their own audio demos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-demos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to manage all files
CREATE POLICY "Allow admins to manage all audio demos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'audio-demos' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

