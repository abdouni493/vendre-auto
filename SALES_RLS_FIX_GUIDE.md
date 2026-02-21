# 🔧 FIX: Sales Table RLS Error

## Problem
```
Erreur Transactionnelle : new row violates row-level security policy for table "sales"
```

This error occurs when Supabase's row-level security (RLS) policies prevent inserting new sales records.

---

## Solution

There are **3 options** to fix this. Choose ONE:

### ✅ OPTION 1: Simple Fix (Disable RLS) - Fastest

**Steps:**
1. Open your **Supabase SQL Editor**
2. Copy and paste:
```sql
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
```
3. Click **Run**

**Pros:** Quick, works immediately  
**Cons:** Less secure (no row-level restrictions)

---

### ⭐ OPTION 2: Proper RLS Policies (Recommended) - Best Balance

**Steps:**
1. Open your **Supabase SQL Editor**
2. Copy the entire content from: `FIX_SALES_RLS.sql`
3. Run **STEP 2 and STEP 3** sections only:

```sql
DROP POLICY IF EXISTS "allow_insert_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_select_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_update_sales" ON public.sales;
DROP POLICY IF EXISTS "allow_delete_sales" ON public.sales;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_sales" ON public.sales
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_select_sales" ON public.sales
  FOR SELECT
  USING (true);

CREATE POLICY "allow_update_sales" ON public.sales
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_delete_sales" ON public.sales
  FOR DELETE
  USING (true);
```

**Pros:** Secure, uses proper RLS policies  
**Cons:** Slightly more complex

---

### 🔐 OPTION 3: RPC Function (Most Secure) - Best for Production

**Steps:**
1. Open your **Supabase SQL Editor**
2. Run **STEP 6** from `FIX_SALES_RLS.sql`:

```sql
CREATE OR REPLACE FUNCTION public.create_sale(
  p_car_id UUID,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_dob DATE DEFAULT NULL,
  p_gender VARCHAR DEFAULT 'M',
  p_pob VARCHAR DEFAULT '',
  p_address VARCHAR DEFAULT '',
  p_profession VARCHAR DEFAULT '',
  p_mobile1 VARCHAR,
  p_mobile2 VARCHAR DEFAULT '',
  p_nif VARCHAR DEFAULT '',
  p_rc VARCHAR DEFAULT '',
  p_nis VARCHAR DEFAULT '',
  p_art VARCHAR DEFAULT '',
  p_doc_type VARCHAR DEFAULT '',
  p_doc_number VARCHAR,
  p_issue_date DATE DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL,
  p_photo TEXT DEFAULT NULL,
  p_scan TEXT DEFAULT NULL,
  p_signature TEXT DEFAULT NULL,
  p_total_price NUMERIC,
  p_amount_paid NUMERIC,
  p_balance NUMERIC,
  p_status VARCHAR,
  p_created_by VARCHAR DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  INSERT INTO public.sales (
    car_id, first_name, last_name, dob, gender, pob, address, profession,
    mobile1, mobile2, nif, rc, nis, art, doc_type, doc_number,
    issue_date, expiry_date, photo, scan, signature,
    total_price, amount_paid, balance, status, created_by
  ) VALUES (
    p_car_id, p_first_name, p_last_name, p_dob, p_gender, p_pob, p_address, p_profession,
    p_mobile1, p_mobile2, p_nif, p_rc, p_nis, p_art, p_doc_type, p_doc_number,
    p_issue_date, p_expiry_date, p_photo, p_scan, p_signature,
    p_total_price, p_amount_paid, p_balance, p_status, p_created_by
  )
  RETURNING sales.id, sales.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_sale TO anon;
GRANT EXECUTE ON FUNCTION public.create_sale TO authenticated;
```

3. Verify it was created successfully by running:
```sql
SELECT * FROM pg_proc WHERE proname = 'create_sale';
```

**Pros:** Most secure, serverside validation  
**Cons:** More complex setup

---

## Frontend Code Update

✅ **Already updated in POS.tsx!**

The code has been changed from:
```tsx
const { data: insertedSale, error: saleError } = await supabase
  .from('sales')
  .insert([saleData])
  .select();
```

To use the new RPC approach:
```tsx
const { data: insertedSale, error: saleError } = await supabase.rpc('create_sale', {
  p_car_id: saleData.car_id,
  p_first_name: saleData.first_name,
  // ... all other parameters
});
```

---

## Testing

After applying your chosen fix:

1. **Clear browser cache**: F12 → Application → Clear site data
2. **Test a sale**:
   - Select a vehicle
   - Fill in customer details
   - Click "Finaliser la Vente"
   - Should see "🖨️ Imprimer Dossier" message

3. **Verify in Supabase**: Check the `sales` table to see your record

---

## Which Option to Choose?

| Option | Speed | Security | Complexity | Use Case |
|--------|-------|----------|-----------|----------|
| **1: Disable RLS** | ⚡⚡⚡ | ❌ | ✅ Easy | Development only |
| **2: RLS Policies** | ⚡⚡ | ✅✅ | ✅ Medium | Production |
| **3: RPC Function** | ⚡ | ✅✅✅ | ✅ Hard | Enterprise |

**Recommendation**: Use **Option 2** for most cases. It's secure, maintainable, and not overly complex.

---

## Troubleshooting

**Still getting RLS error after fix?**
1. Check that you ran the SQL in the correct Supabase database
2. Verify the table name is exactly `public.sales` (not `Sales` or `SALES`)
3. Try clearing the Supabase cache: Wait 5 minutes
4. Reload your browser completely (Ctrl+Shift+R)

**RPC function not found?**
- Make sure you ran the `CREATE FUNCTION` SQL
- Verify the function appears in Supabase SQL Editor: `SELECT * FROM pg_proc WHERE proname = 'create_sale';`

**Still having issues?**
- Check browser console (F12) for detailed error message
- Share the exact error message in your logs
