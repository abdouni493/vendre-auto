# 🚨 Supabase Resource Exhaustion - Diagnosis & Solutions

## 🔍 How to Check Your Resource Usage

### Step 1: View Resource Usage in Supabase Console

1. Go to **Supabase Dashboard** → Your Project
2. Click **Project Settings** (gear icon, bottom left)
3. Click **Usage** tab
4. You'll see:
   - Database size
   - Realtime connections
   - Storage
   - Bandwidth
   - Function invocations
   - Auth sessions

---

## 📊 Common Resource Bottlenecks & Fixes

### 1. ⚠️ Database Size Growing Too Fast

**Symptoms:**
- Storage usage near limit
- Slow queries
- High memory usage

**Root Causes:**
- Large base64-encoded logos/images in database
- Uncompressed photo arrays
- Old data not being deleted
- Duplicate records

**Solutions:**

```sql
-- Check table sizes (run in SQL Editor)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Find large columns
SELECT 
  attname,
  pg_size_pretty(sum(pg_column_size(attname::regclass))::bigint) AS size
FROM pg_attribute
WHERE attrelid = 'public.purchases'::regclass
GROUP BY attname
ORDER BY sum(pg_column_size(attname::regclass)) DESC;
```

**Fixes:**
1. **Move large files to Storage bucket (not database)**
```tsx
// ❌ Bad: Store logo in database
const logo = await file.arrayBuffer();
const base64 = Buffer.from(logo).toString('base64');
await supabase.from('showroom_config').update({ logo_data: base64 }).eq('id', 1);

// ✅ Good: Store in Supabase Storage
const { data, error } = await supabase.storage
  .from('logos')
  .upload('showroom-logo.png', file);
const url = supabase.storage.from('logos').getPublicUrl('showroom-logo.png').data.publicUrl;
await supabase.from('showroom_config').update({ logo_url: url }).eq('id', 1);
```

2. **Archive old sales data**
```sql
-- Move 1+ year old sales to archive table
INSERT INTO sales_archive
SELECT * FROM sales
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM sales
WHERE created_at < NOW() - INTERVAL '1 year';
```

3. **Compress photos array**
```sql
-- Remove duplicate/unnecessary photos
UPDATE purchases
SET photos = photos[1:5]  -- Keep only first 5 photos
WHERE array_length(photos, 1) > 5;
```

---

### 2. 📡 Too Many Realtime Connections

**Symptoms:**
- "Maximum realtime connections exceeded" error
- Live updates not working
- High CPU usage

**Root Causes:**
- Realtime subscriptions not being unsubscribed
- Memory leaks in React components
- Multiple tabs/windows all subscribing

**Solutions:**

```tsx
// ✅ Proper cleanup
useEffect(() => {
  const channel = supabase
    .channel('purchases_channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'purchases' },
      payload => console.log(payload)
    )
    .subscribe();

  // IMPORTANT: Cleanup on unmount
  return () => {
    channel.unsubscribe();
  };
}, []);
```

```tsx
// ✅ Single shared subscription (not per-component)
// Create a hooks/useRealtime.ts
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export const useRealtime = (table: string) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Only subscribe once per component lifecycle
    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        payload => setData(prev => [...prev, payload.new])
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [table]);

  return data;
};
```

**Disable Realtime if not needed:**
```tsx
// In App.tsx - disable global realtime
// Only enable for specific tables that need it

// Option 1: Use polling instead
const [purchases, setPurchases] = useState([]);

useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await supabase.from('purchases').select('*');
    setPurchases(data);
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
}, []);
```

---

### 3. 💾 Storage Quota Exceeded

**Symptoms:**
- Cannot upload new files
- Errors when saving photos

**Root Causes:**
- Large uncompressed images
- Duplicate image uploads
- No image cleanup policy

**Solutions:**

```tsx
// ✅ Compress before upload
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 1024px
        const maxWidth = 1024;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/webp' }));
        }, 'image/webp', 0.8); // 80% quality
      };
    };
  });
};

// Usage
const file = e.target.files[0];
const compressed = await compressImage(file);
await supabase.storage.from('photos').upload(`photo-${Date.now()}.webp`, compressed);
```

```tsx
// ✅ Delete old photos when updating
const updateCarPhotos = async (carId: string, newPhoto: File) => {
  // Get old photo path
  const { data: car } = await supabase
    .from('purchases')
    .select('photos')
    .eq('id', carId)
    .single();

  // Delete old photos from storage
  if (car.photos?.length > 0) {
    await supabase.storage
      .from('photos')
      .remove(car.photos);
  }

  // Upload new photo
  const compressed = await compressImage(newPhoto);
  const { data } = await supabase.storage
    .from('photos')
    .upload(`${carId}-${Date.now()}.webp`, compressed);

  // Update record
  await supabase.from('purchases').update({ 
    photos: [data.path] 
  }).eq('id', carId);
};
```

