-- ==============================
-- INSPECTION TEMPLATES SYSTEM
-- ==============================
-- This creates a system to store reusable inspection templates
-- so users can save inspection checks once and reuse them across all new cars

-- 1. Create inspection_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL CHECK (template_type IN ('safety', 'equipment', 'comfort')),
  item_name TEXT NOT NULL,
  checked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(template_type, item_name)
);

-- 2. Enable Row Level Security (if not already enabled)
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for inspection_templates
DROP POLICY IF EXISTS "Enable all access to inspection_templates" ON inspection_templates;
CREATE POLICY "Enable all access to inspection_templates" ON inspection_templates
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================
-- INSERT PREDEFINED TEMPLATES
-- ==============================

-- SAFETY CHECKS (Contrôle Sécurité)
INSERT INTO inspection_templates (template_type, item_name, checked, created_by)
VALUES 
  ('safety', 'Feux et phares', true, 'system'),
  ('safety', 'Pneus (usure/pression)', true, 'system'),
  ('safety', 'Freins', true, 'system'),
  ('safety', 'Essuie-glaces', true, 'system'),
  ('safety', 'Rétroviseurs', true, 'system'),
  ('safety', 'Ceintures', true, 'system'),
  ('safety', 'Klaxon', true, 'system')
ON CONFLICT (template_type, item_name) DO UPDATE SET
  checked = true,
  is_active = true;

-- EQUIPMENT CHECKS (Dotation Bord)
INSERT INTO inspection_templates (template_type, item_name, checked, created_by)
VALUES 
  ('equipment', 'Roue de secours', true, 'system'),
  ('equipment', 'Cric', true, 'system'),
  ('equipment', 'Triangles signalisation', true, 'system'),
  ('equipment', 'Trousse de secours', true, 'system'),
  ('equipment', 'Documents véhicule', true, 'system')
ON CONFLICT (template_type, item_name) DO UPDATE SET
  checked = true,
  is_active = true;

-- COMFORT CHECKS (État & Ambiance)
INSERT INTO inspection_templates (template_type, item_name, checked, created_by)
VALUES 
  ('comfort', 'Climatisation OK', true, 'system'),
  ('comfort', 'Nettoyage Premium', true, 'system')
ON CONFLICT (template_type, item_name) DO UPDATE SET
  checked = true,
  is_active = true;

-- ==============================
-- VERIFY THE DATA
-- ==============================

-- Check all inserted templates
SELECT 
  template_type,
  item_name,
  checked,
  is_active,
  created_at
FROM inspection_templates
ORDER BY template_type, item_name;

-- Count by type
SELECT 
  template_type,
  COUNT(*) as count
FROM inspection_templates
WHERE is_active = true
GROUP BY template_type
ORDER BY template_type;
