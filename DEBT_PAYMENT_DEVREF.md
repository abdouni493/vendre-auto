# Debt Payment Feature - Developer Reference

## Quick Navigation

| Document | Purpose | Audience |
|----------|---------|----------|
| **DEBT_PAYMENT_SUMMARY.md** | Overview & technical summary | Everyone |
| **DEBT_PAYMENT_QUICK_GUIDE.md** | How to use the feature | End Users |
| **DEBT_PAYMENT_FEATURE.md** | Complete technical documentation | Developers |
| **DEBT_PAYMENT_DIAGRAMS.md** | Visual flows & data structures | Architects |
| **DEBT_PAYMENT_DEVREF.md** | Code reference (this file) | Developers |

---

## Code Location

### Main Implementation: `components/POS.tsx`

**State Variables** (lines ~77-79)
```typescript
const [paymentModal, setPaymentModal] = useState<{ sale: SaleRecord | null; paymentAmount: number }>({ sale: null, paymentAmount: 0 });
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
```

**Handlers** (lines ~325-385)
```typescript
const handlePaymentModalOpen = (sale: SaleRecord) => { ... }
const handleSavePayment = async () => { ... }
```

**UI Components**
- Pay Debt Button: Lines ~1097-1104 (inside history card)
- Payment Modal: Lines ~1145-1245 (full modal)

---

## Key Functions

### 1. handlePaymentModalOpen(sale)

**Purpose:** Opens payment modal with pre-filled data

**Parameters:**
- `sale: SaleRecord` - The sale to make a payment on

**Logic:**
```
1. Check if balance <= 0
   - YES: Show alert "déjà complètement payée"
   - NO: Continue
2. Set payment modal with:
   - sale: selected sale object
   - paymentAmount: remaining balance (pre-fill)
3. Modal renders with all sale details
```

**Side Effects:**
- Opens payment modal
- Shows alert if already paid

---

### 2. handleSavePayment()

**Purpose:** Validate, process, and save the payment

**Parameters:** None (uses `paymentModal` state)

**Validation:**
```
✓ paymentAmount > 0
  → Error: "montant doit être > 0"
✓ paymentAmount <= balance
  → Error: "ne peut pas dépasser le solde"
```

**Processing:**
```
1. Calculate:
   newBalance = balance - paymentAmount
   newAmountPaid = amountPaid + paymentAmount
   newStatus = newBalance <= 0 ? 'completed' : 'debt'

2. Update Database:
   UPDATE sales SET
     amount_paid = newAmountPaid,
     balance = newBalance,
     status = newStatus
   WHERE id = saleId

3. Refresh:
   - Fetch updated sales list
   - Close modal
   - Reset payment amount

4. Notify:
   - Show success alert with amounts
   - If completed: "Le solde est maintenant complètement payé ✨"
```

**Side Effects:**
- Updates Supabase database
- Refreshes sales list
- Closes payment modal
- Shows alert message

**Error Handling:**
```typescript
try {
  // Validate and process
} catch (err: any) {
  alert(`❌ Error: ${err.message}`);
} finally {
  setIsProcessingPayment(false);
}
```

---

## Component Integration

### Used by: POS Component
- Sales History Modal
- Payment Modal (new)

### Uses: Supabase
```typescript
const { error } = await supabase
  .from('sales')
  .update({ amount_paid, balance, status })
  .eq('id', saleId);
```

---

## State Management

### Payment Modal State
```typescript
paymentModal = {
  sale: SaleRecord | null,    // Selected sale
  paymentAmount: number        // User-entered amount
}
```

**State Flow:**
```
null → { sale: data, 0 } → { sale: data, 200000 } → null
(closed)  (opened)           (user input)      (saved)
```

### Processing Flag
```typescript
isProcessingPayment = boolean  // Disable buttons during save
```

---

## UI Rendering Logic

### Pay Debt Button Visibility
```typescript
{sale.balance > 0 && (
  <button onClick={() => handlePaymentModalOpen(sale)}>
    💳 Payer
  </button>
)}
```
**Shows when:** `sale.balance > 0`
**Hides when:** `sale.balance <= 0` (fully paid)

### Payment Modal Visibility
```typescript
{paymentModal.sale && (
  <div className="payment-modal">
    ...
  </div>
)}
```
**Shows when:** `paymentModal.sale !== null`
**Hides when:** `paymentModal.sale === null`

### Balance Preview Color
```typescript
const bgColor = (paymentModal.sale.balance - paymentModal.paymentAmount) <= 0
  ? 'bg-green-100 text-green-700'
  : 'bg-orange-100 text-orange-700'
```
**Green:** When payment = balance (fully paid)
**Orange:** When payment < balance (partial)

---

## Database Schema

### Table: `sales`

**Columns Used:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `total_price` | numeric | Original sale amount |
| `amount_paid` | numeric | **Updated by payment** |
| `balance` | numeric | **Updated by payment** |
| `status` | text | **Updated by payment** |

**No new columns added** - Uses existing columns only.

