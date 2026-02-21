-- SQL Script to Fix Purchases Table Schema
-- Run this in your Supabase SQL Editor

-- 1. Check current columns in purchases table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
-- Add supplier_name column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255);

-- Add total_cost column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10, 2);

-- Add selling_price column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS selling_price NUMERIC(10, 2);

-- Add created_by column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add created_at column (if not exists)
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add purchase_date_time column (for purchase date/time)
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS purchase_date_time TIMESTAMP WITH TIME ZONE;

-- Add plate column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS plate VARCHAR(50);

-- Add is_sold column
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- 3. Verify all columns are now present
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;

-- 4. Create index on is_sold for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_is_sold 
ON public.purchases(is_sold);

-- 5. Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_purchases_created_at 
ON public.purchases(created_at DESC);

-- 6. Check a sample of the data
SELECT id, supplier_name, total_cost, selling_price, created_by, created_at 
FROM public.purchases 
LIMIT 10;
