-- Create table to store artist's connected streaming platforms
CREATE TABLE IF NOT EXISTS public.streaming_platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'spotify', 'apple_music', 'youtube', etc.
  access_token TEXT, -- Encrypted or stored securely
  refresh_token TEXT, -- Encrypted or stored securely
  token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT, -- Artist's ID on the platform
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, platform) -- One connection per platform per user
);

-- Enable RLS
ALTER TABLE public.streaming_platform_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own connections"
ON public.streaming_platform_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
ON public.streaming_platform_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
ON public.streaming_platform_connections FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
ON public.streaming_platform_connections FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all connections
CREATE POLICY "Admins can view all connections"
ON public.streaming_platform_connections FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS streaming_platform_connections_user_id_idx 
ON public.streaming_platform_connections(user_id);
CREATE INDEX IF NOT EXISTS streaming_platform_connections_platform_idx 
ON public.streaming_platform_connections(platform);

