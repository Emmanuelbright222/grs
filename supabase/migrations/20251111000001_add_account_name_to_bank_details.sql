-- Add account_name column to bank_details table if it doesn't exist
-- This migration handles the case where the table was created before account_name was added

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bank_details' AND column_name = 'account_name'
  ) THEN
    -- Add column as nullable first
    ALTER TABLE public.bank_details 
    ADD COLUMN account_name TEXT;
    
    -- Update existing rows with empty string
    UPDATE public.bank_details 
    SET account_name = '' 
    WHERE account_name IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE public.bank_details 
    ALTER COLUMN account_name SET NOT NULL;
  END IF;
END $$;

