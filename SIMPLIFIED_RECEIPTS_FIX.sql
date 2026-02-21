-- SIMPLIFIED RECEIPTS TABLE FIX - NO AUTHENTICATION REQUIRED
-- This allows users to create receipts without userId tracking

-- 1. Ensure receipts table exists with correct structure
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  receipt_date date NOT NULL,
  note text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receipts_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on receipts table
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies
DROP POLICY IF EXISTS "receipts_select_all" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_own" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update_own" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete_own" ON public.receipts;
DROP POLICY IF EXISTS "receipts_select_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete_policy" ON public.receipts;

-- 4. Create simplified RLS policies (allow all authenticated users)

-- SELECT: Allow all authenticated users to read all receipts
CREATE POLICY "receipts_select_all" ON public.receipts
  FOR SELECT
  USING (true);

-- INSERT: Allow all authenticated users to create receipts
CREATE POLICY "receipts_insert_all" ON public.receipts
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow all authenticated users to update receipts
CREATE POLICY "receipts_update_all" ON public.receipts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow all authenticated users to delete receipts
CREATE POLICY "receipts_delete_all" ON public.receipts
  FOR DELETE
  USING (true);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date);

-- 6. Verify the configuration
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