# 🚗 VEHICLE EXPENSES - QUICK ACTION REFERENCE CARD

## 🎯 ONE-PAGE QUICK GUIDE

### START HERE (First Time Setup)
```
1. Open Supabase Dashboard
2. Go to: SQL Editor → New Query
3. Copy-paste: VEHICLE_EXPENSES_MIGRATION.sql
4. Click: Execute
5. Done! ✅
```

---

## 💡 USER ACTIONS

### Adding a Vehicle Expense
| Step | Action |
|------|--------|
| 1 | Go to Charges module |
| 2 | Click "🚗 Dépenses Véhicules" tab |
| 3 | Click "+ Nouvelle Charge Véhicule" |
| 4 | Click vehicle dropdown |
| 5 | Search: type make/model/plate |
| 6 | Click vehicle to select |
| 7 | Enter expense type (Vidange, etc) |
| 8 | Enter cost amount |
| 9 | Select date |
| 10 | Add note (optional) |
| 11 | Click "Enregistrer" |
| ✅ | Expense saved & displayed |

### Viewing Expenses
| Step | Action |
|------|--------|
| 1 | Go to "🚗 Dépenses Véhicules" tab |
| 2 | All expenses display as cards |
| 3 | Each card shows vehicle & expense info |

### Printing Invoice
| Step | Action |
|------|--------|
| 1 | Find expense card |
| 2 | Click "🖨️ Imprimer Facture" button |
| 3 | New window opens with invoice |
| 4 | Click print button or Ctrl+P |
| 5 | Select printer |
| 6 | ✅ Done! |

### Editing Expense
| Step | Action |
|------|--------|
| 1 | Click ✏️ button on card |
| 2 | Modal opens with current data |
| 3 | Update any field |
| 4 | Click "Enregistrer" |
| 5 | ✅ Changes saved |

### Deleting Expense
| Step | Action |
|------|--------|
| 1 | Click 🗑️ button on card |
| 2 | Confirm in dialog |
| 3 | ✅ Deleted |

---

## 🗂️ DATA FIELDS

### What You Enter:
```
Vehicle:        [BMW 320i] (required)
Expense Type:   [Vidange] (required)
Cost:           [5000] (required)
Date:           [2024-01-15] (required)
Note:           [Oil change 10W40] (optional)
```

### What Gets Stored:
```
vehicle_id       ← Links to vehicle
vehicle_name     ← Plate number
vehicle_make     ← BMW, Mercedes, Toyota
vehicle_model    ← 320i, C-Class, Corolla
name             ← Expense type
cost             ← Amount in DA
date             ← Expense date
note             ← Your notes
created_at       ← Auto-timestamp
```

---

## 🖱️ BUTTON REFERENCE

| Button | Icon | Action |
|--------|------|--------|
| Add | ➕ | Open form to add new expense |
| Print | 🖨️ | Generate & print invoice |
| Edit | ✏️ | Modify expense details |
| Delete | 🗑️ | Remove expense (confirm) |
| Tab | 💰 | View general expenses |
| Tab | 🚗 | View vehicle expenses |

---

## 🎨 INTERFACE ELEMENTS

### Tabs
```
[💰 Charges Générales] [🚗 Dépenses Véhicules]
                         ^ Click this tab
```

### Buttons
```
[+ Nouvelle Charge Véhicule] ← Click to add
```

### Cards
```
┌─────────────────────────┐
│ 🚗 BMW 320i             │ ← Vehicle
│ Plaque: 16-AB-5689      │ ← Plate
│ 2024-01-15              │ ← Date
│ Vidange                 │ ← Type
│ 5,000 DA                │ ← Cost
│ 📝 Oil change 10W40     │ ← Note (optional)
│ [🖨️] [✏️] [🗑️]           │ ← Actions
└─────────────────────────┘
```

### Search Dropdown
```
[Cliquez pour rechercher...]  ← Click to open
↓
[___BMW_________________]  ← Type to search
├─ BMW 320i (16-AB-5689)
├─ BMW 530i (16-AB-5690)
└─ BMW X5 (16-AB-5691)
```

---

## 📋 FORM MODAL

```
┌──────────────────────────────────┐
│  Nouvelle Charge Véhicule       │
├──────────────────────────────────┤
│                                  │
│ 🚗 Sélectionnez un Véhicule     │
│ [Vehicle Dropdown]               │
│                                  │
│ ✅ BMW 320i - 16-AB-5689        │
│                                  │
│ Type de Charge                   │
│ [________]                       │
│                                  │
│ Montant          Date            │
│ [_______]   [__________]         │
│                                  │
│ 📝 Note (Optionnelle)            │
│ [____________________]           │
│                                  │
│        [Annuler] [Enregistrer]  │
└──────────────────────────────────┘
```

---

## 🖨️ INVOICE EXAMPLE

