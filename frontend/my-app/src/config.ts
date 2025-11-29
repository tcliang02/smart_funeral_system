// API Configuration for Next.js deployment
// Next.js API routes are available at /api/backend/*
// The rewrite rule in next.config.js also maps /backend/* to /api/backend/*

// Always use Next.js API routes (both local and production)
// The database connection is now working via Supabase Connection Pooler
export const API_BASE_URL: string = '/api/backend';  // ✅ Use Next.js API routes (connects to Supabase)

// Backend URL for direct PHP calls (fallback for non-converted endpoints)
// Only used for endpoints that haven't been migrated to Next.js yet
// Note: All endpoints should now use Next.js API routes via API_BASE_URL
export const BACKEND_URL: string = '/api/backend';  // Use Next.js API routes

// Supabase is configured via environment variables in .env.local
// For production, add these to Vercel dashboard:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY

