-- SQL: Check if Inspection Data is Being Saved
-- Run this query AFTER you save a purchase with inspection items

-- 1. Check the most recent purchase records
SELECT 
  id,
  make,
  model,
  created_at,
  safety_checklist,
  equipment_checklist,
  comfort_checklist
FROM purchases
ORDER BY created_at DESC
LIMIT 5;

-- 2. If you added "test" to safety, check specifically for it
SELECT 
  id,
  make,
  model,
  safety_checklist,
  safety_checklist->>'test' AS test_value
FROM purchases
WHERE safety_checklist ? 'test'
ORDER BY created_at DESC;

-- 3. Check all purchases with ANY inspection data
SELECT 
  id,
  make,
  model,
  jsonb_array_length(COALESCE(safety_checklist, '{}'::jsonb)) AS safety_count,
  jsonb_array_length(COALESCE(equipment_checklist, '{}'::jsonb)) AS equipment_count,
  jsonb_array_length(COALESCE(comfort_checklist, '{}'::jsonb)) AS comfort_count
FROM purchases
ORDER BY created_at DESC;

-- 4. View the structure of the last 10 purchases (simplified)
SELECT 
  id,
  make,
  model,
  created_at,
  CASE 
    WHEN safety_checklist = '{}' THEN 'Empty'
    ELSE 'Has data: ' || jsonb_keys(safety_checklist)::text
  END AS safety_status,
  CASE 
    WHEN equipment_checklist = '{}' THEN 'Empty'
    ELSE 'Has data: ' || jsonb_keys(equipment_checklist)::text
  END AS equipment_status,
  CASE 
    WHEN comfort_checklist = '{}' THEN 'Empty'
    ELSE 'Has data: ' || jsonb_keys(comfort_checklist)::text
  END AS comfort_status
FROM purchases
ORDER BY created_at DESC
LIMIT 10;
