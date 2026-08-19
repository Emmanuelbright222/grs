-- Add policy to allow admins to delete demo submissions

-- Allow admins to delete from demo_uploads
DROP POLICY IF EXISTS "Admins can delete demo uploads" ON public.demo_uploads;
CREATE POLICY "Admins can delete demo uploads"
ON public.demo_uploads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete from public_demo_submissions
DROP POLICY IF EXISTS "Admins can delete public demo submissions" ON public.public_demo_submissions;
CREATE POLICY "Admins can delete public demo submissions"
ON public.public_demo_submissions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

