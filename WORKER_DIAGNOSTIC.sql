-- SQL: Diagnostic Script - Run this FIRST to check your current state
-- This script will show you what needs to be fixed

-- ========================================
-- DIAGNOSTIC CHECKS
-- ========================================

-- 1. Show current workers table structure
\echo '=== WORKERS TABLE STRUCTURE ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workers' 
ORDER BY ordinal_position;

-- 2. Show all workers with their current data
\echo '=== ALL WORKERS ==='
SELECT 
  id,
  fullname,
  username,
  role,
  type,
  created_by,
  created_at
FROM public.workers 
ORDER BY created_at DESC;

-- 3. Check for missing critical data
\echo '=== DATA QUALITY CHECK ==='
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN fullname IS NULL OR fullname = '' THEN 1 END) as missing_fullname,
  COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as missing_username,
  COUNT(CASE WHEN password IS NULL OR password = '' THEN 1 END) as missing_password,
  COUNT(CASE WHEN role IS NULL OR role = '' THEN 1 END) as missing_role
FROM public.workers;

-- 4. Show workers by role
\echo '=== WORKERS BY ROLE ==='
SELECT 
  COALESCE(role, 'NULL') as role,
  COUNT(*) as count
FROM public.workers
GROUP BY role
ORDER BY count DESC;

-- 5. Check for duplicate usernames
\echo '=== DUPLICATE USERNAMES CHECK ==='
SELECT 
  username,
  COUNT(*) as count
FROM public.workers
WHERE username IS NOT NULL AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;

-- 6. Show admin workers specifically
\echo '=== ADMIN WORKERS ==='
SELECT 
  id,
  fullname,
  username,
  role,
  type,
  password IS NOT NULL as has_password
FROM public.workers
WHERE role = 'admin' OR type ILIKE '%admin%'
ORDER BY created_at DESC;

-- 7. Show problematic records that need fixing
\echo '=== RECORDS NEEDING ATTENTION ==='
SELECT 
  id,
  fullname,
  username,
  role,
  type,
  CASE 
    WHEN fullname IS NULL OR fullname = '' THEN 'Missing fullname'
    WHEN username IS NULL OR username = '' THEN 'Missing username'
    WHEN password IS NULL OR password = '' THEN 'Missing password'
    WHEN role IS NULL OR role = '' THEN 'Missing role'
    WHEN role != LOWER(type) THEN 'Role/Type mismatch'
    ELSE 'OK'
  END as issue
FROM public.workers
WHERE fullname IS NULL OR fullname = ''
   OR username IS NULL OR username = ''
   OR password IS NULL OR password = ''
   OR role IS NULL OR role = ''
   OR role != LOWER(type)
ORDER BY created_at DESC;

-- 8. Show the last 5 created workers
\echo '=== LAST 5 CREATED WORKERS ==='
SELECT 
  id,
  fullname,
  username,
  role,
  created_at
FROM public.workers
ORDER BY created_at DESC
LIMIT 5;
