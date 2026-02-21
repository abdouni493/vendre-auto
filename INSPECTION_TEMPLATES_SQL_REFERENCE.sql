-- ======================================================
-- INSPECTION TEMPLATES - QUICK REFERENCE SQL SNIPPETS
-- ======================================================

-- VIEW 1: Check all templates by type
SELECT 
  template_type,
  item_name,
  checked,
  is_active
FROM inspection_templates
ORDER BY template_type, item_name;

-- VIEW 2: Count templates by type (should be 7, 5, 2)
SELECT 
  template_type,
  COUNT(*) as count
FROM inspection_templates
WHERE is_active = true
GROUP BY template_type
ORDER BY template_type;

-- VIEW 3: View SAFETY checks only
SELECT item_name, checked
FROM inspection_templates
WHERE template_type = 'safety' AND is_active = true
ORDER BY item_name;

-- VIEW 4: View EQUIPMENT checks only
SELECT item_name, checked
FROM inspection_templates
WHERE template_type = 'equipment' AND is_active = true
ORDER BY item_name;

-- VIEW 5: View COMFORT checks only
SELECT item_name, checked
FROM inspection_templates
WHERE template_type = 'comfort' AND is_active = true
ORDER BY item_name;

-- ======================================================
-- MODIFY TEMPLATES
-- ======================================================

-- Add a new template (Safety example)
INSERT INTO inspection_templates (template_type, item_name, checked, created_by)
VALUES ('safety', 'Batterie', true, 'admin')
ON CONFLICT (template_type, item_name) DO NOTHING;

-- Add a new template (Equipment example)
INSERT INTO inspection_templates (template_type, item_name, checked, created_by)
VALUES ('equipment', 'Pare-brise', true, 'admin')
ON CONFLICT (template_type, item_name) DO NOTHING;

-- Disable a template (deactivate without deleting)
UPDATE inspection_templates
SET is_active = false
WHERE item_name = 'Klaxon';

-- Re-enable a template
UPDATE inspection_templates
SET is_active = true
WHERE item_name = 'Klaxon';

-- Rename a template
UPDATE inspection_templates
SET item_name = 'Nettoyage intérieur'
WHERE item_name = 'Nettoyage Premium' AND template_type = 'comfort';

-- Delete a template permanently
DELETE FROM inspection_templates
WHERE item_name = 'Test Item' AND template_type = 'safety';

-- ======================================================
-- VERIFY DATA
-- ======================================================

-- Check if all templates were created correctly
SELECT 
  CASE template_type
    WHEN 'safety' THEN '🛡️'
    WHEN 'equipment' THEN '🧰'
    WHEN 'comfort' THEN '✨'
  END as type,
  COUNT(*) as count
FROM inspection_templates
WHERE is_active = true
GROUP BY template_type;

-- Show all currently active templates in a formatted view
SELECT 
  CASE template_type
    WHEN 'safety' THEN '🛡️ Contrôle Sécurité'
    WHEN 'equipment' THEN '🧰 Dotation Bord'
    WHEN 'comfort' THEN '✨ État & Ambiance'
  END as category,
  item_name,
  '✓' as status
FROM inspection_templates
WHERE is_active = true
ORDER BY 
  CASE template_type
    WHEN 'safety' THEN 1
    WHEN 'equipment' THEN 2
    WHEN 'comfort' THEN 3
  END,
  item_name;

-- ======================================================
-- USEFUL QUERIES
-- ======================================================

-- Get total active templates
SELECT COUNT(*) as total_templates
FROM inspection_templates
WHERE is_active = true;

-- Get creation date range
SELECT 
  MIN(created_at) as earliest,
  MAX(created_at) as latest
FROM inspection_templates;

-- Check for duplicates (shouldn't be any)
SELECT template_type, item_name, COUNT(*)
FROM inspection_templates
GROUP BY template_type, item_name
HAVING COUNT(*) > 1;

-- Show all templates with full details
SELECT 
  id,
  template_type,
  item_name,
  checked,
  is_active,
  created_by,
  created_at
FROM inspection_templates
ORDER BY created_at DESC;