**Update Query:**
```sql
UPDATE sales
SET 
  amount_paid = $1,    -- newAmountPaid
  balance = $2,        -- newBalance
  status = $3          -- 'completed' or 'debt'
WHERE id = $4          -- saleId
```

---

## Related Code

### Dependencies
```typescript
import { SaleRecord } from '../types';
import { supabase } from '../supabase';
```

### Type Definition
```typescript
interface SaleRecord {
  id?: string;
  car_id: string;
  total_price: number;
  amount_paid: number;
  balance: number;
  status: 'completed' | 'debt';
  // ... other fields
}
```

### Helper Functions Used
```typescript
fetchAllSales()        // Refresh sales list
setPaymentModal()      // Update modal state
setIsProcessingPayment()  // Toggle loading state
```

---

## Testing Checklist

### Unit Tests
- [ ] `handlePaymentModalOpen()` with valid sale
- [ ] `handlePaymentModalOpen()` with balance = 0
- [ ] `handleSavePayment()` with valid amount
- [ ] `handleSavePayment()` with invalid amount (> balance)
- [ ] `handleSavePayment()` with amount = 0
- [ ] Database update executes correctly
- [ ] Sales list refreshes after payment
- [ ] Modal closes after successful payment

### Integration Tests
- [ ] Pay debt button appears for sales with debt
- [ ] Pay debt button hidden for fully paid sales
- [ ] Payment modal opens with correct data
- [ ] Balance preview updates in real-time
- [ ] Success message shows after payment
- [ ] Sales history updates immediately

### Manual Tests
- [ ] Partial payment flow works end-to-end
- [ ] Full payment marks sale as completed
- [ ] Multiple partial payments work
- [ ] Status changes from "⏳" to "✅"
- [ ] No errors in console

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Pay button not showing | Balance is 0 | Sale is already paid |
| Payment won't save | Invalid amount | Check min > 0, max ≤ balance |
| List doesn't refresh | Fetch failed | Check Supabase connection |
| Modal shows stale data | Not closed properly | Close and reopen modal |
| Status not updating | Wrong calculation | Verify newBalance = balance - amount |

---

## Performance Tips

**Optimization Done:**
- Minimal re-renders (controlled state)
- Single database update (atomic)
- Deferred list refresh (after update)
- Input validation (client-side)

**Potential Improvements:**
- Debounce balance preview calculation
- Optimistic UI updates
- Batch multiple payments
- Cache sales data locally

---

## Security Considerations

**Current Implementation:**
✓ Uses Supabase RLS (Row Level Security)
✓ Server-side validation (database constraints)
✓ User authentication required
✓ No direct API exposure

**Suggested Enhancements:**
- Add payment audit trail
- Log payment transactions
- Add permission checks
- Validate user authorization

---

## Browser DevTools Debugging

### Check Payment Modal State
```javascript
// In console
JSON.stringify(paymentModal)
// Output: { sale: {...}, paymentAmount: 200000 }
```

### Monitor Processing Flag
```javascript
// In console
isProcessingPayment
// Output: true/false
```

### Test Payment Function
```javascript
// In console
handleSavePayment()
// Triggers payment save flow
```

---

## Code Standards

**Followed Conventions:**
- React hooks for state management
- TypeScript for type safety
- Tailwind CSS for styling
- Consistent error handling
- Comments on complex logic

**Code Style:**
- camelCase for variables/functions
- PascalCase for components
- 2-space indentation
- Meaningful variable names
- Try-catch for error handling

---

## Related Components

### Linked Components:
- `Showroom.tsx` - Uses sales data
- `Inspection.tsx` - Related to sales
- `Dashboard.tsx` - Shows sales stats

### Data Flow:
```
Showroom → Sales Data → POS (payment)
         → History Display
         → Payment Modal
         → Database Update
```

---

## Future Enhancements (Priority Order)

### High Priority
1. Add payment transaction logging
2. Show payment history timeline
3. Generate payment receipts

### Medium Priority
4. Bulk payment support
5. Scheduled payments
6. Payment plan templates

### Low Priority
7. Multiple payment methods
8. Currency conversion
9. Advanced reporting

---

## Support Resources

**Internal Documentation:**
- `DEBT_PAYMENT_FEATURE.md` - Complete technical guide
- `DEBT_PAYMENT_DIAGRAMS.md` - Visual flows
- Code comments in `POS.tsx`

**External Resources:**
- Supabase Documentation: https://supabase.com/docs
- React Hooks: https://react.dev/reference/react/hooks
- TypeScript: https://www.typescriptlang.org/docs/

---

## Last Updated
**Date:** February 21, 2026
**Version:** 1.0.0
**Status:** Production Ready

---

## Questions?

See comprehensive documentation files:
- Technical details → `DEBT_PAYMENT_FEATURE.md`
- User guide → `DEBT_PAYMENT_QUICK_GUIDE.md`
- Visual diagrams → `DEBT_PAYMENT_DIAGRAMS.md`
