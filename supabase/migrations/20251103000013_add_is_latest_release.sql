-- Add is_latest_release field to releases table
ALTER TABLE public.releases
ADD COLUMN IF NOT EXISTS is_latest_release BOOLEAN DEFAULT false;

-- Create index for faster queries on latest releases
CREATE INDEX IF NOT EXISTS releases_is_latest_release_idx ON public.releases(is_latest_release) WHERE is_latest_release = true;