```
┌──────────────────────────────────┐
│   📋 Facture Dépense Véhicule    │
│   Mercredi, 15 janvier 2024      │
├──────────────────────────────────┤
│ 🚗 Véhicule:      BMW 320i       │
│ 📌 Plaque:        16-AB-5689     │
│ 📝 Type:          Vidange        │
│ 📅 Date:          15/01/2024     │
├──────────────────────────────────┤
│ Montant: 5,000.00 DA             │
├──────────────────────────────────┤
│ Note: Oil change 10W40           │
├──────────────────────────────────┤
│     [🖨️ Imprimer]                 │
└──────────────────────────────────┘
```

---

## 🔍 SEARCH TIPS

### Search by Make
```
Type: BMW
Results: All BMW vehicles
```

### Search by Model
```
Type: 320i
Results: All 320i models (any brand)
```

### Search by Plate
```
Type: 16-AB-5689
Results: Exact vehicle match
```

### Partial Search
```
Type: AB
Results: All vehicles with AB in plate
```

---

## 📊 COST EXAMPLES

| Expense Type | Typical Cost | Notes |
|--------------|--------------|-------|
| Vidange | 5,000 DA | Oil change |
| Réparation | 10,000-50,000 DA | Varies widely |
| Assurance | 20,000-100,000 DA | Annual or monthly |
| Contrôle | 3,000-5,000 DA | Technical control |
| Pneus | 15,000-30,000 DA | Per tire or set |
| Carburant | 2,000-5,000 DA | Per fill |

---

## ⚡ KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| Tab | Move between fields |
| Enter | Submit form |
| Esc | Close modal |
| Ctrl+P | Print (from invoice) |

---

## ✅ VALIDATION RULES

| Field | Rule | Error |
|-------|------|-------|
| Vehicle | Must select | Alert shown |
| Type | Must enter | Empty field blocked |
| Cost | Must enter number | Numbers only |
| Date | Must select | Calendar required |
| Note | Optional | Leave empty if not needed |

---

## 🚨 IMPORTANT NOTES

### ⚠️ Before Adding Expense
- Vehicle must exist in database
- Cost must be numeric (5000, not 5,000)
- Date format handled by calendar

### ⚠️ Before Deleting
- Confirmation dialog appears
- Action is permanent
- No undo button

### ⚠️ Before Printing
- Ensure printer is ready
- Preview opens in new window
- Click print button to print

---

## 🎓 COMMON SCENARIOS

### Scenario: Add Oil Change for BMW
```
1. Click "+ Nouvelle Charge Véhicule"
2. Search: "BMW"
3. Select: "BMW 320i"
4. Type: "Vidange"
5. Cost: "5000"
6. Date: "2024-01-15"
7. Note: "SAE 10W40"
8. Click "Enregistrer"
9. ✅ Done!
```

### Scenario: Print Last Expense
```
1. Find latest expense card
2. Click "🖨️ Imprimer Facture"
3. New window opens
4. Review invoice
5. Click "🖨️ Imprimer"
6. Select printer
7. ✅ Printed!
```

### Scenario: Correct Wrong Amount
```
1. Click ✏️ on wrong expense
2. Change amount in form
3. Click "Enregistrer"
4. ✅ Updated!
```

---

## 📂 FILE LOCATIONS

| File | Purpose |
|------|---------|
| Expenses.tsx | Component code |
| types.ts | TypeScript definitions |
| VEHICLE_EXPENSES_MIGRATION.sql | Database setup |
| VEHICLE_EXPENSES_GUIDE.md | Full documentation |
| VEHICLE_EXPENSES_QUICKREF.md | Quick reference |
| IMPLEMENTATION_CHECKLIST.md | Setup checklist |

---

## 🎯 TROUBLESHOOTING QUICK FIX

| Problem | Solution |
|---------|----------|
| No vehicles showing | Ensure vehicles exist in purchases table |
| Can't print | Check popup blocker, allow popups |
| Expense not saving | Check all required fields filled |
| Can't find vehicle | Try different search terms |
| Modal not closing | Click "Annuler" button |
| Delete won't work | Confirm in dialog box |

---

## ✨ FEATURES AT A GLANCE

```
✅ Search vehicles by make/model/plate
✅ Add vehicle expenses with details
✅ Edit existing expenses
✅ Delete with confirmation
✅ Display on professional cards
✅ Print payment invoices
✅ Optional notes field
✅ Automatic timestamps
✅ Data validation
✅ Secure with RLS
✅ Responsive design
✅ Mobile friendly
```

---

## 🎊 YOU'RE ALL SET!

### Ready to go? Follow this:
1. ✅ Run SQL migration
2. ✅ Reload page
3. ✅ Go to Expenses
4. ✅ Click "🚗 Dépenses Véhicules" tab
5. ✅ Click "+ Nouvelle Charge Véhicule"
6. ✅ Start adding expenses!

**Questions?** See `VEHICLE_EXPENSES_GUIDE.md`

---

**Status**: READY TO USE ✨
**Version**: 1.0.0
