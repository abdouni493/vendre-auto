-- SQL Migration: Add Inspection Checklist Data to Purchases Table
-- This migration adds columns to store custom inspection items

-- Add columns to store inspection data as JSONB (JSON binary format)
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS safety_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comfort_checklist JSONB DEFAULT '{}';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_safety_checklist 
ON public.purchases USING GIN (safety_checklist);

CREATE INDEX IF NOT EXISTS idx_purchases_equipment_checklist 
ON public.purchases USING GIN (equipment_checklist);

CREATE INDEX IF NOT EXISTS idx_purchases_comfort_checklist 
ON public.purchases USING GIN (comfort_checklist);

-- Verify the new columns are created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name IN ('safety_checklist', 'equipment_checklist', 'comfort_checklist')
ORDER BY ordinal_position;
