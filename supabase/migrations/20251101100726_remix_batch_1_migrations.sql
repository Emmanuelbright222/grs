
-- Migration: 20251101094529
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  artist_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create streaming analytics table
CREATE TABLE public.streaming_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- e.g., 'spotify', 'apple_music', 'youtube_music'
  track_name TEXT NOT NULL,
  streams INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.streaming_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics" 
ON public.streaming_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.streaming_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.streaming_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create demo uploads table
CREATE TABLE public.demo_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  artist_name TEXT,
  genre TEXT,
  message TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert demo uploads" 
ON public.demo_uploads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own uploads" 
ON public.demo_uploads 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streaming_analytics_updated_at
BEFORE UPDATE ON public.streaming_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for demo uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('demos', 'demos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for demo uploads
CREATE POLICY "Anyone can upload demos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'demos');

CREATE POLICY "Users can view their own demos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'demos' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated'));
