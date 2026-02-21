# 🚀 Application Performance Optimization Guide

## Problem Analysis

Your app shows loading messages:
- ⏳ "SYNCHRONISATION DU STOCK..." (Showroom.tsx)
- ⏳ "Analyse du Showroom..." (Dashboard.tsx)
- ⏳ "Ouverture du registre des achats..." (Purchase.tsx)

### Root Causes

1. **Full table selects** - Fetching ALL columns and ALL rows
2. **Sequential queries** - Waiting for one query before starting the next
3. **No pagination** - Loading entire dataset at once
4. **Synchronous rendering** - UI blocks while data loads
5. **No query optimization** - Missing indexes and filtering at DB level

---

## ✅ 10 Quick Wins (Do Now!)

### 1. **Lazy Load Images**
```tsx
<img loading="lazy" src={...} /> // Native lazy loading
```

### 2. **Paginate Data** 
```tsx
.select('*')
.range(0, 50)  // First 50 only
```

### 3. **Fetch Only Needed Columns**
```tsx
// ❌ Bad
.select('*')

// ✅ Good  
.select('id, make, model, plate, totalCost, sellingPrice')
```

### 4. **Add Debounce to Searches**
```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) fetchFiltered(debouncedSearch);
}, [debouncedSearch]);
```

### 5. **Use Parallel Requests**
```tsx
// ❌ Sequential
const sales = await fetch('sales');
const purchases = await fetch('purchases');

// ✅ Parallel
const [sales, purchases] = await Promise.all([
  supabase.from('sales').select('...'),
  supabase.from('purchases').select('...')
]);
```

### 6. **Cache Data with React Query or SWR**
```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery(
  ['purchases'],
  () => supabase.from('purchases').select('...'),
  { staleTime: 5 * 60 * 1000 } // 5 minutes
);
```

### 7. **Virtual Scroll for Long Lists**
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList width="100%" height={600} itemCount={1000} itemSize={50}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>
```

### 8. **Compress Images**
```tsx
// Use WebP format, max width 1024px
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." />
</picture>
```

### 9. **Code Splitting by Route**
```tsx
const Dashboard = React.lazy(() => import('./components/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 10. **Enable Gzip Compression in Nginx**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

---

## 🗄️ Database Optimization

### Add Indexes to Supabase

Run in Supabase SQL Editor:

```sql
-- Purchases table
CREATE INDEX IF NOT EXISTS idx_purchases_is_sold ON purchases(is_sold);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);

-- Sales table
CREATE INDEX IF NOT EXISTS idx_sales_car_id ON sales(car_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_balance_gt_0 ON sales((balance > 0));

-- Expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Worker transactions
CREATE INDEX IF NOT EXISTS idx_worker_trans_type ON worker_transactions(type);
CREATE INDEX IF NOT EXISTS idx_worker_trans_created_at ON worker_transactions(created_at DESC);

-- Vehicle expenses
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle_id ON vehicle_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_created_at ON vehicle_expenses(created_at DESC);
```

### Query Optimization Pattern

```tsx
// ❌ Bad: Fetch everything
const fetchDashboard = async () => {
  const sales = await supabase.from('sales').select('*');
  const purchases = await supabase.from('purchases').select('*');
  const expenses = await supabase.from('expenses').select('*');
  // Process...
};

// ✅ Good: Selective columns + parallel + filter at DB
const fetchDashboard = async () => {
  const [sales, purchases, expenses] = await Promise.all([
    supabase
      .from('sales')
      .select('id, total_price, balance, car_id, created_at')
      .gte('created_at', lastMonth),
    
    supabase
      .from('purchases')
      .select('id, make, model, totalCost, sellingPrice, is_sold, created_at')
      .eq('is_sold', false),
    
    supabase
      .from('expenses')
      .select('id, cost, date')
      .gte('date', lastMonth)
  ]);
  // Process...
};
```

---

## ⚡ React Performance

### Prevent Unnecessary Re-renders

```tsx
// ✅ Use useMemo for expensive calculations
const inventory = useMemo(() => 
  purchases.filter(p => !p.is_sold),
  [purchases]
);

// ✅ Use useCallback for stable function refs
const handleDelete = useCallback((id) => {
  supabase.from('purchases').delete().eq('id', id);
}, []);

// ✅ Use React.memo for child components
const CarCard = React.memo(({ car, onSelect }) => (
  <div onClick={() => onSelect(car)}>{car.make}</div>
));
```

### Implement Infinite Scroll

```tsx
const [items, setItems] = useState([]);
const [page, setPage] = useState(0);

useEffect(() => {
  const loadMore = async () => {
    const { data } = await supabase
      .from('purchases')
      .select('...')
      .range(page * 50, (page + 1) * 50 - 1);
    setItems(prev => [...prev, ...data]);
  };
  loadMore();
}, [page]);

return (
  <InfiniteScroll
    dataLength={items.length}
    next={() => setPage(p => p + 1)}
    hasMore={items.length % 50 === 0}
  >
    {items.map(item => <Card key={item.id} {...item} />)}
  </InfiniteScroll>
);
```

---

## 📊 Monitoring & Profiling

### Check Performance with DevTools

1. Open **DevTools → Performance tab**
2. Record page load
3. Look for:
   - Long rendering tasks (>100ms)
   - Large data transfers
   - Layout thrashing

### Use Network Tab

- Look for slow API requests
- Combine parallel requests
- Reduce payload size

### React DevTools Profiler

1. Install **React DevTools** extension
2. Open **Profiler tab**
3. Record interactions
4. Identify slow components

---

## 🎯 Priority Roadmap

### Phase 1: Quick Wins (1-2 hours)
- [ ] Add pagination to Dashboard, Purchase, Showroom
- [ ] Select only needed columns in queries
- [ ] Parallel queries where possible
- [ ] Add indexes to Supabase

### Phase 2: Medium Effort (4-6 hours)
- [ ] Implement React Query for caching
- [ ] Add debouncing to search inputs
- [ ] Lazy load images
- [ ] Code splitting by route

### Phase 3: Advanced (8+ hours)
- [ ] Virtual scrolling for large lists
- [ ] Service Worker for offline cache
- [ ] Optimistic updates
- [ ] Real-time subscriptions instead of polling

---

## 📈 Expected Performance Gains

| Optimization | Time Saved | Difficulty |
|---|---|---|
| Pagination | 50-70% | ⭐ Easy |
| Parallel queries | 30-50% | ⭐ Easy |
| Column selection | 20-40% | ⭐ Easy |
| Caching (React Query) | 70-90% on repeat | ⭐⭐ Medium |
| Virtual scrolling | 80-95% large lists | ⭐⭐⭐ Hard |
| Code splitting | 40-60% on navigation | ⭐⭐ Medium |

---

## 🧠 Useful Libraries

```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-window": "^1.8.10",
  "react-intersection-observer": "^9.5.0",
  "lodash.debounce": "^4.0.8",
  "swr": "^2.2.4"
}
```

---

## 🎬 Implementation Example: Optimized Dashboard

See [PERFORMANCE_OPTIMIZED_DASHBOARD.tsx](./docs/PERFORMANCE_OPTIMIZED_DASHBOARD.tsx) for a fully optimized Dashboard component.

---

Need help implementing? Let me know which optimization you want first!
