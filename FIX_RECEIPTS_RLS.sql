-- Drop existing policies if they exist
DROP POLICY IF EXISTS "receipts_select_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_update_policy" ON public.receipts;
DROP POLICY IF EXISTS "receipts_delete_policy" ON public.receipts;

-- Ensure RLS is enabled
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (one per action)
CREATE POLICY "receipts_select_all" ON public.receipts
  FOR SELECT
  USING (true);

CREATE POLICY "receipts_insert_own" ON public.receipts
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "receipts_update_own" ON public.receipts
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "receipts_delete_own" ON public.receipts
  FOR DELETE
  USING (created_by = auth.uid());

-- Verify the policies were created
SELECT policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'receipts';
