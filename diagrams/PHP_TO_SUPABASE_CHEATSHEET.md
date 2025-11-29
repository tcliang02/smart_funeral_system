# PHP to Supabase Conversion Cheat Sheet

## Quick Reference for Converting Your Backend

---

## Installation

```bash
npm install @supabase/supabase-js
```

---

## Setup (One Time Only)

**Create `src/supabaseClient.js`:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Create `.env.local`:**
```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**In every component that needs data:**
```javascript
import { supabase } from '../supabaseClient'
```

---

## Basic CRUD Operations

### 📖 GET (Read)

**PHP:**
```javascript
// getPackages.php
fetch('/backend/getPackages.php')
  .then(res => res.json())
  .then(data => setPackages(data))
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('packages')
  .select('*')

if (data) setPackages(data)
```

---

### ➕ POST (Create)

**PHP:**
```javascript
// addPackage.php
fetch('/backend/addPackage.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Buddhist Package',
    price: 5000,
    description: 'Full service'
  })
})
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('packages')
  .insert([
    {
      name: 'Buddhist Package',
      price: 5000,
      description: 'Full service'
    }
  ])
```

---

### ✏️ PUT/POST (Update)

**PHP:**
```javascript
// updatePackage.php
fetch('/backend/updatePackage.php', {
  method: 'POST',
  body: JSON.stringify({
    id: 123,
    name: 'Updated Package',
    price: 6000
  })
})
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('packages')
  .update({
    name: 'Updated Package',
    price: 6000
  })
  .eq('id', 123)
```

---

### 🗑️ DELETE

**PHP:**
```javascript
// deletePackage.php
fetch('/backend/deletePackage.php', {
  method: 'POST',
  body: JSON.stringify({ id: 123 })
})
```

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('packages')
  .delete()
  .eq('id', 123)
```

---

## Advanced Queries

### 🔍 WHERE Clauses

**PHP:**
```javascript
// getActivePackages.php?status=active
fetch('/backend/getActivePackages.php?status=active')
```

**Supabase:**
```javascript
const { data } = await supabase
  .from('packages')
  .select('*')
  .eq('is_active', true)
```

---

### 🔗 JOINs (Get Related Data)

**PHP:**
```sql
SELECT bookings.*, packages.name, users.email
FROM bookings
JOIN packages ON bookings.package_id = packages.id
JOIN users ON bookings.user_id = users.id
```

**Supabase:**
```javascript
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    packages (
      name,
      price
    ),
    users (
      email,
      name
    )
  `)
```

---

### 📊 Sorting

**PHP:**
```javascript
// getPackages.php?sort=price&order=asc
fetch('/backend/getPackages.php?sort=price&order=asc')
```

**Supabase:**
```javascript
const { data } = await supabase
  .from('packages')
  .select('*')
  .order('price', { ascending: true })
```

---

### 🔢 Pagination

**PHP:**
```javascript
// getPackages.php?page=2&limit=10
fetch('/backend/getPackages.php?page=2&limit=10')
```

**Supabase:**
```javascript
const { data } = await supabase
  .from('packages')
  .select('*')
  .range(10, 19) // Skip 10, get next 10
```

---

### 🔎 Search

**PHP:**
```javascript
// searchPackages.php?query=buddhist
fetch('/backend/searchPackages.php?query=buddhist')
```

**Supabase:**
```javascript
const { data } = await supabase
  .from('packages')
  .select('*')
  .ilike('name', '%buddhist%') // Case-insensitive LIKE
```

**Or full-text search:**
```javascript
const { data } = await supabase
  .from('packages')
  .select('*')
  .textSearch('name', 'buddhist')
```

---

### 📈 Count

**PHP:**
```sql
SELECT COUNT(*) FROM bookings WHERE status = 'pending'
```

**Supabase:**
```javascript
const { count } = await supabase
  .from('bookings')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending')
```

---

## Authentication

### 🔐 Sign Up

**PHP:**
```javascript
// register.php
fetch('/backend/register.php', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
})
```

**Supabase:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
      role: 'family'
    }
  }
})
```

---

### 🔑 Login

**PHP:**
```javascript
// login.php
fetch('/backend/login.php', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
```

**Supabase:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

if (data.session) {
  // User logged in successfully
  console.log('User:', data.user)
  console.log('Token:', data.session.access_token)
}
```

---

### 🚪 Logout

**PHP:**
```javascript
fetch('/backend/logout.php', { method: 'POST' })
```

**Supabase:**
```javascript
await supabase.auth.signOut()
```

---

### 👤 Get Current User

**PHP:**
```javascript
fetch('/backend/getCurrentUser.php')
  .then(res => res.json())
  .then(user => setUser(user))
```

**Supabase:**
```javascript
const { data: { user } } = await supabase.auth.getUser()
setUser(user)
```

---

### 🔄 Session Management

**Supabase automatically handles sessions!**

```javascript
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user)
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})
```

---

## File Uploads

### 📷 Upload Photo

**PHP:**
```javascript
// uploadPhoto.php
const formData = new FormData()
formData.append('photo', fileInput.files[0])

fetch('/backend/uploadPhoto.php', {
  method: 'POST',
  body: formData
})
```

**Supabase:**
```javascript
const file = fileInput.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `deceased-photos/${fileName}`

// Upload file
const { data, error } = await supabase.storage
  .from('photos')
  .upload(filePath, file)

