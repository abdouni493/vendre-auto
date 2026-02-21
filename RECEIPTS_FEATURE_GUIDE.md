# Receipts Management System - Implementation Guide

## Overview
A complete receipts management system has been added to the showroom management application. This allows users to create, manage, and print professional receipts with showroom branding.

## Features

### 1. Create Receipts
- Form to create new receipts with:
  - **Name**: Receipt identifier/description
  - **Date**: Receipt date (defaults to today)
  - **Note**: Optional additional information

### 2. Display Receipts
- Cards view showing all receipts
- Each card displays:
  - Receipt name and date
  - Creator information (email of who created it)
  - Optional note section
  - Action buttons for edit, print, and delete

### 3. Edit Receipts
- Click the ✏️ Edit button to modify existing receipts
- Update name, date, and note
- Changes are saved to database

### 4. Delete Receipts
- Click the 🗑️ Delete button to remove receipts
- Confirmation required before deletion
- Only works for receipts you created

### 5. Print Receipts
- Click the 🖨️ Print button to open print preview
- Receipt prints on a new window with:
  - **Header Section**:
    - Showroom logo
    - Showroom name and slogan
    - Receipt ID
  - **Information Section**:
    - Receipt name
    - Receipt date
    - Creator email
    - Optional note
  - **Signature Section**:
    - Space for signature
    - Space for cachet/seal
  - **Footer**:
    - Generated date/time
    - Showroom address

## Implementation Details

### Database Table: `receipts`
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  receipt_date DATE NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### RLS Policies
- **Read**: All authenticated users can read receipts
- **Create**: All authenticated users can create receipts
- **Update**: Users can only update their own receipts
- **Delete**: Users can only delete their own receipts

### Component Files

#### 1. `components/Receipts.tsx` (New)
- Main receipts management component
- Handles CRUD operations
- Manages print functionality
- Features:
  - `fetchReceipts()`: Load all receipts with creator info
  - `handleCreateOrUpdate()`: Save new or edited receipt
  - `handleEdit()`: Open edit mode for receipt
  - `handleDelete()`: Remove receipt
  - `handlePrint()`: Open print dialog with formatted receipt

#### 2. `components/Sidebar.tsx` (Updated)
- Added receipts menu item to admin menu
- Icon: 📄
- Label: "Reçus"
- Navigation to receipts page

#### 3. `App.tsx` (Updated)
- Added Receipts component import
- Added receipts route in main render
- Passes `lang` and `showroom` props to Receipts component

### Print Design
The print layout includes:
- **Professional Header**: With logo, business name, and document type
- **Receipt Details**: Name, date, creator, note
- **Signature & Cachet Areas**: Reserved spaces for handwritten signature and official seal
- **Footer**: Document generation timestamp and address
- **Clean, Simple Design**: Easy to read and professional appearance

### Styling
- Uses Tailwind CSS for UI
- Cards with hover effects
- Color-coded sections for easy scanning
- Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Print-optimized styles for clean output

## Database Setup

Execute this SQL in Supabase SQL Editor:
```sql
-- File: CREATE_RECEIPTS_TABLE.sql
-- Create receipts table for managing invoice receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  receipt_date DATE NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_receipts_created_by ON receipts(created_by);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read receipts" ON receipts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create receipts" ON receipts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own receipts" ON receipts
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own receipts" ON receipts
  FOR DELETE
  USING (auth.uid() = created_by);
```

## Usage Workflow

### Creating a Receipt
1. Click the "📄 Reçus" menu item in sidebar
2. Click "+ Créer un Reçu" button
3. Fill in the form:
   - Name: Enter receipt identifier
   - Date: Select the receipt date
   - Note: Add optional information
4. Click "Créer" to save

### Viewing Receipts
- All created receipts appear as cards below the form
- Each card shows name, date, and creator
- Receipts are listed most recent first

### Editing a Receipt
1. Click ✏️ Edit on the receipt card
2. Form populates with current values
3. Make changes as needed
4. Click "Mettre à Jour" to save

### Printing a Receipt
1. Click 🖨️ Print on the receipt card
2. New window opens with formatted receipt
3. Browser print dialog appears automatically
4. Select printer or "Save as PDF"
5. Confirm print

### Deleting a Receipt
1. Click 🗑️ Delete on the receipt card
2. Confirm deletion in alert dialog
3. Receipt is permanently removed

## Notes
- Only receipts created by the current user can be edited or deleted
- All authenticated users can view all receipts
- Print includes showroom logo if configured
- Receipt IDs use first 8 characters of UUID for readability
- Print layout is optimized for A4 paper size

## Future Enhancements
- Receipt templates/categories
- Search and filter functionality
- Receipt numbering system
- Email receipt delivery
- Digital signatures
- Batch printing
- Receipt archiving
