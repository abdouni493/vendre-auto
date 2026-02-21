-- COMPLETE RECEIPTS TABLE FIX WITH RLS POLICIES
-- This script ensures the receipts table is properly configured for the app

-- 1. Ensure receipts table exists with correct structure
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  receipt_date date NOT NULL,
  note text,
  created_by uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receipts_pkey PRIMARY KEY (id),
  CONSTRAINT receipts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Enable RLS on receipts table
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "receipts_select_all" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_own" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update_own" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete_own" ON public.receipts;

-- OLD POLICY NAMES (also drop if they exist)
DROP POLICY IF EXISTS "receipts_select_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete_policy" ON public.receipts;

-- 4. Create RLS policies that match the app's requirements

-- SELECT: Allow all authenticated users to read all receipts
CREATE POLICY "receipts_select_all" ON public.receipts
  FOR SELECT
  USING (true);

-- INSERT: Allow authenticated users to create receipts (created_by must be their user ID)
CREATE POLICY "receipts_insert_own" ON public.receipts
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Allow users to update only their own receipts
CREATE POLICY "receipts_update_own" ON public.receipts
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Allow users to delete only their own receipts
CREATE POLICY "receipts_delete_own" ON public.receipts
  FOR DELETE
  USING (created_by = auth.uid());

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_created_by ON public.receipts(created_by);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date);

-- 6. Verify the configuration
-- Run this query to confirm policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'receipts'
ORDER BY policyname;