# Debt Payment Feature - Quick Start Guide 🚀

## How to Use

### Step 1: Open Sales History
- Click on **Historique des Ventes** (in the POS component)
- View all sales with their current status and balance

### Step 2: Find a Sale with Debt
- Look for sales with **⏳ Detteurs** status
- These sales have `balance > 0` (money still owed)
- The **💳 Payer** button will appear on these cards

### Step 3: Click the Pay Debt Button
- Click **💳 Payer** on the sale card
- The payment modal opens with full details

### Step 4: Enter Payment Amount
- The payment field is pre-filled with the remaining balance
- You can adjust it to any amount between 0 and the remaining balance
- Use the slider or type the amount manually

### Step 5: Review the Preview
- **Bottom section** shows what happens after payment:
  - New total amount paid
  - New remaining balance
  - Color changes to GREEN if balance reaches 0 ✨
  - Message shows if sale will be marked as COMPLETE

### Step 6: Confirm Payment
- Click **✅ Enregistrer Paiement** to save
- Wait for processing (⏳ message shows)
- Success message confirms the payment

### Step 7: Verification
- Sales history refreshes automatically
- Status updates to **✅ Complétée** if fully paid
- **💳 Payer** button disappears from fully paid sales

---

## Key Features

| Feature | Benefit |
|---------|---------|
| **Partial Payments** | Pay any amount ≤ remaining balance |
| **Balance Tracking** | Always see how much is left |
| **Auto Status Update** | Status changes when fully paid |
| **Real-Time Preview** | See exactly what will happen |
| **Validation** | Prevents invalid payments |
| **Instant Refresh** | Sales list updates immediately |

---

## Examples

### Example 1: Paying Half the Debt
**Before:**
- Total: 1,000,000 DA
- Already Paid: 500,000 DA
- **Balance: 500,000 DA** 🔴

**Action:** Enter 250,000 DA in payment field

**Preview Shows:**
- New Paid: 750,000 DA
- **New Balance: 250,000 DA** 🟠 (Still orange = still debt)

**After Payment:**
- Status remains **⏳ Detteurs**
- Can pay again later for remaining 250,000 DA

---

### Example 2: Paying Full Debt
**Before:**
- Total: 1,000,000 DA
- Already Paid: 750,000 DA
- **Balance: 250,000 DA** 🔴

**Action:** Keep pre-filled amount: 250,000 DA

**Preview Shows:**
- New Paid: 1,000,000 DA
- **New Balance: 0 DA** 🟢 ✨ (Green = COMPLETE!)
- Message: "✨ La vente sera marquée comme COMPLÈTE et PAYÉE"

**After Payment:**
- Status changes to **✅ Complétée**
- 💳 **Payer** button disappears
- Sale is fully settled

---

## Visual Guide

```
Sales History Card (with debt):
┌─────────────────────────────────────┐
│ 🚗 Toyota Camry 2020                │
│ 👤 Client: Ahmed Mourabit           │
│ 💰 Solde: 250,000 DA 🔴            │
│ Status: ⏳ Detteurs                 │
│                                     │
│ [💳 Payer] [🖨️ Facture] [👁️ Détails] │
└─────────────────────────────────────┘

Payment Modal:
┌──────────────────────────────────────┐
│ 💳 Paiement de Dette                 │
├──────────────────────────────────────┤
│ Résumé:                              │
│ • Véhicule: Toyota Camry             │
│ • Client: Ahmed Mourabit             │
│ • Montant Total: 1,000,000 DA 🔵    │
│ • Déjà Payé: 750,000 DA 🟢          │
│ • Solde: 250,000 DA 🔴              │
│                                      │
│ Montant à Payer: [_______250000___] │
│                                      │
│ Après Paiement:                      │
│ • Nouveau Montant Payé: 1,000,000 🟢│
│ • Nouveau Solde: 0 DA ✨             │
│ ✨ Sera marqué COMPLÈTE ET PAYÉE    │
│                                      │
│ [Annuler] [✅ Enregistrer Paiement]  │
└──────────────────────────────────────┘
```

---

## Common Scenarios

### Scenario: Customer Makes Installment Payments
1. **Month 1:** Pay 200,000 DA → Balance: 300,000 DA (Status: ⏳)
2. **Month 2:** Pay 100,000 DA → Balance: 200,000 DA (Status: ⏳)
3. **Month 3:** Pay 200,000 DA → Balance: 0 DA (Status: ✅)

### Scenario: Customer Overpays
- System prevents overpayment
- Max payment limited to remaining balance
- Error message if user tries to pay more

### Scenario: Multiple Vehicles for Same Customer
- Each sale tracked independently
- Filter by **Dettes** to see all outstanding
- Pay one at a time

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 💳 Payer button not showing | Sale is fully paid (balance = 0) |
| Can't edit payment amount | Check if amount is valid (> 0, ≤ balance) |
| Payment failed to save | Check your Supabase connection |
| Status didn't update | Refresh the page or reopen sales history |
| Old balance showing | Click elsewhere to refresh or close/reopen modal |

---

## Tips & Best Practices

✅ **DO:**
- Review the preview before confirming
- Keep payment amounts round numbers (easier to track)
- Mark sales as complete to filter them out
- Keep client contact info for payment reminders

❌ **DON'T:**
- Accept overpayments (use system's limit)
- Create duplicate payments for same amount
- Force full payment if client can only pay partial
- Forget to confirm the payment in the modal

---

## Status Indicators

| Status | Meaning | Color |
|--------|---------|-------|
| ✅ Complétée | Fully paid | Green 🟢 |
| ⏳ Detteurs | Still owes money | Red 🔴 |

---

## Next Steps After Payment

1. **Generate Receipt** (Optional)
   - Click 🖨️ **Facture** to print payment invoice

2. **Send Client Confirmation**
   - Use vehicle details from the sale card
   - Reference: #VNT-{sale_id}

3. **Track Outstanding Debts**
   - Filter by **⏳ Dettes** to see all outstanding
   - Prioritize based on payment date

4. **Follow Up on Overdue Payments**
   - Contact clients with overdue balances
   - Schedule payment reminders

---

## Support

For detailed technical information, see `DEBT_PAYMENT_FEATURE.md`.
