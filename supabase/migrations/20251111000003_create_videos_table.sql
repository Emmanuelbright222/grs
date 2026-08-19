-- Create videos table for YouTube video content
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  artist_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  genre TEXT,
  youtube_video_id TEXT NOT NULL, -- YouTube video ID extracted from URL
  youtube_url TEXT NOT NULL, -- Full YouTube URL
  description TEXT,
  publish_date DATE,
  is_featured BOOLEAN DEFAULT false,
  thumbnail_url TEXT -- YouTube thumbnail URL
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public can view videos
CREATE POLICY "Public can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- Admins can manage all videos
CREATE POLICY "Admins can manage all videos"
  ON public.videos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can manage their own videos
CREATE POLICY "Users can manage their own videos"
  ON public.videos FOR ALL
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS videos_artist_name_idx ON public.videos(artist_name);
CREATE INDEX IF NOT EXISTS videos_publish_date_idx ON public.videos(publish_date DESC);
CREATE INDEX IF NOT EXISTS videos_is_featured_idx ON public.videos(is_featured);

-- Function to extract YouTube video ID from URL
CREATE OR REPLACE FUNCTION public.extract_youtube_video_id(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  video_id TEXT;
BEGIN
  -- Handle various YouTube URL formats
  -- https://www.youtube.com/watch?v=VIDEO_ID
  -- https://youtu.be/VIDEO_ID
  -- https://www.youtube.com/embed/VIDEO_ID
  -- https://youtube.com/watch?v=VIDEO_ID&feature=...
  
  IF url ~ 'youtube\.com/watch\?v=([^&]+)' THEN
    video_id := (regexp_match(url, 'youtube\.com/watch\?v=([^&]+)'))[1];
  ELSIF url ~ 'youtu\.be/([^?]+)' THEN
    video_id := (regexp_match(url, 'youtu\.be/([^?]+)'))[1];
  ELSIF url ~ 'youtube\.com/embed/([^?]+)' THEN
    video_id := (regexp_match(url, 'youtube\.com/embed/([^?]+)'))[1];
  ELSE
    video_id := NULL;
  END IF;
  
  RETURN video_id;
END;
$$;

COMMENT ON TABLE public.videos IS 'Stores YouTube video content for the platform';

