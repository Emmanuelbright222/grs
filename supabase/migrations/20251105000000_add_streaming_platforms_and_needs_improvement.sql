-- Add streaming platform URL columns to releases table
ALTER TABLE public.releases
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS apple_music_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_music_url TEXT,
ADD COLUMN IF NOT EXISTS audiomack_url TEXT,
ADD COLUMN IF NOT EXISTS boomplay_url TEXT;

-- Add streaming platform URL columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS apple_music_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_music_url TEXT,
ADD COLUMN IF NOT EXISTS audiomack_url TEXT,
ADD COLUMN IF NOT EXISTS boomplay_url TEXT;

-- Update demo_uploads and public_demo_submissions to support 'needs_improvement' status
-- Note: If status column is TEXT, this will work automatically
-- If it's an enum, we may need to alter it, but for now assuming TEXT

-- Add check constraint to ensure valid status values (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'demo_uploads_status_check'
  ) THEN
    ALTER TABLE public.demo_uploads
    ADD CONSTRAINT demo_uploads_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_improvement'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'public_demo_submissions_status_check'
  ) THEN
    ALTER TABLE public.public_demo_submissions
    ADD CONSTRAINT public_demo_submissions_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_improvement'));
  END IF;
END $$;

