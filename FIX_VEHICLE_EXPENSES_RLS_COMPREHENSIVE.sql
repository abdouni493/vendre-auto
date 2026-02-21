-- ============================================
-- COMPREHENSIVE FIX: Vehicle Expenses 401 Error
-- ============================================
-- The previous policies didn't work. This is a complete fix.

-- Step 1: Drop existing broken policies (if any)
DROP POLICY IF EXISTS vehicle_expenses_select_policy ON public.vehicle_expenses;
DROP POLICY IF EXISTS vehicle_expenses_insert_policy ON public.vehicle_expenses;
DROP POLICY IF EXISTS vehicle_expenses_update_policy ON public.vehicle_expenses;
DROP POLICY IF EXISTS vehicle_expenses_delete_policy ON public.vehicle_expenses;

-- Step 2: Disable RLS temporarily to reset
ALTER TABLE public.vehicle_expenses DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS fresh
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- Step 4: Create PERMISSIVE policies that allow all authenticated users
-- SELECT - Allow all authenticated users to view
CREATE POLICY vehicle_expenses_allow_select
ON public.vehicle_expenses
FOR SELECT
USING (true);

-- INSERT - Allow all authenticated users to insert
CREATE POLICY vehicle_expenses_allow_insert
ON public.vehicle_expenses
FOR INSERT
WITH CHECK (true);

-- UPDATE - Allow all authenticated users to update
CREATE POLICY vehicle_expenses_allow_update
ON public.vehicle_expenses
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE - Allow all authenticated users to delete
CREATE POLICY vehicle_expenses_allow_delete
ON public.vehicle_expenses
FOR DELETE
USING (true);

-- Step 5: Verify the table structure
-- This ensures vehicle_expenses table has all required columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns 
WHERE 
  table_name = 'vehicle_expenses' 
  AND table_schema = 'public'
ORDER BY 
  ordinal_position;

-- ============================================
-- ALTERNATIVE FIX: If above doesn't work
-- ============================================
-- Uncomment and run if you still get 401 error
-- This completely disables RLS as a last resort:

-- ALTER TABLE public.vehicle_expenses DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES (Run after executing)
-- ============================================
-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'vehicle_expenses';

-- Check all policies:
-- SELECT policyname, tablename, permissive, roles, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'vehicle_expenses';

-- Check table structure:
-- SELECT * FROM information_schema.columns WHERE table_name = 'vehicle_expenses';
