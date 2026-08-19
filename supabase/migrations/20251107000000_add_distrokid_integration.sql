-- Add DistroKid distribution tracking to releases table
ALTER TABLE public.releases
ADD COLUMN IF NOT EXISTS distrokid_release_id TEXT,
ADD COLUMN IF NOT EXISTS distrokid_status TEXT DEFAULT 'not_distributed', -- 'not_distributed', 'pending', 'processing', 'live', 'rejected'
ADD COLUMN IF NOT EXISTS distrokid_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS distrokid_live_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS distrokid_dashboard_url TEXT;

-- Add check constraint for distrokid_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'releases_distrokid_status_check'
  ) THEN
    ALTER TABLE public.releases
    ADD CONSTRAINT releases_distrokid_status_check 
    CHECK (distrokid_status IN ('not_distributed', 'pending', 'processing', 'live', 'rejected'));
  END IF;
END $$;

-- Create table to store DistroKid account connection (for future API integration)
CREATE TABLE IF NOT EXISTS public.distrokid_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_email TEXT NOT NULL,
  account_name TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- Store any relevant info like subscription tier, etc.
  UNIQUE(user_id) -- Only one DistroKid account per admin
);

-- Enable RLS
ALTER TABLE public.distrokid_account ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distrokid_account
CREATE POLICY "Admins can view DistroKid account"
ON public.distrokid_account FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage DistroKid account"
ON public.distrokid_account FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS releases_distrokid_status_idx 
ON public.releases(distrokid_status);

CREATE INDEX IF NOT EXISTS releases_distrokid_release_id_idx 
ON public.releases(distrokid_release_id);

-- Add comment for documentation
COMMENT ON COLUMN public.releases.distrokid_status IS 'Distribution status: not_distributed, pending, processing, live, rejected';
COMMENT ON COLUMN public.releases.distrokid_release_id IS 'DistroKid release ID or submission reference';
COMMENT ON COLUMN public.releases.distrokid_dashboard_url IS 'Direct link to release in DistroKid dashboard';

