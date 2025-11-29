# ✅ Step 1 Complete - Setting Up .env.local

Based on your connection string: `postgres://postgres:9K5XOne9Fwq7Q71o@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres`

## Your .env.local should have:

```env
# Supabase Database Connection (Full connection string - RECOMMENDED)
DATABASE_URL=postgres://postgres:9K5XOne9Fwq7Q71o@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres

# Alternative: Individual variables (if DATABASE_URL doesn't work)
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3

# Supabase Client (for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
```

## Next Steps:

1. **Update .env.local** with the above content
2. **Restart dev server**: `npm run dev`
3. **Test connection**: Visit http://localhost:3000/api/backend/test-db

