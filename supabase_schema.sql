-- ==============================================================================
-- SIEC Certificate Portal - Supabase Schema & Storage Setup
-- Run this script in your Supabase SQL Editor (SQL Editor -> New query -> Run)
-- ==============================================================================

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  creator_email TEXT,
  event_name TEXT NOT NULL,
  category TEXT DEFAULT 'Workshop',
  event_date TEXT,
  status TEXT DEFAULT 'Draft',
  base_image_url TEXT,
  csv_data JSONB DEFAULT '[]'::jsonb,
  canvas_configs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Users & Roles Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Secure Row-Level Security (RLS) Policies for Events
-- CRITICAL SECURITY: Never allow public client SELECT on public.events (contains sensitive student csv_data)
DROP POLICY IF EXISTS "Public attendees can read published events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage their events" ON public.events;

-- Authenticated Admins can only read and manage their own event records
CREATE POLICY "Admins can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid()::text = admin_id);

CREATE POLICY "Admins can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid()::text = admin_id);

CREATE POLICY "Admins can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid()::text = admin_id)
  WITH CHECK (auth.uid()::text = admin_id);

CREATE POLICY "Admins can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid()::text = admin_id);

-- 5. Public Events Sanitized View (Excludes csv_data, admin_id, and creator_email)
CREATE OR REPLACE VIEW public.public_events AS
  SELECT id, event_name, category, event_date, status, base_image_url, canvas_configs, created_at
  FROM public.events
  WHERE status = 'Published';

GRANT SELECT ON public.public_events TO anon, authenticated;

-- 5. Policies for Users
CREATE POLICY "Users can manage user profiles"
  ON public.users FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create Free 1GB Storage Bucket for Certificate Templates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies: Anyone can view templates; anyone can upload templates
CREATE POLICY "Public can view certificate templates" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'certificates');

CREATE POLICY "Allow uploading certificate templates" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow updating certificate templates" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'certificates');
