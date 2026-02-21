# Worker Role-Based Access Control & Payment History

## Overview

This implementation adds role-based access control to the sidebar, restricting which features workers can access compared to admins, and includes a new **Worker Payment History** interface for employees to view their compensation records.

## What's New

### 1. **Role-Based Sidebar Navigation**

#### Admin Role - Full Access
When a user logs in with **admin** role, they see:
- 📊 Dashboard
- 🏎️ Showroom
- 🤝 Suppliers
- 🛒 Purchase Vehicles
- 🏪 Point of Sale
- 🗝️ Fleet Inspection
- 👥 Team
- 📄 Billing
- 💸 Expenses
- 📈 Reports
- 🤖 AI Analysis
- ⚙️ Configuration

#### Worker Role - Limited Access
When a user logs in with **worker** role, they see:
- 📊 Dashboard (special view for their work)
- 🏎️ Showroom
- 🤝 Suppliers
- 🛒 Purchase Vehicles
- 🏪 Point of Sale
- 🗝️ Fleet Inspection
- 📄 Billing
- 💸 Expenses
- 💳 **Payment History** (NEW)
- ⚙️ Configuration

**Removed from Worker View:**
- Team Management (👥)
- Reports (📈)
- AI Analysis (🤖)

### 2. **New Worker Payment History Interface**

A dedicated interface for workers to view their payment history with:

#### Features:
- 👤 **Worker Information Card**
  - Full name
  - Payment type (Monthly or Daily)
  - Base salary amount

- 💰 **Summary Statistics**
  - Total earned across all payments
  - Number of transactions

- 📜 **Detailed Payment History**
  - Payment type indicator (💰 Advance, 📅 Monthly, 📆 Daily)
  - Amount paid
  - Payment date
  - Description/notes (if any)
  - Creator information (who processed the payment)
  - Created date option (toggle)

#### Design:
- Matches the design language of all other interfaces
- Uses emoji icons for visual clarity
- Responsive grid layout (1 column on mobile, 2 on desktop)
- Gradient cards for visual hierarchy
- Hover effects and smooth transitions

## Database Setup

### Create Worker Payments Table

Run the SQL script: `WORKER_PAYMENTS_MIGRATION.sql`

This creates:
```sql
CREATE TABLE public.worker_payments (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL (references workers.id),
  amount NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_type VARCHAR(50) ('advance' | 'monthly' | 'daily'),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255)
);
```

### Setup Instructions

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the entire content of `WORKER_PAYMENTS_MIGRATION.sql`
4. Execute the query

This will:
- ✅ Create the `worker_payments` table
- ✅ Create optimal indexes for performance
- ✅ Enable Row Level Security (RLS)
- ✅ Create RLS policies for authenticated access
- ✅ Set up constraints to ensure data integrity

## Code Changes

### Files Modified:

#### 1. **Sidebar.tsx** (Updated)
- Added role-based menu filtering
- Created separate menu item arrays for admin and worker roles
- Workers now see "💳 Payment History" instead of Team/Reports/AI
- Configuration access granted to both admin and worker

```typescript
// Admin sees all items
const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', label: ..., roles: ['admin'] },
  // ... 11 items total
];

// Worker sees limited items
const workerMenuItems: MenuItem[] = [
  { id: 'dashboard', label: ..., roles: ['worker'] },
  // ... 9 items total, plus new payment history
];
```

#### 2. **WorkerPayments.tsx** (New Component)
- New component for displaying worker payment history
- Fetches current logged-in worker
- Displays payment records from `worker_payments` table
- Shows summary statistics
- Responsive card-based layout

Key functions:
- `fetchCurrentWorker()` - Gets logged-in worker's info
- `fetchPayments()` - Retrieves all payments for the worker
- Automatic total calculation

#### 3. **App.tsx** (Updated)
- Imported `WorkerPayments` component
- Added route: `activeItem === 'worker-payments' ? <WorkerPayments lang={lang} />`
- Conditional rendering based on sidebar selection

## How Workers See Payment History

### Step-by-Step:

