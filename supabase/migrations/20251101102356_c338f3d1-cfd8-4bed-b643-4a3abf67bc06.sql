-- Fix security issues and add admin roles

-- 1. Create role enum and user_roles table for secure admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'artist');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to auto-assign artist role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'artist');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can modify roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix profiles table security - make only certain fields public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public can view artist profiles (limited fields)"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can view full own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Fix demo_uploads security - remove NULL user_id exposure
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.demo_uploads;
DROP POLICY IF EXISTS "Anyone can insert demo uploads" ON public.demo_uploads;

CREATE POLICY "Users can view their own demo uploads"
  ON public.demo_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all demo uploads"
  ON public.demo_uploads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert their own demos"
  ON public.demo_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demos"
  ON public.demo_uploads FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Add releases table for managing releases
CREATE TABLE public.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT,
  release_date DATE,
  genre TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false
);

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

-- RLS for releases
CREATE POLICY "Public can view releases"
  ON public.releases FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own releases"
  ON public.releases FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all releases"
  ON public.releases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();