---

### 4. 🔗 Connection Pool Exhausted

**Symptoms:**
- "Error: FATAL: remaining connection slots are reserved"
- Database timeout errors
- Slow queries during peak times

**Root Causes:**
- Too many simultaneous queries
- Connections not being released
- No connection pooling

**Solutions:**

```tsx
// ✅ Use connection pooling (built into Supabase)
// Just make sure to reuse client instances

// ✅ Bad: Creating new clients
for (let i = 0; i < 100; i++) {
  const client = createClient(url, key);
  const { data } = await client.from('purchases').select('*');
}

// ✅ Good: Reuse single client
import { supabase } from '../supabase';

for (let i = 0; i < 100; i++) {
  const { data } = await supabase.from('purchases').select('*');
}
```

```tsx
// ✅ Batch queries to reduce connection overhead
// ❌ Bad: 10 separate requests
const [sales, purchases, expenses, ...] = await Promise.all([
  supabase.from('sales').select('*'),
  supabase.from('purchases').select('*'),
  supabase.from('expenses').select('*'),
  // ... 7 more queries
]);

// ✅ Good: Combine into fewer requests (if schema allows)
// Or add request debouncing/throttling
```

---

### 5. 📊 API Rate Limiting

**Symptoms:**
- HTTP 429 errors (Too Many Requests)
- Frontend slows down during peak times

**Root Causes:**
- Infinite loops fetching data
- Polling too frequently
- No request deduplication

**Solutions:**

```tsx
// ✅ Deduplicate requests
import { useQuery } from '@tanstack/react-query';

const { data: purchases } = useQuery(
  ['purchases'],
  () => supabase.from('purchases').select('*'),
  { 
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000  // Keep cache for 10 minutes
  }
);
```

```tsx
// ✅ Throttle polling
const [lastFetch, setLastFetch] = useState(0);

const fetchData = async () => {
  const now = Date.now();
  if (now - lastFetch < 30000) return; // Max once per 30 seconds
  
  setLastFetch(now);
  const { data } = await supabase.from('purchases').select('*');
};
```

---

## 🎯 Resource Optimization Checklist

### Immediate (Do Now)
- [ ] Check Supabase Usage dashboard
- [ ] Identify which resource is near limit
- [ ] Run database size query above
- [ ] Check for large base64 fields

### Short Term (This Week)
- [ ] Move large files to Storage instead of DB
- [ ] Archive old data (>1 year)
- [ ] Implement image compression
- [ ] Add cleanup for realtime subscriptions
- [ ] Enable caching with React Query

### Medium Term (This Month)
- [ ] Upgrade Supabase plan if needed
- [ ] Implement connection pooling
- [ ] Add request deduplication
- [ ] Set up database maintenance jobs

---

## 📈 Upgrade Options

### Free Plan
- 500MB database
- 1GB storage
- Limited connections

### Pro Plan ($25/month)
- 8GB database
- 100GB storage
- 10x more resources

### Business Plan ($599/month)
- Unlimited database
- Unlimited storage
- Priority support

**Recommendation:**
If you're hitting limits, Pro plan usually covers most needs. If you have >100GB of data, consider Business plan.

---

## 🔧 Quick Wins to Save Resources

### 1. Enable Row Level Security (RLS)
- Reduces unnecessary data fetches
- Users only see their own data

### 2. Use `.range()` for pagination
```tsx
.select('*')
.range(0, 50)  // Instead of loading all 10,000 rows
```

### 3. Select only needed columns
```tsx
.select('id, name, cost')  // Not '*'
```

### 4. Delete old logs
```sql
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

### 5. Compress storage
```tsx
// Use WebP format instead of PNG/JPG
// Reduces file size by 30-50%
```

---

## 📞 Contact Supabase Support

If you've optimized but still hitting limits:
1. Go to Supabase Console
2. Click **Support** (bottom left)
3. Request resource increase
4. They usually respond within 24 hours

---

## ✅ Next Steps

1. **Check your usage**: Supabase Console → Settings → Usage
2. **Identify the bottleneck**: Which resource is near limit?
3. **Apply the fix**: Use solutions from this guide
4. **Monitor**: Check usage again in 1 week
5. **Upgrade if needed**: Choose appropriate plan

Which resource is causing issues? Let me know and I can help optimize it specifically!
