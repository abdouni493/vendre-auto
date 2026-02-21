# ⚡ Quick Setup Guide - Inspection Templates

## 🚀 What You Need to Do

### Step 1: Run the SQL Script (5 minutes)
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy the entire content from `INSERT_INSPECTION_TEMPLATES.sql`
4. Paste and execute it
5. You should see success messages

### Step 2: Verify It Works (1 minute)
1. In Supabase, run this query:
```sql
SELECT COUNT(*) as total_templates FROM inspection_templates WHERE is_active = true;
```
Should show: **14 templates**

### Step 3: Test in the App (2 minutes)
1. Refresh your app or restart it
2. Go to Purchase section → Click "🏷️ Ajouter Achat"
3. Scroll to "Contrôle d'Inspection" section
4. You should see all the pre-filled checkboxes:
   - 7 safety checks (blue)
   - 5 equipment checks (green)
   - 2 comfort checks (purple)
5. Save a test car to confirm it works

---

## 📋 What Changed

### ✅ Added
- Database table: `inspection_templates`
- 14 predefined inspection templates
- Auto-loading templates in Purchase form

### ❌ Removed
- "🗝️ Inspection Flotte" from sidebar menu (admin & worker)

---

## 🎯 How Users Will Experience It

**Before this change:**
- Empty inspection forms every time
- Manual entry each time
- Inconsistent checks

**After this change:**
- Templates pre-filled automatically
- All 14 items ready to use
- Just uncheck what doesn't apply
- Quick and consistent

---

## 📍 Files Changed

| File | What Changed |
|------|--------------|
| `INSERT_INSPECTION_TEMPLATES.sql` | ✨ NEW - Database setup |
| `components/Purchase.tsx` | ✏️ Added template loading |
| `components/Sidebar.tsx` | ✏️ Removed checkin item |

---

## ⚠️ Important Notes

- Existing cars keep their saved inspection data
- Only affects NEW cars created going forward
- Templates can be modified in database anytime
- Users can still add custom items per car

---

## 📞 Need Help?

**Q: Templates not showing?**  
A: Ensure SQL script was executed successfully

**Q: Want to add more templates?**  
A: Add rows to `inspection_templates` table with `is_active = true`

**Q: Want to remove a template?**  
A: Update that row to `is_active = false`

**Q: How to edit a template name?**  
A: Update the `item_name` field in the database

---

**Status: ✅ Ready to use**  
**Last Updated: February 20, 2026**
