-- Add phone number field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create unique index for phone number (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_number_unique 
ON public.profiles(phone_number) 
WHERE phone_number IS NOT NULL AND phone_number != '';

