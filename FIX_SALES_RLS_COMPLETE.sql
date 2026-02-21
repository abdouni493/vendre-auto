-- FIX SALES TABLE RLS POLICIES
-- This removes restrictive RLS policies and creates open policies for sales transactions

-- 1. Drop existing restrictive RLS policies on sales
DROP POLICY IF EXISTS "sales_select_own" ON public.sales;
DROP POLICY IF EXISTS "sales_insert_own" ON public.sales;
DROP POLICY IF EXISTS "sales_update_own" ON public.sales;
DROP POLICY IF EXISTS "sales_delete_own" ON public.sales;
DROP POLICY IF EXISTS "sales_select_all" ON public.sales;
DROP POLICY IF EXISTS "sales_insert_all" ON public.sales;
DROP POLICY IF EXISTS "sales_update_all" ON public.sales;
DROP POLICY IF EXISTS "sales_delete_all" ON public.sales;

-- 2. Ensure RLS is enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive RLS policies for all authenticated users

-- SELECT: Allow all authenticated users to read all sales
CREATE POLICY "sales_select_all" ON public.sales
  FOR SELECT
  USING (true);

-- INSERT: Allow all authenticated users to create sales
CREATE POLICY "sales_insert_all" ON public.sales
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow all authenticated users to update sales
CREATE POLICY "sales_update_all" ON public.sales
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow all authenticated users to delete sales
CREATE POLICY "sales_delete_all" ON public.sales
  FOR DELETE
  USING (true);

-- 4. Verify the policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'sales'
ORDER BY policyname;