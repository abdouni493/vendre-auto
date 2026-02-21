-- SQL Fix: Enable RLS on Sales Table
-- This fix addresses the issue where RLS policies exist but RLS is not enabled

-- Enable RLS on the sales table
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'sales';

-- View existing RLS policies on the sales table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'sales'
ORDER BY policyname;
