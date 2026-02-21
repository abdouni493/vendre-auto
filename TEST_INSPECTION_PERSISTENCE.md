# ✅ Test Guide - Inspection Items Persistence

## Quick Test (5 minutes)

### Test 1: Add Custom Item
```
Step 1: Click "🏷️ Ajouter Achat" (Add Car)
Step 2: Scroll to "Contrôle Sécurité" (Safety section)
Step 3: In "Add custom safety check..." field, type: "Battery Check"
Step 4: Click "➕ Add"
Step 5: See "Battery Check" appear as new item ✓
Step 6: Scroll down and click "Enregistrer le véhicule" (Save)
Step 7: Expected: Car saved with "Battery Check" in inspection ✓
```

**Result:** ✅ PASS if saved successfully

---

### Test 2: Delete/Remove Item
```
Step 1: Click "🏷️ Ajouter Achat" (Add Car)
Step 2: Scroll to "Contrôle Sécurité" (Safety section)
Step 3: Find "Freins" checkbox
Step 4: Hover over it - see ✕ button appear
Step 5: Click ✕ button to delete it
Step 6: "Freins" disappears from list ✓
Step 7: Scroll down and click "Enregistrer le véhicule" (Save)
Step 8: Expected: Car saved WITHOUT "Freins" in inspection ✓
```

**Result:** ✅ PASS if saved correctly

---

### Test 3: Uncheck Item
```
Step 1: Click "🏷️ Ajouter Achat" (Add Car)
Step 2: Scroll to "Contrôle Sécurité" (Safety section)
Step 3: Find "Klaxon" checkbox - it's checked by default
Step 4: Click checkbox to uncheck it
Step 5: "Klaxon" now shows as unchecked ✓
Step 6: Scroll down and click "Enregistrer le véhicule" (Save)
Step 7: Expected: Car saved with "Klaxon" unchecked ✓
```

**Result:** ✅ PASS if unchecked state saved

---

### Test 4: Multiple Changes
```
Step 1: Click "🏷️ Ajouter Achat" (Add Car)
Step 2: Make multiple changes:
   - Uncheck: "Essuie-glaces" ✓
   - Uncheck: "Rétroviseurs" ✓
   - Add custom: "Suspension Check" ✓
   - Delete: "Klaxon" ✓
Step 3: Verify all changes visible in form
Step 4: Scroll down and click "Enregistrer le véhicule" (Save)
Step 5: Expected: All changes saved together ✓
```

**Result:** ✅ PASS if all changes saved

---

### Test 5: Create Second Car
```
Step 1: Create first car with modifications (use Test 4)
Step 2: Save car successfully ✓
Step 3: Click "🏷️ Ajouter Achat" again
Step 4: Scroll to "Contrôle Sécurité"
Step 5: Expected: See ALL 14 default items again ✓
Step 6: First car still has its modifications (unchanged)
Step 7: Create second car with different modifications
Step 8: Save second car
Step 9: Expected: Both cars keep their own inspection data ✓
```

**Result:** ✅ PASS if each car has independent data

---

## What Should Happen ✓

### When You Add/Delete Items:
```
Change Made → Visible in Form ✓ → Save → Saved in Database ✓
```

### When You Save Car:
```
Click "Enregistrer" → Car saved with inspection data ✓ → Form closes
```

### When You Open Form Again:
```
Click "Add Car" → Fresh templates load (all 14 items) ✓
```

### Previous Cars:
```
Keep their own inspection data independently ✓
```

---

## What Should NOT Happen ✗

❌ Changes disappear on refresh  
❌ Changes disappear when form is open  
❌ Next car loses previous car's data  
❌ Templates reload while editing  
❌ Items reappear after deletion  

---

## Full Test Checklist

| Test | Expected | Result |
|------|----------|--------|
| Add custom item | Appears in form | ✓ / ✗ |
| Delete item | Disappears from form | ✓ / ✗ |
| Uncheck item | Shows unchecked | ✓ / ✗ |
| Save car | All changes saved | ✓ / ✗ |
| Create new car | Fresh templates | ✓ / ✗ |
| Previous car intact | Data unchanged | ✓ / ✗ |

---

## Troubleshooting

### Issue: Changes disappear
**Solution:** You must SAVE before closing form. Changes only persist in memory until saved.

### Issue: Can't see custom item
**Solution:** Make sure you entered text and clicked "Add" button

### Issue: Delete button not showing
**Solution:** Hover over the item - delete button appears on hover

### Issue: Previous cars lost their data
**Solution:** This shouldn't happen. Check your saved cars in the purchase list.

---

## Browser Console (F12)

Look for this message:
```
📋 Templates loaded: {
  safetyChecks: {...},
  equipmentChecks: {...},
  comfortChecks: {...}
}
```

This should appear **ONCE** per form opening, not repeatedly.

---

## Success Indicators ✅

✅ Templates load when form opens  
✅ 14 items appear by default  
✅ Can add custom items  
✅ Can delete items  
✅ Can uncheck items  
✅ Changes visible in form  
✅ Save button works  
✅ Data persists in database  
✅ New car gets fresh templates  
✅ Old cars keep their data  

---

## Timeline

**Total Test Time:** 10-15 minutes

- Test 1: ~2 min
- Test 2: ~2 min
- Test 3: ~2 min
- Test 4: ~3 min
- Test 5: ~4 min

---

**Status:** Ready to test  
**Files Modified:** components/Purchase.tsx  
**Version:** 1.0  
**Date:** February 20, 2026
