# Vehicle Expenses Feature - Implementation Guide

## Overview
A new "Dépenses Véhicules" (Vehicle Expenses) feature has been added to the Expenses module, allowing users to track costs associated with specific vehicles separately from general operating expenses.

## Features Implemented

### 1. **Dual Tab Interface**
- **Charges Générales** (General Expenses): Existing general expenses tracking
- **Dépenses Véhicules** (Vehicle Expenses): NEW - Vehicle-specific expense tracking

### 2. **Vehicle Expense Management**
- **Add Vehicle Expenses**: Click "+ Nouvelle Charge Véhicule" button
- **Vehicle Search**: Search vehicles by:
  - Make (Marque)
  - Model (Modèle)
  - License Plate (Plaque)
- **Expense Details**:
  - Vehicle selection (required)
  - Expense name/type (required)
  - Cost (required)
  - Date (required)
  - Note (optional)

### 3. **Display & Cards**
Vehicle expenses display on cards showing:
- Vehicle make and model with 🚗 emoji
- License plate number
- Expense date
- Expense name (type of charge)
- Cost in DA (Dinars Algériens)
- Optional note (if provided)
- Print button for invoice
- Edit and Delete buttons

### 4. **Edit & Delete Operations**
- **Edit**: Click ✏️ button to modify any field
- **Delete**: Click 🗑️ button to remove expense (with confirmation)
- Confirmation dialogs prevent accidental deletion

### 5. **Print Payment Invoices**
- Click 🖨️ "Imprimer Facture" button on any vehicle expense card
- Professional invoice template with:
  - Vehicle information (make, model, plate)
  - Expense type and date
  - Cost amount
  - Optional note
  - Print button for direct printing
- Opens in new window for print preview

## Database Schema

### SQL Migration File: `VEHICLE_EXPENSES_MIGRATION.sql`

**Table: `vehicle_expenses`**

```sql
Column Name          | Type                      | Description
---------------------|---------------------------|---------------------------
id                   | uuid (PK)                 | Primary key
vehicle_id           | uuid (FK)                 | Reference to purchases table
vehicle_name         | text                      | License plate
vehicle_make         | text                      | Vehicle make (BMW, Mercedes, etc.)
vehicle_model        | text                      | Vehicle model
name                 | text                      | Expense type (Vidange, Réparation, etc.)
cost                 | numeric                   | Amount in DA
date                 | date                      | Expense date
note                 | text (nullable)           | Additional notes
created_at           | timestamp with timezone   | Record creation timestamp
```

**Indexes Created**:
- `idx_vehicle_expenses_vehicle_id` - For vehicle lookups
- `idx_vehicle_expenses_date` - For date range queries
- `idx_vehicle_expenses_created_at` - For sorting

**Foreign Key Constraint**:
- References `purchases(id)` with ON DELETE CASCADE

**Row Level Security (RLS)**:
- All authenticated users can READ
- All authenticated users can INSERT
- All authenticated users can UPDATE
- All authenticated users can DELETE

## Component Updates

### `components/Expenses.tsx`
- Added `VehicleExpense` interface (defined inline)
- Added `activeTab` state for tab switching
- Added `vehicles` state to store available vehicles
- Added `fetchVehicles()` function to load vehicle list
- Added `handleVehicleExpenseSubmit()` for CRUD operations
- Added `printVehicleExpenseInvoice()` function
- Added `VehicleExpenseForm` component with:
  - Vehicle search/dropdown functionality
  - Form fields for expense details
  - Validation (vehicle required)
- Tab navigation UI with styling

### `types.ts`
- Added `VehicleExpense` interface:
  ```typescript
  export interface VehicleExpense {
    id: string;
    vehicle_id: string;
    vehicle_name: string;
    vehicle_make: string;
    vehicle_model: string;
    name: string;
    cost: number;
    date: string;
    note?: string;
    created_at?: string;
  }
  ```

## Installation Instructions

### Step 1: Run SQL Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content from `VEHICLE_EXPENSES_MIGRATION.sql`
3. Create a new query and paste the SQL code
4. Execute the query

This will:
- Create the `vehicle_expenses` table
- Add necessary indexes
- Set up Row Level Security policies

### Step 2: Deploy Updated Code
The components are already updated and ready:
- `components/Expenses.tsx` - Enhanced with vehicle expenses
- `types.ts` - Added `VehicleExpense` interface

Changes have been committed and pushed to GitHub repository.

