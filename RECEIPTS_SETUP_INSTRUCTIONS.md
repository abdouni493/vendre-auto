# Receipts Feature - Setup Instructions

## CRITICAL: Execute SQL Migration in Supabase

The Receipts feature requires a database table to be created. Follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Copy and Paste SQL

Copy the entire content of `CREATE_RECEIPTS_TABLE.sql` and paste it into the SQL editor.

The SQL contains:
- Table creation with proper structure
- Indexes for performance
- Row Level Security (RLS) policies for security

### Step 3: Execute the Query
1. Click the **Run** button (or press Ctrl+Enter)
2. You should see: **"PostgreSQL query successful"**

### Step 4: Verify
Go to **Table Editor** and verify:
- ✅ A new table called `receipts` exists
- ✅ It has columns: id, name, receipt_date, note, created_by, created_at, updated_at
- ✅ RLS is enabled

## If You Get Errors

### Error: "Table already exists"
- This is fine - it means the table was already created
- No action needed

### Error: "relation 'profiles' does not exist"
- The code uses the `profiles` table to fetch user emails
- Make sure the `profiles` table exists in your Supabase project
- This table is typically created during Supabase setup

### Error: "permission denied"
- Make sure you're logged in as the Supabase project owner
- Check your authentication settings

### Error: 401/403 in App
- The SQL migration may not have been executed
- Follow the steps above to create the table

## Testing the Feature

1. Navigate to **📄 Reçus** in the sidebar
2. Click **✚ Créer un Reçu**
3. Fill in:
   - Nom: "Reçu Test"
   - Date: Today's date
   - Note: (optional)
4. Click **✚ Créer**
5. Receipt should appear below as a card

### If it fails:
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Verify SQL migration was executed in Supabase

## Print Function

Once receipts are created:
1. Click **🖨️ Imprimer** button on a receipt card
2. A new window opens showing the formatted receipt
3. Print dialog appears automatically
4. You can print to paper or save as PDF

## Features

✅ Create receipts with name, date, and optional note
✅ View all receipts in card format
✅ Edit existing receipts
✅ Delete receipts (only your own)
✅ Print professional receipts with showroom branding
✅ Signature and cachet spaces on printed receipt
✅ Row-level security - users can only edit/delete their own receipts

## Troubleshooting

If receipts don't appear after creating them:
1. Hard refresh browser (Ctrl+F5)
2. Check browser console for errors
3. Verify `receipts` table exists in Supabase
4. Check RLS policies are enabled

## SQL File Location
`CREATE_RECEIPTS_TABLE.sql` - in project root directory
