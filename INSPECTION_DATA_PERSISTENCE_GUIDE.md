# Inspection Checklist Data Persistence - Setup Guide

## Problem Fixed
When adding custom inspection items (Contrôle d'Inspection) to a purchase and refreshing the page, the items were lost because they weren't being saved to the database.

## Solution Overview
Added three JSONB columns to the `purchases` table to store custom inspection data:
- `safety_checklist` - Stores custom safety checks (lights, tires, etc.)
- `equipment_checklist` - Stores custom equipment items (spare wheel, jack, etc.)
- `comfort_checklist` - Stores custom comfort items (AC, cleanliness, etc.)

---

## SQL Code to Run in Supabase

Copy and paste this SQL code into your Supabase SQL Editor:

```sql
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
```

---

## What Changed in the Code

### 1. Database Saving (Purchase.tsx - handleSave function)
Now includes inspection data when saving:
```typescript
const dbData = {
  // ... other fields ...
  safety_checklist: data.safety || {},
  equipment_checklist: data.equipment || {},
  comfort_checklist: data.comfort || {}
};
```

### 2. Data Retrieval (Purchase.tsx - fetchPurchases function)
Now retrieves inspection data from the database:
```typescript
const normalizedData = (data || []).map((p: any) => ({
  // ... other fields ...
  safety: p.safety_checklist || {},
  equipment: p.equipment_checklist || {},
  comfort: p.comfort_checklist || {}
}));
```

---

## Data Format Examples

### Safety Checklist (JSON)
```json
{
  "Éclairages": true,
  "Pneus": true,
  "Freins": true,
  "Custom Check": false
}
```

### Equipment Checklist (JSON)
```json
{
  "Roue de Secours": true,
  "Cric & Clés": true,
  "My Custom Item": false
}
```

### Comfort Checklist (JSON)
```json
{
  "Climatisation OK": true,
  "Custom Comfort": true
}
```

---

## How to Use

1. **Add Inspection Items**: In the Purchase form, use the "Add custom..." inputs to add inspection items
2. **Save**: Click "Enregistrer" to save the purchase with all inspection data
3. **Refresh**: Refresh the page - the inspection items will persist in the database
4. **Edit**: Click "Modifier" on any purchase to see all previously added inspection items

---

## Testing

After running the SQL and deploying the code:

1. Create a new purchase record
2. Add custom inspection items to the three sections
3. Save the purchase
4. Refresh the page
5. Click "Modifier" on the purchase you just created
6. Verify that all your custom inspection items are still there

---

## Database Verification Query

To verify the columns were created correctly, run this query in Supabase:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name LIKE '%checklist'
ORDER BY column_name;
```

Expected output:
- `comfort_checklist` | `jsonb` | `YES`
- `equipment_checklist` | `jsonb` | `YES`
- `safety_checklist` | `jsonb` | `YES`

---

## Files Modified

1. **components/Purchase.tsx**
   - Updated `handleSave()` to save inspection data
   - Updated `fetchPurchases()` to retrieve inspection data
   - Form already supports adding/editing inspection items

2. **ADD_INSPECTION_DATA.sql** (new file)
   - Contains the SQL migration script

---

## Notes

- JSONB format is optimal for JSON data in PostgreSQL (Supabase)
- Indexes are created for better query performance
- The data is fully backward compatible - existing purchases will have empty checklists
- Custom items are now fully persistent across page refreshes and edits
