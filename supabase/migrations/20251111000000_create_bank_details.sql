-- Create table to store artist bank details
CREATE TABLE IF NOT EXISTS public.bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id) -- One bank detail per user
);

-- Enable RLS
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- Users can view their own bank details
CREATE POLICY "Users can view their own bank details"
  ON public.bank_details FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bank details
CREATE POLICY "Users can insert their own bank details"
  ON public.bank_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bank details
CREATE POLICY "Users can update their own bank details"
  ON public.bank_details FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all bank details
CREATE POLICY "Admins can view all bank details"
  ON public.bank_details FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS bank_details_user_id_idx ON public.bank_details(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_bank_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on bank_details updates
CREATE TRIGGER update_bank_details_updated_at
  BEFORE UPDATE ON public.bank_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bank_details_updated_at();

COMMENT ON TABLE public.bank_details IS 'Stores bank account details for artists to receive payments';

