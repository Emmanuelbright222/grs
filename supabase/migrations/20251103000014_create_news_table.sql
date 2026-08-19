-- Create news/blog posts table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL-friendly slug
  excerpt TEXT, -- Short description
  content TEXT NOT NULL, -- Full article content
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[], -- Array of tags
  is_featured BOOLEAN DEFAULT false, -- Featured on homepage
  is_published BOOLEAN DEFAULT false, -- Published status
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  author_name TEXT DEFAULT 'Grace Rhythm Editorial'
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS news_is_featured_idx ON public.news(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS news_is_published_idx ON public.news(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS news_slug_idx ON public.news(slug);
CREATE INDEX IF NOT EXISTS news_category_idx ON public.news(category);

-- RLS Policies
-- Public can view published news
CREATE POLICY "Public can view published news"
ON public.news FOR SELECT
USING (is_published = true);

-- Admins can manage all news
CREATE POLICY "Admins can manage all news"
ON public.news FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own drafts
CREATE POLICY "Users can view their own news"
ON public.news FOR SELECT
USING (auth.uid() = user_id);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

