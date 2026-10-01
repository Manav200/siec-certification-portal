-- ==============================================================================
-- SIEC CERTIFICATE PORTAL: DATABASE ROW-LEVEL SECURITY (RLS) SECURITY PATCH
-- Run this in your Supabase SQL Editor (SQL Editor -> New query -> Paste -> Run)
-- This eliminates direct public client access to sensitive student csv_data.
-- ==============================================================================

-- 1. Ensure Row-Level Security is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy insecure public SELECT policies that exposed student csv_data
DROP POLICY IF EXISTS "Public attendees can read published events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage their events" ON public.events;
DROP POLICY IF EXISTS "Admins can view their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can update their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete their own events" ON public.events;

-- 3. Strict Admin Access: Only authenticated admins can read and manage their own events
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

-- 4. Create Sanitized Public Events View (excludes csv_data, admin_id, and creator_email)
CREATE OR REPLACE VIEW public.public_events AS
  SELECT id, event_name, category, event_date, status, base_image_url, canvas_configs, created_at
  FROM public.events
  WHERE status = 'Published';

-- Allow read access to the sanitized view for anon and authenticated users
GRANT SELECT ON public.public_events TO anon, authenticated;