## User Workflow

### Adding a Vehicle Expense
1. Navigate to Charges module
2. Click the "🚗 Dépenses Véhicules" tab
3. Click "+ Nouvelle Charge Véhicule" button
4. In the modal:
   - Click on vehicle dropdown
   - Search by make, model, or plate
   - Select the vehicle
   - Enter expense type (e.g., "Vidange", "Réparation")
   - Enter cost
   - Select date
   - Add optional note
5. Click "Enregistrer" to save

### Viewing Vehicle Expenses
1. Go to "🚗 Dépenses Véhicules" tab
2. All vehicle expenses display as cards
3. Each card shows:
   - Vehicle information
   - Expense details
   - Cost amount
   - Edit and delete buttons
   - Print invoice button

### Printing a Payment Invoice
1. Click "🖨️ Imprimer Facture" on any expense card
2. New window opens with formatted invoice
3. Review the invoice
4. Click print button in the invoice window OR use Ctrl+P
5. Select printer and print

### Editing Vehicle Expense
1. Click ✏️ button on the expense card
2. Modal opens with current data
3. Modify any field
4. Click "Enregistrer" to save changes

### Deleting Vehicle Expense
1. Click 🗑️ button on the expense card
2. Confirmation dialog appears
3. Click "OK" to confirm deletion
4. Card is removed from display

## Design & Styling

### Tab Navigation
- Rounded button design matching app theme
- Active tab shows cyan bottom border (#06b6d4)
- Smooth transitions between tabs

### Vehicle Expense Cards
- White cards with rounded corners (4rem border-radius)
- Hover effect: subtle shadow increase
- Card layout:
  - Vehicle info with emoji (top)
  - Expense type and date
  - Large red cost display
  - Optional note in italic
  - Green print button
  - Dark edit button + red delete button

### Form Modal
- Vehicle search dropdown with scrollable results
- Current selection confirmation badge
- Grid layout for cost/date fields
- Optional note textarea
- Standard modal styling with backdrop blur

### Invoice Template
- Professional layout
- Large title with emoji
- Information rows with labels
- Cyan highlighted total amount
- Optional note section
- Print button (hidden when printing)

## Color Scheme
- Primary: Cyan (#0891b2)
- Secondary: Dark Slate (#1e293b)
- Danger: Red (#ef4444)
- Success: Green (#16a34a)
- Background: White (#ffffff)

## Performance Considerations

1. **Indexes**: Three indexes optimize:
   - Vehicle lookups by ID
   - Date range queries
   - Sorting by creation date

2. **Foreign Key**: Automatic cascade delete if vehicle is removed

3. **RLS Policies**: Authenticated user-based access control

## Future Enhancements

Possible improvements for future versions:
- Vehicle expense reports/statistics
- Expense category filtering
- Recurring expenses support
- Budget alerts for vehicles
- Multi-currency support
- Export to PDF/Excel
- Bulk operations
- Vehicle maintenance history integration

## Troubleshooting

### Issue: "Aucun véhicule trouvé"
- **Cause**: No vehicles in database or search terms don't match
- **Solution**: Ensure vehicles exist in purchases table; try different search terms

### Issue: Vehicle dropdown not opening
- **Cause**: JavaScript error or button click not registered
- **Solution**: Refresh page or clear browser cache

### Issue: Print invoice not working
- **Cause**: Browser popup blocker enabled
- **Solution**: Allow popups for this website or use print preview option

### Issue: Saved expenses not showing
- **Cause**: Database not synced or wrong tab viewed
- **Solution**: Switch tabs or refresh page

## Git Commit Information

**Commit Hash**: 1206a98
**Commit Message**: "Add vehicle expenses feature with search, CRUD operations, and print invoices"

**Files Changed**:
- `components/Expenses.tsx` - Added vehicle expenses UI and logic
- `types.ts` - Added VehicleExpense interface
- `VEHICLE_EXPENSES_MIGRATION.sql` - Database schema creation

**Commit Date**: [Current Date]
**Repository**: https://github.com/abdouni493/vendre-auto.git

## Summary

The vehicle expenses feature is now fully implemented and deployed. Users can:
✅ Add vehicle-specific expenses with search functionality
✅ Track costs by vehicle make, model, and plate
✅ Edit and delete expenses easily
✅ Print professional payment invoices
✅ Maintain separate general expenses tracking

The database is ready to accept vehicle expense records with proper indexing and security policies.
