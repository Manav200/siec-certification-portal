-- ==============================================================================
-- SIEC CERTIFICATE PORTAL: DATABASE ROW-LEVEL SECURITY (RLS) SECURITY PATCH v2
-- Run this in your Supabase SQL Editor (SQL Editor → New query → Paste → Run)
-- ==============================================================================

-- ── Step 1: Enable Row-Level Security on events table ─────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Drop all legacy / insecure policies ───────────────────────────────
DROP POLICY IF EXISTS "Public attendees can read published events"      ON public.events;
DROP POLICY IF EXISTS "Admins can manage their events"                  ON public.events;
DROP POLICY IF EXISTS "Admins can view their own events"                ON public.events;
DROP POLICY IF EXISTS "Admins can insert their own events"              ON public.events;
DROP POLICY IF EXISTS "Admins can update their own events"              ON public.events;
DROP POLICY IF EXISTS "Admins can delete their own events"              ON public.events;
DROP POLICY IF EXISTS "Service role full access"                        ON public.events;

-- ── Step 3: Admin CRUD policies (Firebase UID must match admin_id column) ─────
-- SELECT: admins can read only their own events (full row including csv_data)
CREATE POLICY "Admins can view their own events"
  ON public.events FOR SELECT
  TO authenticated
  USING (auth.uid()::text = admin_id);

-- INSERT: admins can create events assigned to themselves
CREATE POLICY "Admins can insert their own events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = admin_id);

-- UPDATE: admins can modify only their own events
CREATE POLICY "Admins can update their own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = admin_id)
  WITH CHECK (auth.uid()::text = admin_id);

-- DELETE: admins can remove only their own events
CREATE POLICY "Admins can delete their own events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid()::text = admin_id);

-- ── Step 4: Service Role Bypass ───────────────────────────────────────────────
-- The server-side /api/certificates/verify endpoint uses SUPABASE_SERVICE_ROLE_KEY.
-- The service role bypasses RLS automatically in Supabase — no extra policy needed.
-- Verify: in Supabase Dashboard → Table Editor → events → RLS is ON and
--         service_role is listed as bypassing RLS by default.

-- ── Step 5: Revoke direct anon SELECT on events (force all public reads through ─
--            the sanitized public_events view or the server-side verify API)  ───
REVOKE SELECT ON public.events FROM anon;

-- ── Step 6: Sanitized Public Events View (metadata only, zero PII) ────────────
-- Exposes only non-sensitive event metadata for the public portal events list.
-- csv_data, admin_id, and creator_email are intentionally excluded.
CREATE OR REPLACE VIEW public.public_events
  WITH (security_invoker = true)
AS
  SELECT
    id,
    event_name,
    category,
    event_date,
    status,
    base_image_url,
    canvas_configs,
    created_at
  FROM public.events
  WHERE status = 'Published';

-- Allow anon and authenticated users to read the sanitized view only
GRANT SELECT ON public.public_events TO anon, authenticated;

-- ==============================================================================
-- END OF RLS SECURITY PATCH
-- After running: verify in Dashboard → Authentication → Policies that:
--   ✓ RLS is enabled on the events table
--   ✓ Only the 4 admin policies exist (no public SELECT on events)
--   ✓ public_events view is accessible to anon
-- ==============================================================================