1. **Worker logs in** with role set to `'worker'`
2. **Sidebar updates** to show only worker-accessible items
3. **Worker clicks "💳 Payment History"** in sidebar
4. **WorkerPayments component renders:**
   - Fetches their current worker record from `workers` table using `username`
   - Queries `worker_payments` table for all their payments
   - Displays total earnings and payment count
   - Shows all payments in a grid of cards

5. **Payment Card displays:**
   - Type emoji (💰/📅/📆)
   - Amount in DA
   - Payment date
   - Notes/description if available
   - Creator name
   - Optional created timestamp

## How Admins Manage Worker Payments

### Adding Payments (via Team interface):

Admins use the existing Team interface to:
1. Go to Team Management (👥)
2. Select a worker
3. Open the "💳 Payment" modal
4. Fill in:
   - Amount
   - Payment date
   - Payment type (advance/monthly/daily)
   - Description
5. Save → Creates entry in `worker_payments` table

### Example Database Record:

```json
{
  "id": "uuid-here",
  "worker_id": "worker-uuid",
  "amount": 50000,
  "payment_date": "2026-02-20T10:00:00Z",
  "payment_type": "monthly",
  "description": "Salaire de février 2026",
  "created_by": "admin_username"
}
```

## Integration with Existing Code

The implementation integrates seamlessly:

1. **Authentication:** Uses existing `autolux_user_name` localStorage
2. **Database:** Uses existing Supabase client
3. **Styling:** Matches existing Tailwind + custom CSS patterns
4. **Translations:** Can be extended with multilingual labels (French provided)
5. **Sidebar:** Automatically filters based on role prop

## Testing Checklist

- [ ] Run `WORKER_PAYMENTS_MIGRATION.sql` in Supabase
- [ ] Create test worker account with role: `'worker'`
- [ ] Log in as worker
- [ ] Verify sidebar shows only worker items (no Team/Reports/AI)
- [ ] Verify "💳 Payment History" appears in sidebar
- [ ] Add a payment record via Team interface
- [ ] Click Payment History and verify payment appears
- [ ] Check payment details (amount, date, creator)
- [ ] Toggle created date display (📅 button)
- [ ] Log in as admin
- [ ] Verify admin sees all menu items
- [ ] Add multiple payments
- [ ] Verify total and count are calculated correctly

## Troubleshooting

### "Worker not found" error
- ✅ Ensure `autolux_user_name` is saved in localStorage
- ✅ Verify worker's `username` field matches localStorage value
- ✅ Check worker exists in `workers` table

### No payments showing
- ✅ Verify `worker_payments` table was created
- ✅ Check RLS policies are enabled
- ✅ Ensure payments exist for the worker in database
- ✅ Check browser console for SQL errors

### Sidebar not updating
- ✅ Verify role is correctly set in localStorage
- ✅ Refresh page after role change
- ✅ Check `role` prop passed to `<Sidebar>`

## Future Enhancements

Possible additions:
- 📊 Payment statistics chart
- 🔍 Filter payments by date range
- 📥 Export payments as PDF
- 📱 Payment notifications
- 🔔 Pending advance requests
- 📧 Payment receipts
- 💬 Payment notes/messages

## File Structure

```
components/
├── Sidebar.tsx (Updated - role-based menus)
├── WorkerPayments.tsx (NEW - payment history)
└── App.tsx (Updated - add route)

migrations/
└── WORKER_PAYMENTS_MIGRATION.sql (NEW - database setup)

types.ts (No changes needed)
translations.ts (Can extend with new labels)
```

## Summary

✅ **Sidebar now shows role-appropriate menus:**
- Admins: All 12 interfaces
- Workers: 10 restricted interfaces + payment history

✅ **New Worker Payment History interface:**
- Beautiful, responsive card-based design
- Shows all worker payments with details
- Matches existing UI/UX patterns
- Uses emoji icons for clarity

✅ **Database ready:**
- Migration script provided
- RLS policies included
- Performance indexes created
- Data integrity constraints

✅ **Authentication integrated:**
- Uses existing worker login system
- Respects role-based access
- Secure data fetching
