-- Create receipts table for managing invoice receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  receipt_date DATE NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_receipts_created_by ON receipts(created_by);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all receipts
CREATE POLICY "receipts_select_policy" ON receipts
  FOR SELECT
  USING (true);

-- Allow authenticated users to create receipts
CREATE POLICY "receipts_insert_policy" ON receipts
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Allow users to update their own receipts
CREATE POLICY "receipts_update_policy" ON receipts
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Allow users to delete their own receipts
CREATE POLICY "receipts_delete_policy" ON receipts
  FOR DELETE
  USING (created_by = auth.uid());
