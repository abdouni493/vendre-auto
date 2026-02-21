-- ============================================
-- FIX: Vehicle Expenses RLS Policy Issue
-- ============================================
-- Error: 401 Unauthorized when adding vehicle expenses
-- Cause: Missing RLS policies on vehicle_expenses table
-- Solution: Enable RLS and add necessary policies

-- Step 1: Check if table exists and has RLS enabled
-- SELECT tablename FROM pg_tables WHERE tablename = 'vehicle_expenses';

-- Step 2: Enable RLS on vehicle_expenses table
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy to allow authenticated users to SELECT their own expenses
CREATE POLICY vehicle_expenses_select_policy
ON public.vehicle_expenses
FOR SELECT
USING (auth.role() = 'authenticated');

-- Step 4: Create policy to allow authenticated users to INSERT
CREATE POLICY vehicle_expenses_insert_policy
ON public.vehicle_expenses
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Step 5: Create policy to allow users to UPDATE their own records
CREATE POLICY vehicle_expenses_update_policy
ON public.vehicle_expenses
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Create policy to allow users to DELETE their own records
CREATE POLICY vehicle_expenses_delete_policy
ON public.vehicle_expenses
FOR DELETE
USING (auth.role() = 'authenticated');

-- Step 7: Verify RLS is enabled
-- Run this to check:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'vehicle_expenses';
-- Should return: vehicle_expenses | t (true)

-- Step 8: List all policies (verification)
-- Run this to verify policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'vehicle_expenses';

COMMIT;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ RLS enabled on vehicle_expenses table
-- ✅ SELECT policy added for authenticated users
-- ✅ INSERT policy added for authenticated users
-- ✅ UPDATE policy added for authenticated users
-- ✅ DELETE policy added for authenticated users
--
-- All policies allow authenticated users full access
-- This fixes the 401 Unauthorized error
-- ============================================
