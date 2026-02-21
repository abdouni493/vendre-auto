# Receipt Authentication Fix - Steps to Test

## Changes Made

### 1. **App.tsx - Fixed userId State Management**
- **Issue**: `userId` was not being set when localStorage had a saved role (early return prevented setting userId)
- **Fix**: Moved `supabase.auth.getSession()` to the top of `checkAuth()` so it always captures the user ID first, before checking localStorage
- **Added**: Session listener with `supabase.auth.onAuthStateChanged()` to keep userId in sync whenever user logs in/out

### 2. **Receipts.tsx - Added Debug Logging**
- Added console.log to track when userId prop is received
- Added console.log when creating/updating receipt to show the userId being sent
- Enhanced error messages to show actual error details

### 3. **FIX_RECEIPTS_RLS.sql - Clean RLS Policy Setup**
- Created new SQL file to drop and recreate RLS policies cleanly
- This ensures there are no duplicate policies causing issues

## Steps to Verify the Fix

### Step 1: Check App.tsx console output
1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Refresh the page and log in
5. **Look for**: Messages showing userId being captured (from the session listener)
6. **Expected**: You should see a message like `"Receipts component received userId: <some-uuid>"`

### Step 2: Try creating a receipt
1. Navigate to the Receipts section
2. Fill in the form (Name, Date, optional Note)
3. Click the "Créer" button
4. **Check the Console** (F12 → Console):
   - If successful: You'll see receipt creation logs
   - If error: You'll see "Error saving receipt: <error details>"

### Step 3: If still seeing "User not authenticated" error
1. Check console output from Step 1
2. If userId is `undefined` in console: The issue is in App.tsx session capture
3. If userId is shown correctly: The issue is in RLS policy - run FIX_RECEIPTS_RLS.sql in Supabase

## Running the RLS Fix (if needed)

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the contents of **FIX_RECEIPTS_RLS.sql**
4. Click "Run"
5. Try creating a receipt again

## What Each Change Does

### Change 1: Session Capture (App.tsx lines 45-80)
```typescript
// Now always called FIRST before localStorage check
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  setUserId(session.user.id);  // ← This now runs even with saved localStorage role
}
```

### Change 2: Session Listener (App.tsx lines 82-90)
```typescript
// Keeps userId in sync whenever auth state changes
supabase.auth.onAuthStateChanged((session) => {
  if (session?.user) {
    setUserId(session.user.id);
  } else {
    setUserId(null);
  }
});
```

### Change 3: Debug Logging (Receipts.tsx)
- Console will show the exact moment userId is received by the component
- Console will show what data is being sent when creating a receipt
- If there's an error, you'll see the actual error message

## Expected Behavior After Fix

1. ✅ User logs in → userId is captured from session
2. ✅ Receipts component receives userId prop
3. ✅ Form validates that userId is present
4. ✅ Receipt is created with created_by = userId
5. ✅ RLS policy allows insert because created_by matches auth.uid()
6. ✅ Receipt appears in the list

## Troubleshooting

**Console shows "userId: undefined"**
- Ensure you've logged in properly
- Check localStorage shows `autolux_role` is set
- Try logging out completely and logging back in

**Console shows userId but receipt won't save**
- Run FIX_RECEIPTS_RLS.sql to fix RLS policies
- Check Supabase dashboard to confirm RLS policies exist and are correct

**Still getting errors after FIX_RECEIPTS_RLS.sql**
- Check Supabase SQL editor for any error messages
- Verify receipts table exists: `SELECT * FROM public.receipts LIMIT 1;`
- Verify auth.users has a record matching your userId
