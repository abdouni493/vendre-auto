-- SQL: Complete Worker Management Data Fix
-- Run these scripts step by step in your Supabase SQL Editor

-- ========================================
-- PART 1: Fix Worker Roles and Data
-- ========================================

-- Step 1: Sync role and type columns
UPDATE public.workers 
SET role = CASE 
  WHEN type ILIKE '%admin%' OR role = 'admin' THEN 'admin'
  WHEN type ILIKE '%driver%' OR role = 'driver' THEN 'driver'
  ELSE 'worker'
END
WHERE role IS NULL OR role = '' OR role != type;

-- Step 2: Ensure fullname is populated
UPDATE public.workers 
SET fullname = COALESCE(NULLIF(fullname, ''), username, CONCAT('Worker_', SUBSTRING(id::text, 1, 8)))
WHERE fullname IS NULL OR fullname = '';

-- Step 3: Ensure username is unique and populated
UPDATE public.workers 
SET username = CONCAT('worker_', SUBSTRING(id::text, 1, 8))
WHERE username IS NULL OR username = '';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_role ON public.workers(role);
CREATE INDEX IF NOT EXISTS idx_workers_username ON public.workers(username);
CREATE INDEX IF NOT EXISTS idx_workers_created_at ON public.workers(created_at DESC);

-- ========================================
-- PART 2: Verify Data Consistency
-- ========================================

-- Check all workers with their critical fields
SELECT 
  id,
  fullname,
  username,
  role,
  type,
  telephone,
  password IS NOT NULL as has_password,
  created_by,
  created_at
FROM public.workers 
ORDER BY created_at DESC;

-- Count workers by role
SELECT 
  role,
  COUNT(*) as count
FROM public.workers
GROUP BY role;

-- Check for duplicate usernames
SELECT 
  username,
  COUNT(*) as count
FROM public.workers
WHERE username IS NOT NULL AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;

-- Check for workers without passwords or usernames
SELECT id, fullname, username, password FROM public.workers 
WHERE (username IS NULL OR username = '') 
   OR (password IS NULL OR password = '');

-- ========================================
-- PART 3: Add missing columns if needed
-- ========================================

-- Check if role column exists, if not add it
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'worker' 
  CHECK (role IN ('admin', 'worker', 'driver'));

-- Check if created_by column exists, if not add it
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- ========================================
-- PART 4: Update existing admin workers
-- ========================================

-- Set role to 'admin' for any admin workers
UPDATE public.workers
SET role = 'admin', type = 'Admin'
WHERE type ILIKE '%admin%' OR role = 'admin';

-- Set role to 'driver' for any driver workers
UPDATE public.workers
SET role = 'driver', type = 'Driver'
WHERE type ILIKE '%driver%' OR role = 'driver';

-- ========================================
-- PART 5: Final verification
-- ========================================

-- Show the final state
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'worker' THEN 1 END) as worker_count,
  COUNT(CASE WHEN role = 'driver' THEN 1 END) as driver_count,
  COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as users_with_username,
  COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) as users_with_password
FROM public.workers;

-- Show all admin workers
SELECT id, fullname, username, role, type FROM public.workers 
WHERE role = 'admin' 
ORDER BY created_at DESC;
