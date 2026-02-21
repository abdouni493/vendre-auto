-- Comprehensive Fix for Inspection Data Persistence
-- This script ensures the purchases table properly stores inspection checklists

-- 1. Add missing inspection columns if they don't exist
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS safety_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comfort_checklist JSONB DEFAULT '{}';

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_safety_checklist 
ON public.purchases USING GIN (safety_checklist);

CREATE INDEX IF NOT EXISTS idx_purchases_equipment_checklist 
ON public.purchases USING GIN (equipment_checklist);

CREATE INDEX IF NOT EXISTS idx_purchases_comfort_checklist 
ON public.purchases USING GIN (comfort_checklist);

-- 3. Verify the columns exist and have correct data type
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name IN ('safety_checklist', 'equipment_checklist', 'comfort_checklist')
ORDER BY column_name;

-- 4. Check for any existing purchases with inspection data
SELECT 
  id,
  make,
  model,
  safety_checklist,
  equipment_checklist,
  comfort_checklist,
  created_at
FROM public.purchases
WHERE 
  safety_checklist IS NOT NULL 
  OR equipment_checklist IS NOT NULL 
  OR comfort_checklist IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Optional: View all purchases to verify structure
SELECT 
  id,
  make,
  model,
  year,
  created_at
FROM public.purchases
ORDER BY created_at DESC
LIMIT 5;
