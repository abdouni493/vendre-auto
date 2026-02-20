-- Create vehicle_expenses table
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL,
  vehicle_name text NOT NULL,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  name text NOT NULL,
  cost numeric NOT NULL,
  date date NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT fk_vehicle_expenses_vehicle FOREIGN KEY (vehicle_id) 
    REFERENCES public.purchases(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_vehicle_expenses_vehicle_id ON public.vehicle_expenses(vehicle_id);
CREATE INDEX idx_vehicle_expenses_date ON public.vehicle_expenses(date);
CREATE INDEX idx_vehicle_expenses_created_at ON public.vehicle_expenses(created_at);

-- Enable Row Level Security
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read vehicle expenses
CREATE POLICY "Allow authenticated users to read vehicle expenses"
  ON public.vehicle_expenses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow all authenticated users to insert vehicle expenses
CREATE POLICY "Allow authenticated users to insert vehicle expenses"
  ON public.vehicle_expenses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow all authenticated users to update vehicle expenses
CREATE POLICY "Allow authenticated users to update vehicle expenses"
  ON public.vehicle_expenses
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow all authenticated users to delete vehicle expenses
CREATE POLICY "Allow authenticated users to delete vehicle expenses"
  ON public.vehicle_expenses
  FOR DELETE
  USING (auth.role() = 'authenticated');
