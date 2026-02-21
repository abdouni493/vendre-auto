-- ==============================
-- SHOWROOM CONFIGURATION MIGRATION
-- ==============================
-- This SQL code ensures your showroom_config table matches the expected schema
-- and includes the necessary RLS policies for proper functionality

-- 1. Create or update showroom_config table
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

-- 2. If the table already exists, ensure all columns are present
-- Add missing columns if they don't exist
ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS name text DEFAULT 'AutoLux'::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS slogan text DEFAULT 'Excellence Automobile'::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS address text DEFAULT ''::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS facebook text DEFAULT 'facebook.com/autolux'::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS instagram text DEFAULT '@autolux_dz'::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT ''::text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS logo_data text;

ALTER TABLE public.showroom_config 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. Enable Row Level Security
ALTER TABLE public.showroom_config ENABLE ROW LEVEL SECURITY;

-- 4. Create or replace RLS policy - Allow all authenticated users to read config
DROP POLICY IF EXISTS "Allow authenticated users to read showroom_config" ON public.showroom_config;
CREATE POLICY "Allow authenticated users to read showroom_config"
  ON public.showroom_config FOR SELECT
  USING (true);

-- 5. Create or replace RLS policy - Allow admins to update config
DROP POLICY IF EXISTS "Allow admins to update showroom_config" ON public.showroom_config;
CREATE POLICY "Allow admins to update showroom_config"
  ON public.showroom_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Create or replace RLS policy - Allow admins to insert config
DROP POLICY IF EXISTS "Allow admins to insert showroom_config" ON public.showroom_config;
CREATE POLICY "Allow admins to insert showroom_config"
  ON public.showroom_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Ensure there is a default configuration entry
INSERT INTO public.showroom_config (id, name, slogan, address, facebook, instagram, whatsapp, logo_data, updated_at)
VALUES (
  1,
  'AutoLux',
  'Excellence Automobile',
  '',
  'facebook.com/autolux',
  '@autolux_dz',
  '',
  NULL,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- 8. Verify the configuration
SELECT 
  id,
  name,
  slogan,
  address,
  facebook,
  instagram,
  whatsapp,
  logo_data IS NOT NULL as has_logo,
  updated_at
FROM public.showroom_config
WHERE id = 1;

-- ==============================
-- NOTES FOR TROUBLESHOOTING
-- ==============================
-- If the config is still not saving:
-- 1. Check that your user role in the profiles table is set to 'admin'
-- 2. Verify RLS policies are enabled on showroom_config table
-- 3. Check Supabase logs for any RLS policy violations
-- 4. Try updating the record directly in Supabase SQL Editor first to test
--
-- Test UPDATE:
-- UPDATE public.showroom_config
-- SET name = 'Your Showroom Name', 
--     slogan = 'Your Slogan',
--     address = 'Your Address',
--     logo_data = 'data:image/png;base64,...',
--     updated_at = now()
-- WHERE id = 1;
--
-- Test SELECT:
-- SELECT * FROM public.showroom_config WHERE id = 1;
