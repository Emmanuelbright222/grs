-- Create storage buckets for events and releases images

-- Create events bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create releases bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('releases', 'releases', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist for events
DROP POLICY IF EXISTS "Admins can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete event images" ON storage.objects;

-- Drop existing policies if they exist for releases
DROP POLICY IF EXISTS "Admins can upload release images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view release images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete release images" ON storage.objects;

-- Events storage policies
CREATE POLICY "Admins can upload event images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can view event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Admins can delete event images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Releases storage policies
CREATE POLICY "Admins can upload release images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'releases' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can view release images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'releases');

CREATE POLICY "Admins can delete release images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'releases' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

