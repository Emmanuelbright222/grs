-- Add policy for admins to update demo status
CREATE POLICY "Admins can update demo status"
ON public.demo_uploads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

