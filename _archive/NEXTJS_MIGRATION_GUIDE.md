# 🚀 Next.js Migration Guide

## Overview
Converting from React + PHP to Next.js with Supabase for full online deployment.

## Architecture
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Migration Steps

### 1. Install Next.js
```bash
cd frontend/my-app
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js pg
```

### 2. Project Structure
```
frontend/my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (replaces PHP)
│   │   └── backend/
│   │       ├── login/
│   │       ├── register/
│   │       └── ...
│   ├── (auth)/            # Auth routes
│   ├── (main)/            # Main routes
│   └── layout.tsx
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   └── helpers.ts        # Helper functions
└── components/            # React components (same)
```

### 3. Database Connection
See `lib/db.ts` - Uses Supabase PostgreSQL connection

### 4. API Routes Pattern
All PHP files → Next.js API routes in `app/api/backend/[endpoint]/route.ts`

