-- SQL: Fix Worker Role Data Consistency
-- Run this script in your Supabase SQL Editor to ensure worker roles are properly set

-- Step 1: Check current workers data
SELECT id, fullname, username, type, role, created_by FROM public.workers ORDER BY created_at DESC;

-- Step 2: If type column is used but role is null, sync role from type
UPDATE public.workers 
SET role = CASE 
  WHEN type ILIKE '%admin%' THEN 'admin'
  WHEN type ILIKE '%driver%' THEN 'driver'
  ELSE 'worker'
END
WHERE role IS NULL OR role = '';

-- Step 3: Ensure fullname is not null (fix any empty fullnames)
UPDATE public.workers 
SET fullname = COALESCE(fullname, username, 'Unknown Worker')
WHERE fullname IS NULL OR fullname = '';

-- Step 4: Ensure username is not null (critical for login)
UPDATE public.workers 
SET username = CONCAT('worker_', SUBSTRING(id::text, 1, 8))
WHERE username IS NULL OR username = '';

-- Step 5: Check the results
SELECT id, fullname, username, type, role FROM public.workers ORDER BY created_at DESC;

-- Step 6: Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_workers_role ON public.workers(role);

-- Step 7: Create index on username for faster login lookups
CREATE INDEX IF NOT EXISTS idx_workers_username ON public.workers(username);

-- Verify the updates
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'worker' THEN 1 END) as worker_count,
  COUNT(CASE WHEN role = 'driver' THEN 1 END) as driver_count
FROM public.workers;
