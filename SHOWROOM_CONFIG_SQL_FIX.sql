-- ==============================
-- SHOWROOM CONFIGURATION - COMPLETE SQL FIX
-- ==============================
-- Exécutez ce script dans Supabase SQL Editor si vous avez des problèmes
-- This script will fix any showroom configuration issues

-- ==============================
-- 1. VERIFY & CREATE TABLE
-- ==============================

-- Create or verify table exists
CREATE TABLE IF NOT EXISTS public.showroom_config (
  id bigint NOT NULL DEFAULT 1,
  name text DEFAULT 'AutoLux'::text,
  slogan text DEFAULT 'Excellence Automobile'::text,
  address text DEFAULT ''::text,
  facebook text DEFAULT 'facebook.com/autolux'::text,
  instagram text DEFAULT '@autolux_dz'::text,
  whatsapp text DEFAULT ''::text,
  logo_data text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT showroom_config_pkey PRIMARY KEY (id)
);

-- ==============================
-- 2. ADD MISSING COLUMNS
-- ==============================

-- Add columns if they don't exist
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS name text DEFAULT 'AutoLux'::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS slogan text DEFAULT 'Excellence Automobile'::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS address text DEFAULT ''::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS facebook text DEFAULT 'facebook.com/autolux'::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS instagram text DEFAULT '@autolux_dz'::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT ''::text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS logo_data text;
ALTER TABLE public.showroom_config ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ==============================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================

ALTER TABLE public.showroom_config ENABLE ROW LEVEL SECURITY;

-- ==============================
-- 4. DROP OLD POLICIES (if any)
-- ==============================

DROP POLICY IF EXISTS "Enable all access to showroom_config" ON public.showroom_config;
DROP POLICY IF EXISTS "Allow authenticated users to read showroom_config" ON public.showroom_config;
DROP POLICY IF EXISTS "Allow admins to update showroom_config" ON public.showroom_config;
DROP POLICY IF EXISTS "Allow admins to insert showroom_config" ON public.showroom_config;

-- ==============================
-- 5. CREATE NEW RLS POLICIES
-- ==============================

-- Policy 1: Everyone can READ config (needed for login page)
CREATE POLICY "Everyone can read showroom_config"
  ON public.showroom_config
  FOR SELECT
  USING (true);

-- Policy 2: Admins can UPDATE config
CREATE POLICY "Admins can update showroom_config"
  ON public.showroom_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR role IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR role IS NULL)
    )
  );

-- Policy 3: Admins can INSERT config
CREATE POLICY "Admins can insert showroom_config"
  ON public.showroom_config
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR role IS NULL)
    )
  );

-- ==============================
-- 6. INSERT DEFAULT DATA
-- ==============================

-- Ensure we have a default configuration
INSERT INTO public.showroom_config (id, name, slogan, address, facebook, instagram, whatsapp, logo_data, updated_at)
VALUES (
  1,
  'AutoLux',
  'Excellence Automobile',
  '123 Rue de la Paix, Alger',
  'facebook.com/autolux',
  '@autolux_dz',
  '+213 555 123456',
  NULL,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- ==============================
-- 7. VERIFICATION QUERIES
-- ==============================

-- Check table exists
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='showroom_config') as table_exists;

-- Check columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'showroom_config' ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'showroom_config';

-- Check policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'showroom_config';

-- Check data
SELECT id, name, slogan, address, (logo_data IS NOT NULL) as has_logo, updated_at 
FROM public.showroom_config WHERE id = 1;

-- ==============================
-- 8. TEST UPDATE (if you want to verify it works)
-- ==============================

/*
-- Uncomment to test (change values as needed)
UPDATE public.showroom_config
SET 
  name = 'Mon Showroom AutoLux',
  slogan = 'Excellence et Qualité',
  address = '123 Rue Principal, Alger',
  facebook = 'facebook.com/myshowroom',
  instagram = '@myshowroom_dz',
  whatsapp = '+213 555 123456',
  updated_at = now()
WHERE id = 1;

-- Verify
SELECT * FROM public.showroom_config WHERE id = 1;
*/

-- ==============================
-- 9. GRANT PERMISSIONS (if needed)
-- ==============================

-- Grant permissions to authenticated users
GRANT SELECT ON public.showroom_config TO authenticated;

-- Grant update to authenticated users (RLS policies will filter)
GRANT UPDATE ON public.showroom_config TO authenticated;

-- Grant insert to authenticated users (RLS policies will filter)
GRANT INSERT ON public.showroom_config TO authenticated;

-- ==============================
-- COMPLETED SUCCESSFULLY! ✅
-- ==============================
-- Your showroom configuration table is now:
-- ✅ Created with all required columns
-- ✅ RLS policies configured
-- ✅ Default data inserted
-- ✅ Ready for use
--
-- You can now:
-- 1. Go to Configuration page (⚙️)
-- 2. Tab: Boutique (🏪)
-- 3. Update your showroom info and logo
-- 4. Click "Synchroniser le Showroom 💎"
-- 5. Verify on Login page, Sidebar, and Purchase invoices
-- ==============================
