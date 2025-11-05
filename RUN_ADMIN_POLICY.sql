-- Run this SQL in Supabase Dashboard → SQL Editor

-- Step 1: Run the admin update policy
CREATE POLICY "Admins can update demo status"
ON public.demo_uploads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 2: Verify the policy was created
SELECT * FROM pg_policies 
WHERE tablename = 'demo_uploads' 
AND policyname = 'Admins can update demo status';

