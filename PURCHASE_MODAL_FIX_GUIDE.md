# Purchase Details Modal Fix - Database Schema Issue

## Problem Identified

The Purchase Details Modal is displaying 0 DA for all financial values, and not showing:
- Supplier Name
- Creator Username
- Registration Date

This is because the database table `purchases` is missing the following columns:
- `supplier_name` (currently stored in a separate suppliers table)
- `total_cost` (the purchase cost)
- `selling_price` (the showroom selling price)
- `created_by` (the user who created the record)
- `created_at` (the registration timestamp)

## Solution Steps

### Step 1: Run the Schema Migration SQL

The file `FIX_PURCHASES_SCHEMA.sql` has been created with all necessary SQL commands.

**How to run it:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to the SQL Editor
3. Click "New Query"
4. Copy and paste the entire content from `FIX_PURCHASES_SCHEMA.sql`
5. Click "Run" button
6. Verify that all tables and columns are created successfully

### Step 2: Populate Missing Data (if needed)

If your `purchases` table already has data but is missing the new columns, you may need to:

```sql
-- Update supplier_name from suppliers table
UPDATE public.purchases p
SET supplier_name = s.name
FROM public.suppliers s
WHERE p.supplier_id = s.id AND p.supplier_name IS NULL;

-- If you want to set created_by to the current user
UPDATE public.purchases
SET created_by = 'Admin' 
WHERE created_by IS NULL;

-- If you want to set created_at to the current timestamp
UPDATE public.purchases
SET created_at = now() 
WHERE created_at IS NULL;
```

### Step 3: Verify the Changes

After running the migration, you can verify the schema:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
ORDER BY ordinal_position;
```

### Step 4: Test the Application

1. Refresh your browser (or restart the development server)
2. Navigate to the Purchase/Sales section
3. Try adding a new purchase with all the financial details
4. Click the "👁️ Détails" button to open the details modal
5. Verify that:
   - ✅ Financial information shows correct amounts (not 0 DA)
   - ✅ Supplier Name displays properly
   - ✅ Creator information appears
   - ✅ Registration date shows correctly

## What Was Fixed in the Code

### Purchase.tsx Changes:
1. **Added debug logging** to fetchPurchases() and PurchaseDetailsModal to show what data is being received
2. **Added null-safe data extraction** in the modal:
   - `totalCost` falls back to `total_cost` column or 0
   - `sellingPrice` falls back to `selling_price` column or 0
   - `supplierName` falls back to `supplier_name` column or 'N/A'
   - `createdBy` falls back to `created_by` column or 'N/A'
3. **Created Creation Info Section** in the modal displaying:
   - Creator name (👤 Créé par)
   - Registration date (📅 Date d'Ajout)

### types.ts Changes:
- Added `created_at?: string` to the PurchaseRecord interface to match database column

## Debug Information

If data still doesn't show after the migration, check the browser console:
- Look for "Raw database purchases:" log to see what the database is returning
- Look for "Normalized purchases:" log to see the transformed data
- Look for "PurchaseDetailsModal received:" log to see what the modal receives

If you see `null` or `undefined` values in these logs, it means:
1. The columns don't exist in the database yet
2. The data hasn't been saved with the new columns
3. The column names don't match what the code expects

## Expected Column Names in Database

```
- id (UUID, Primary Key)
- supplier_id (Foreign Key to suppliers)
- supplier_name (TEXT - newly added)
- make (TEXT - car brand)
- model (TEXT - car model)
- plate (VARCHAR - license plate)
- year (TEXT - manufacture year)
- color (TEXT - car color)
- vin (TEXT - chassis number)
- fuel (ENUM - 'essence' or 'diesel')
- transmission (ENUM - 'manuelle' or 'auto')
- seats (INTEGER)
- doors (INTEGER)
- mileage (INTEGER - in KM)
- insurance_expiry (TIMESTAMP - insurance expiration)
- tech_control_date (TIMESTAMP - technical inspection date)
- insurance_company (TEXT)
- photos (JSONB ARRAY - photo URLs)
- total_cost (NUMERIC - purchase cost)
- selling_price (NUMERIC - showroom sale price)
- purchase_date_time (TIMESTAMP - when purchased)
- created_at (TIMESTAMP - when record was created)
- created_by (TEXT - who created the record)
- is_sold (BOOLEAN - whether vehicle is sold)
- updated_at (TIMESTAMP - last update time, usually auto-generated)
```

## Common Issues & Solutions

### Issue 1: "Could not find the 'created_by' column"
**Solution:** The migration SQL wasn't executed. Run `FIX_PURCHASES_SCHEMA.sql` in Supabase SQL Editor.

### Issue 2: Modal shows "N/A" for supplier or creator
**Reason:** The data hasn't been saved with these values yet. New purchases will include them automatically.
**To fix old records:** Run the UPDATE statements in Step 2 above.

### Issue 3: Financial amounts still show 0 DA
**Reason:** The form or database doesn't have `total_cost` and `selling_price` saved.
**Solution:** 
1. Verify the columns were added (Step 3)
2. Check that the form is saving these fields (look in browser console for "Saving purchase data:" log)
3. Verify the database has these values saved (check Supabase Data Editor)

### Issue 4: Browser console shows "toLocaleString() is not a function"
**Reason:** The value is undefined instead of a number
**Status:** This should now be fixed with the null-safe fallbacks added to the code

## Testing Checklist

- [ ] Run FIX_PURCHASES_SCHEMA.sql in Supabase
- [ ] Verify all columns exist in the database
- [ ] Clear browser cache (Ctrl+Shift+Delete) and refresh
- [ ] Create a new purchase record
- [ ] Check browser console for debug logs
- [ ] Click "👁️ Détails" button on a purchase card
- [ ] Verify all financial information displays correctly
- [ ] Verify supplier name is shown
- [ ] Verify creator information is displayed
- [ ] Verify registration date is shown
