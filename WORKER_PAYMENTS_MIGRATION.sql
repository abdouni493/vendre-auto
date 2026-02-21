-- SQL Script to Create Worker Payments Table
-- Run this in your Supabase SQL Editor

-- Create worker_payments table for tracking all worker payments
CREATE TABLE IF NOT EXISTS public.worker_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('advance', 'monthly', 'daily')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_by VARCHAR(255),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_worker_payments_worker_id 
ON public.worker_payments(worker_id);

CREATE INDEX IF NOT EXISTS idx_worker_payments_date 
ON public.worker_payments(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_worker_payments_type 
ON public.worker_payments(payment_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.worker_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view payments for their worker account
CREATE POLICY "Workers can view their own payments"
ON public.worker_payments FOR SELECT
USING (
  auth.uid() IS NOT NULL OR
  (SELECT id FROM public.workers WHERE username = current_user LIMIT 1) = worker_id
);

-- Create policy to allow authenticated users to insert their own payments
CREATE POLICY "Admins can insert payments"
ON public.worker_payments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to update payments
CREATE POLICY "Admins can update payments"
ON public.worker_payments FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to delete payments
CREATE POLICY "Admins can delete payments"
ON public.worker_payments FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Verify the table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'worker_payments' 
ORDER BY ordinal_position;

-- Insert sample data (optional - remove this after testing)
-- INSERT INTO public.worker_payments (worker_id, amount, payment_date, payment_type, description, created_by)
-- SELECT id, amount, now() - INTERVAL '5 days', 'monthly', 'Salaire du mois', 'admin'
-- FROM public.workers
-- WHERE role = 'worker'
-- LIMIT 1;
