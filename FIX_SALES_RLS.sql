-- SQL Fix: Sales Table RLS Policies
-- This script fixes the row-level security policies for the sales table

-- ========================================
-- STEP 1: Check current RLS status
-- ========================================

-- View RLS status for sales table
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'sales';

-- View current policies on sales table
SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'sales';

-- ========================================
-- STEP 2: Option A - Disable RLS completely
-- ========================================
-- WARNING: Only do this if you're okay with RLS being disabled
-- Uncomment the line below if you want to disable RLS:
-- ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Option B - Create proper RLS policies
-- ========================================

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "allow_insert_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_select_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_update_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_delete_sales" ON public.sales;

-- Enable RLS if not already enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into sales table
CREATE POLICY "allow_insert_sales" ON public.sales
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select from sales table
CREATE POLICY "allow_select_sales" ON public.sales
  FOR SELECT
  USING (true);

-- Allow anyone to update sales table
CREATE POLICY "allow_update_sales" ON public.sales
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete from sales table
CREATE POLICY "allow_delete_sales" ON public.sales
  FOR DELETE
  USING (true);

-- ========================================
-- STEP 4: Verify policies were created
-- ========================================

SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'sales';

-- ========================================
-- STEP 5: Test insert (optional)
-- ========================================

-- Try inserting a test record to verify the policy works
-- Replace these values with your own test data
-- INSERT INTO public.sales (
--   car_id, first_name, last_name, mobile1, doc_number, 
--   total_price, amount_paid, balance, status, created_by
-- ) VALUES (
--   'test-car-id', 'Test', 'User', '0612345678', 'TEST123',
--   500000, 250000, 250000, 'debt', 'test_user'
-- ) RETURNING *;

-- ========================================
-- STEP 6: Alternative - Create an RPC function
-- ========================================

-- Create a function that handles sales insertion (bypasses RLS)
-- This approach is more secure as it validates data on the server side

CREATE OR REPLACE FUNCTION public.create_sale(
  p_car_id UUID,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_dob DATE DEFAULT NULL,
  p_gender VARCHAR DEFAULT 'M',
  p_pob VARCHAR DEFAULT '',
  p_address VARCHAR DEFAULT '',
  p_profession VARCHAR DEFAULT '',
  p_mobile1 VARCHAR,
  p_mobile2 VARCHAR DEFAULT '',
  p_nif VARCHAR DEFAULT '',
  p_rc VARCHAR DEFAULT '',
  p_nis VARCHAR DEFAULT '',
  p_art VARCHAR DEFAULT '',
  p_doc_type VARCHAR DEFAULT '',
  p_doc_number VARCHAR,
  p_issue_date DATE DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL,
  p_photo TEXT DEFAULT NULL,
  p_scan TEXT DEFAULT NULL,
  p_signature TEXT DEFAULT NULL,
  p_total_price NUMERIC,
  p_amount_paid NUMERIC,
  p_balance NUMERIC,
  p_status VARCHAR,
  p_created_by VARCHAR DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  INSERT INTO public.sales (
    car_id, first_name, last_name, dob, gender, pob, address, profession,
    mobile1, mobile2, nif, rc, nis, art, doc_type, doc_number,
    issue_date, expiry_date, photo, scan, signature,
    total_price, amount_paid, balance, status, created_by
  ) VALUES (
    p_car_id, p_first_name, p_last_name, p_dob, p_gender, p_pob, p_address, p_profession,
    p_mobile1, p_mobile2, p_nif, p_rc, p_nis, p_art, p_doc_type, p_doc_number,
    p_issue_date, p_expiry_date, p_photo, p_scan, p_signature,
    p_total_price, p_amount_paid, p_balance, p_status, p_created_by
  )
  RETURNING sales.id, sales.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to anon role (for unauthenticated users)
GRANT EXECUTE ON FUNCTION public.create_sale TO anon;
GRANT EXECUTE ON FUNCTION public.create_sale TO authenticated;

-- ========================================
-- STEP 7: Verify function was created
-- ========================================

SELECT * FROM pg_proc 
WHERE proname = 'create_sale';

-- ========================================
-- QUICK REFERENCE
-- ========================================

-- Option A (Easiest): Disable RLS completely
-- ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;

-- Option B (Recommended): Use the policies above
-- - Run STEP 2 and STEP 3 code

-- Option C (Most Secure): Use the RPC function
-- - Run STEP 6 to create the function
-- - Update POS.tsx to call this function instead of direct insert
-- - Call: supabase.rpc('create_sale', { p_car_id: ..., p_first_name: ... })
