# Inspection Data Persistence - Debugging Guide

## What Was Fixed

1. **Added useEffect to load initialData**: When editing an existing purchase, the form now properly loads the inspection data from the database
2. **Added comprehensive console logging**: You can now see exactly what data is being saved and retrieved

---

## How to Debug the Issue

### Step 1: Open Browser Console
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Keep it open while testing

### Step 2: Create a New Purchase with Inspection Items

1. Click "🏷️ AJOUTER UN NOUVEAU VÉHICULE"
2. Fill in basic info (Make, Model, Year, etc.)
3. Scroll to "Contrôle d'Inspection (Check-In)"
4. Add a custom item to "CONTRÔLE SÉCURITÉ", e.g., "test"
5. Click the "➕ Add" button
6. You should see the item appear in a blue box

**What to look for in Console:**
```
✓ You should see: "test" checkbox with delete button (red X)
```

### Step 3: Save the Purchase

1. Click "Enregistrer le véhicule" button
2. **Check Console** - You should see logs like:

```
📝 Form data before save: { safety: { test: true }, ... }
🗄️ DB data being saved: { safety_checklist: { test: true }, ... }
🛡️ Safety checklist: { test: true }
```

**If you see these logs**, the data is being sent to the database correctly.

### Step 4: Refresh the Page

1. Press `F5` or `Ctrl+R` to refresh
2. **Check Console** - You should see:

```
🛡️ Loaded safety for [Vehicle Make] [Vehicle Model]: { test: true }
```

**If you see this**, the data was saved in the database and is being retrieved!

### Step 5: Edit the Purchase to Verify

1. Find your newly created purchase in the list
2. Click the "✏️ Modifier" button
3. Scroll to "Contrôle d'Inspection (Check-In)"
4. **Verify**: You should see "test" still checked in the blue box

---

## Expected Console Output

### On Save:
```
📝 Form data before save: { 
  make: "Toyota", 
  model: "Corolla", 
  safety: { test: true }, 
  equipment: {}, 
  comfort: {} 
}

🗄️ DB data being saved: { 
  make: "Toyota", 
  model: "Corolla", 
  safety_checklist: { test: true }, 
  equipment_checklist: {}, 
  comfort_checklist: {} 
}

🛡️ Safety checklist: { test: true }
🧰 Equipment checklist: {}
✨ Comfort checklist: {}
```

### On Fetch After Refresh:
```
🛡️ Loaded safety for Toyota Corolla: { test: true }
```

---

## If It's Still Not Working

### Check 1: Is the Data Being Sent?
- Look for the `🗄️ DB data being saved` log
- Check that `safety_checklist`, `equipment_checklist`, and `comfort_checklist` have the data

### Check 2: Did It Save to Database?
- Go to Supabase Dashboard → SQL Editor
- Run this query:
```sql
SELECT 
  id, 
  make, 
  model, 
  safety_checklist, 
  equipment_checklist, 
  comfort_checklist 
FROM purchases 
ORDER BY created_at DESC 
LIMIT 1;
```
- Check if the inspection columns have data (not `{}` or `null`)

### Check 3: Is It Being Retrieved?
- Refresh the page
- Check Console for the `🛡️ Loaded safety` log
- If you see it, the data is in the database

### Check 4: Is the Form Loading It?
- Click "Modifier" on a purchase you added inspection items to
- Check Console - should see the `useEffect` loading the initialData
- The form should populate with the inspection items

---

## Real-World Testing Scenario

```
1. Add new vehicle: "Nissan Altima"
2. Add safety items: ["Éclairages", "Pneus", "Freins"]
3. Save → Check console for "🛡️ Safety checklist: { Éclairages: true, Pneus: true, Freins: true }"
4. Refresh page → Check console for "🛡️ Loaded safety for Nissan Altima: ..."
5. Click Modify on the vehicle → See the items still there
6. Add another item "Horn" → See both old and new items
7. Save → All items persisted
8. Refresh again → All items still there
```

---

## Code Changes Made

### 1. Added useEffect for initialData
```typescript
useEffect(() => {
  if (initialData) {
    setFormData(initialData);
  }
}, [initialData]);
```
This ensures when editing, the form loads all saved inspection data from the database.

### 2. Enhanced Console Logging
- On save: Shows exact data being sent to database
- On fetch: Shows what data was retrieved from database
- Easy to spot where the issue is

---

## Next Steps

1. **Test** with the debugging guide above
2. **Check the console logs** to understand where the data is lost
3. **Report back** with the exact console logs you see
4. If needed, we can add more logging or investigate the database directly

---

## Quick SQL to Verify

Run in Supabase SQL Editor:
```sql
-- Check if your purchase has inspection data
SELECT 
  id,
  make,
  model,
  created_at,
  safety_checklist,
  equipment_checklist,
  comfort_checklist
FROM purchases
WHERE make IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

If the `safety_checklist`, `equipment_checklist`, and `comfort_checklist` columns show data like `{"test": true}`, the database is working correctly.
