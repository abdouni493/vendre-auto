-- 🔍 SUPABASE RESOURCE DIAGNOSTIC QUERIES
-- Run these in Supabase SQL Editor to identify resource bottlenecks

-- 1. CHECK TABLE SIZES (Database Storage)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. FIND LARGE COLUMNS (Most likely: photos, logo_data)
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type IN ('text', 'bytea', 'character varying')
ORDER BY character_maximum_length DESC NULLS LAST;

-- 3. CHECK FOR LARGE TEXT FIELDS (Base64 encoded data)
SELECT 
  'purchases' AS table_name,
  COUNT(*) AS total_rows,
  ROUND(AVG(LENGTH(photos::text))::numeric, 2) AS avg_photos_size_bytes
FROM purchases
WHERE photos IS NOT NULL

UNION ALL

SELECT 
  'showroom_config' AS table_name,
  COUNT(*) AS total_rows,
  ROUND(AVG(LENGTH(logo::text))::numeric, 2) AS avg_logo_size_bytes
FROM showroom_config
WHERE logo IS NOT NULL;

-- 4. CHECK ROW COUNTS (If too many, pagination needed)
SELECT 
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- 5. FIND MISSING INDEXES (Slow queries)
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. CHECK REALTIME SUBSCRIPTIONS
SELECT 
  count(*) as subscription_count
FROM pg_stat_activity
WHERE query LIKE '%LISTEN%';

-- 7. DATABASE CONNECTION USAGE
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname;

-- 8. ESTIMATE STORAGE CLEANUP SAVINGS
SELECT 
  'photos in purchases' AS cleanup_target,
  COUNT(*) AS records_with_photos,
  ROUND((SUM(LENGTH(photos::text)) / 1024.0 / 1024.0)::numeric, 2) AS total_size_mb,
  ROUND((SUM(LENGTH(photos::text)) / COUNT(*) / 1024.0)::numeric, 2) AS avg_size_kb_per_record
FROM purchases
WHERE photos IS NOT NULL

UNION ALL

SELECT 
  'base64 logos' AS cleanup_target,
  COUNT(*) AS records,
  ROUND((SUM(LENGTH(logo::text)) / 1024.0 / 1024.0)::numeric, 2) AS total_size_mb,
  ROUND((SUM(LENGTH(logo::text)) / COUNT(*) / 1024.0)::numeric, 2) AS avg_size_kb_per_record
FROM showroom_config
WHERE logo IS NOT NULL;

-- 9. FIND DUPLICATE RECORDS (Can be deleted)
SELECT 
  'purchases - duplicates' AS table_name,
  COUNT(*) - COUNT(DISTINCT make, model, plate, color, year) AS potential_duplicates
FROM purchases;

-- 10. SHOW ROW COUNT BY TABLE (Quick overview)
SELECT 
  tablename,
  n_live_tup AS row_count,
  ROUND((pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0)::numeric, 2) AS size_mb
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