// Get public URL
const { data: urlData } = supabase.storage
  .from('photos')
  .getPublicUrl(filePath)

console.log('Photo URL:', urlData.publicUrl)
// Save this URL to your database
```

---

### 🗑️ Delete File

**PHP:**
```javascript
fetch('/backend/deletePhoto.php', {
  method: 'POST',
  body: JSON.stringify({ filename: 'photo123.jpg' })
})
```

**Supabase:**
```javascript
await supabase.storage
  .from('photos')
  .remove(['deceased-photos/photo123.jpg'])
```

---

## Error Handling

### PHP Style:
```javascript
fetch('/backend/api.php')
  .then(res => {
    if (!res.ok) throw new Error('API error')
    return res.json()
  })
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### Supabase Style:
```javascript
const { data, error } = await supabase
  .from('packages')
  .select('*')

if (error) {
  console.error('Error:', error.message)
  // Show user-friendly error
  alert('Failed to load packages')
} else {
  console.log('Data:', data)
  setPackages(data)
}
```

---

## Common Patterns

### Load Data on Component Mount

**Before:**
```javascript
useEffect(() => {
  fetch('/backend/getPackages.php')
    .then(res => res.json())
    .then(data => setPackages(data))
}, [])
```

**After:**
```javascript
useEffect(() => {
  async function loadPackages() {
    const { data } = await supabase.from('packages').select('*')
    setPackages(data)
  }
  loadPackages()
}, [])
```

---

### Submit Form

**Before:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  await fetch('/backend/createBooking.php', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
  
  alert('Booking created!')
}
```

**After:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  const { error } = await supabase
    .from('bookings')
    .insert([formData])
  
  if (!error) alert('Booking created!')
}
```

---

## Quick Migration Checklist

For each PHP file, follow these steps:

1. **Find all fetch() calls** to that PHP file
2. **Identify the operation** (GET, POST, UPDATE, DELETE)
3. **Look up the conversion** in this cheat sheet
4. **Replace the code**
5. **Test immediately**
6. **Move to next file**

---

## Example: Full Component Migration

### BEFORE (with PHP):
```javascript
import { useState, useEffect } from 'react'

function Packages() {
  const [packages, setPackages] = useState([])
  
  // Load packages
  useEffect(() => {
    fetch('/backend/getPackages.php')
      .then(res => res.json())
      .then(data => setPackages(data))
  }, [])
  
  // Delete package
  const handleDelete = async (id) => {
    await fetch('/backend/deletePackage.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    })
    // Reload packages
    fetch('/backend/getPackages.php')
      .then(res => res.json())
      .then(data => setPackages(data))
  }
  
  return (
    <div>
      {packages.map(pkg => (
        <div key={pkg.id}>
          <h3>{pkg.name}</h3>
          <button onClick={() => handleDelete(pkg.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

### AFTER (with Supabase):
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' // ADD THIS

function Packages() {
  const [packages, setPackages] = useState([])
  
  // Load packages
  useEffect(() => {
    async function loadPackages() {
      const { data } = await supabase.from('packages').select('*')
      setPackages(data)
    }
    loadPackages()
  }, [])
  
  // Delete package
  const handleDelete = async (id) => {
    await supabase.from('packages').delete().eq('id', id)
    // Reload packages
    const { data } = await supabase.from('packages').select('*')
    setPackages(data)
  }
  
  return (
    <div>
      {packages.map(pkg => (
        <div key={pkg.id}>
          <h3>{pkg.name}</h3>
          <button onClick={() => handleDelete(pkg.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

**Changes made:**
1. Added `import { supabase }` at top
2. Replaced `fetch()` with `supabase.from().select()`
3. Replaced delete `fetch()` with `supabase.from().delete().eq()`

**Lines changed: 3 out of ~30** (90% of code stayed the same!)

---

## Pro Tips

### 1. Test in Browser Console First
```javascript
// Open browser console on your page
const { data } = await supabase.from('packages').select('*')
console.log(data)
```

### 2. Use Supabase Dashboard SQL Editor
Run queries directly to test before coding:
```sql
SELECT * FROM packages WHERE is_active = true;
```

### 3. Enable Realtime (Bonus Feature!)
```javascript
// Auto-update when data changes
supabase
  .channel('packages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'packages'
  }, (payload) => {
    console.log('Package changed:', payload)
    // Reload packages automatically
  })
  .subscribe()
```

### 4. Use TypeScript for Better DX (Optional)
```typescript
// Supabase can generate types from your database
import { Database } from './database.types'

const supabase = createClient<Database>(url, key)

// Now you get autocomplete for table/column names!
```

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs/reference/javascript/introduction
- **Examples:** https://github.com/supabase/supabase/tree/master/examples
- **Discord:** https://discord.supabase.com

---

## Time Estimates by File Type

| PHP File Type | Conversion Time | Difficulty |
|---------------|----------------|------------|
| Simple GET (list data) | 5 min | 🟢 Easy |
| Simple POST (create) | 10 min | 🟢 Easy |
| UPDATE/DELETE | 10 min | 🟢 Easy |
| Complex query with JOINs | 20 min | 🟡 Medium |
| Authentication | 30 min | 🟡 Medium |
| File upload | 30 min | 🔴 Hard |
| Complex business logic | 45 min | 🔴 Hard |

**Total for typical FYP project (20-25 endpoints): 5-8 hours**
