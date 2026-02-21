-- ============================================
-- QUICK SQL COPY-PASTE REFERENCE
-- For Supabase SQL Editor
-- ============================================

-- STEP 1: Check if role column exists
-- Copy and paste this first - no changes made
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'workers' AND column_name = 'role';


-- ============================================
-- IF role COLUMN MISSING: Run this first
-- ============================================
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'worker' 
CHECK (role IN ('admin', 'worker', 'driver'));

-- Then run Step 2 below


-- ============================================
-- STEP 2: Quick Data Check (No changes)
-- ============================================
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_workers,
  COUNT(CASE WHEN fullname IS NULL OR fullname = '' THEN 1 END) as empty_fullnames
FROM public.workers;


-- ============================================
-- STEP 3: Sync role and type fields
-- This makes changes - DOES UPDATE DATA
-- ============================================
UPDATE public.workers 
SET role = CASE 
  WHEN type ILIKE '%admin%' OR role = 'admin' THEN 'admin'
  WHEN type ILIKE '%driver%' OR role = 'driver' THEN 'driver'
  ELSE 'worker'
END
WHERE role IS NULL OR role = '';


-- ============================================
-- STEP 4: Fill empty fullnames
-- This makes changes - DOES UPDATE DATA
-- ============================================
UPDATE public.workers 
SET fullname = COALESCE(NULLIF(fullname, ''), username, CONCAT('Worker_', SUBSTRING(id::text, 1, 8)))
WHERE fullname IS NULL OR fullname = '';


-- ============================================
-- STEP 5: Create performance indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workers_role ON public.workers(role);
CREATE INDEX IF NOT EXISTS idx_workers_username ON public.workers(username);


-- ============================================
-- STEP 6: Verify admin workers have correct role
-- ============================================
SELECT 
  id, 
  fullname, 
  username, 
  role, 
  type,
  password IS NOT NULL as has_password
FROM public.workers 
WHERE role = 'admin' 
ORDER BY created_at DESC;


-- ============================================
-- STEP 7: Show all workers summary
-- ============================================
SELECT 
  role as user_role,
  COUNT(*) as count,
  COUNT(CASE WHEN fullname IS NOT NULL AND fullname != '' THEN 1 END) as with_fullname,
  COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as with_username
FROM public.workers
GROUP BY role
ORDER BY count DESC;


-- ============================================
-- TROUBLESHOOTING: Check for data issues
-- ============================================
SELECT 
  id,
  fullname,
  username,
  role,
  CASE 
    WHEN fullname IS NULL OR fullname = '' THEN 'MISSING FULLNAME'
    WHEN username IS NULL OR username = '' THEN 'MISSING USERNAME'
    WHEN password IS NULL OR password = '' THEN 'MISSING PASSWORD'
    WHEN role IS NULL OR role = '' THEN 'MISSING ROLE'
    ELSE 'OK'
  END as status
FROM public.workers
WHERE fullname IS NULL OR fullname = ''
   OR username IS NULL OR username = ''
   OR password IS NULL OR password = ''
   OR role IS NULL OR role = '';


-- ============================================
-- TEST: Create a test admin worker (for testing)
-- Just copy one line at a time and run it
-- ============================================
-- 1. First, check if test admin exists
SELECT * FROM public.workers WHERE username = 'testadmin';

-- 2. If not, create one:
INSERT INTO public.workers 
(fullname, username, password, role, type, telephone, created_by) 
VALUES 
('Test Admin User', 'testadmin', 'test123', 'admin', 'Admin', '555-0000', 'you');

-- 3. Then verify it was created
SELECT fullname, username, role FROM public.workers WHERE username = 'testadmin';

-- 4. Delete it when done (optional)
-- DELETE FROM public.workers WHERE username = 'testadmin';


-- ============================================
-- VERIFY: Final state after all changes
-- ============================================
-- Should show admins with correct role
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'worker' THEN 1 END) as worker_count
FROM public.workers;

-- Show admin users
SELECT fullname, username, role FROM public.workers WHERE role = 'admin';

-- Show all workers
SELECT 
  SUBSTRING(id::text, 1, 8) as id_short,
  fullname, 
  username, 
  role,
  created_at
FROM public.workers 
ORDER BY created_at DESC 
LIMIT 20;


-- ============================================
-- CLEANUP: If something goes wrong
-- ============================================
-- Restore null values if needed
UPDATE public.workers SET role = 'worker' WHERE role IS NULL OR role = '';

-- Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE tablename = 'workers';

-- Drop an index if needed
-- DROP INDEX IF EXISTS idx_workers_role;


-- ============================================
-- NOTES FOR YOU
-- ============================================
-- 1. Run diagnostic queries first (they don't change data)
-- 2. Then run update queries (they DO change data)
-- 3. Check results after each step
-- 4. If you see errors, stop and debug
-- 5. Clear browser cache after changes
-- 6. Test login with admin user
-- 7. Verify navbar shows full name (not "worker")
-- 8. Verify menu shows all items
