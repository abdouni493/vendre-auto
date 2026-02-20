-- SQL Migration: Add purchase date/time to purchases table
-- This migration adds a new column to store the purchase date, hour, and minute

-- Add the purchase_datetime column to the purchases table
ALTER TABLE public.purchases
ADD COLUMN purchase_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- You can also add individual columns if you prefer to store them separately:
-- ALTER TABLE public.purchases
-- ADD COLUMN purchase_date DATE DEFAULT CURRENT_DATE;
-- ADD COLUMN purchase_hour INTEGER CHECK (purchase_hour >= 0 AND purchase_hour < 24);
-- ADD COLUMN purchase_minute INTEGER CHECK (purchase_minute >= 0 AND purchase_minute < 60);

-- If you want to make insurance and tech control optional (add NOT NULL constraint removal):
-- The columns insuranceExpiry, techControlDate, and insuranceCompany are already nullable
-- No changes needed if they are optional

-- Verify the columns in purchases table:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'purchases' 
-- ORDER BY ordinal_position;

-- Optional: Create an index on purchase_datetime for faster queries
CREATE INDEX idx_purchases_purchase_datetime 
ON public.purchases(purchase_datetime DESC);

-- Optional: Update existing records with current timestamp (if needed)
-- UPDATE public.purchases 
-- SET purchase_datetime = created_at 
-- WHERE purchase_datetime IS NULL;

-- ALTERNATIVE: If you want to store the data in separate columns
-- ALTER TABLE public.purchases
-- ADD COLUMN purchase_date DATE DEFAULT CURRENT_DATE;
-- ADD COLUMN purchase_time TIME WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- This allows queries like:
-- SELECT * FROM purchases WHERE purchase_date = '2026-02-20' AND EXTRACT(HOUR FROM purchase_time) = 14;
