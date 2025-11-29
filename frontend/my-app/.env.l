# Supabase Database Configuration (Server-side only)
# These are used in Next.js API routes
DB_HOST=wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=your-supabase-password-here
DB_NAME=postgres
DB_PORT=5432

# JWT Secret for authentication
# Generate a strong random string for production
JWT_SECRET=your-very-long-random-secret-key-here

# Supabase Client Configuration (Browser-accessible)
# Variables prefixed with NEXT_PUBLIC_ are exposed to the browser
# These are used in React components and client-side code
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Instructions:
# 1. Copy this file to .env.local (it's gitignored)
# 2. Replace all placeholder values with your actual Supabase credentials
# 3. Get credentials from: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
#    - DB_PASSWORD: Settings → Database → Connection String
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY: Settings → API → anon/public key
# 4. For Vercel deployment, add these same variables in Vercel Dashboard → Settings → Environment Variables

