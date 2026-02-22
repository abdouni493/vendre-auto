-- Migration: enable RLS + safe policies for profiles and workers
-- Date: 2026-02-22
-- Run as a superuser / table owner

-- 1) Drop any existing policies on profiles (safe removal of recursive policy)
DO $$
DECLARE p text;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles;', p);
  END LOOP;
END;
$$;

-- 2) Enable and force RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 3) Recreate safe policies for profiles
CREATE POLICY profiles_select_owner
  ON public.profiles
  FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY profiles_update_owner
  ON public.profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id)
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY profiles_insert_authenticated
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY profiles_admin
  ON public.profiles
  FOR ALL
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- 4) Enable and force RLS on workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers FORCE ROW LEVEL SECURITY;

-- 5) Revoke direct SELECT access to the sensitive column `password` from public/http roles
REVOKE SELECT (password) ON public.workers FROM PUBLIC;
REVOKE SELECT (password) ON public.workers FROM anon;
REVOKE SELECT (password) ON public.workers FROM authenticated;
-- If a backend/service role must read the hash, grant explicitly (not recommended for HTTP roles):
-- GRANT SELECT (password) ON public.workers TO your_service_role;

-- 6) Create safe policies for workers
CREATE POLICY workers_select_owner
  ON public.workers
  FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY workers_update_owner
  ON public.workers
  FOR UPDATE
  USING (auth.uid()::uuid = id)
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY workers_insert_authenticated
  ON public.workers
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY workers_admin
  ON public.workers
  FOR ALL
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- 7) Verification queries (run manually as different roles / with JWT claims)
-- SELECT * FROM pg_policies WHERE schemaname='public' AND tablename IN ('profiles','workers');
-- SELECT id, username, full_name FROM public.profiles WHERE id = auth.uid()::uuid;
-- SELECT id, fullname, email FROM public.workers WHERE id = auth.uid()::uuid;
-- SELECT password FROM public.workers LIMIT 1; -- should not be visible to HTTP roles
