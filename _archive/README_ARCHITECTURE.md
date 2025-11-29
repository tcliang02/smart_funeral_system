# 🏗️ Smart Funeral System - Architecture Guide

## Architecture Overview

This project uses a modern serverless architecture:

```
┌─────────────────────────────────────┐
│         Vercel Platform             │
│  ┌───────────────────────────────┐  │
│  │   Frontend (Next.js App)      │  │
│  │   - React Components          │  │
│  │   - Pages & Routes            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Backend (Next.js API)       │  │
│  │   - /api/backend/*            │  │
│  │   - Serverless Functions      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│      Supabase (PostgreSQL)          │
│      - Database                     │
│      - Connection Pooling           │
└─────────────────────────────────────┘
```

**Components:**
- **Frontend**: Next.js React application
- **Backend**: Next.js API routes (serverless functions)
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel (frontend + backend)

## Quick Links

- 🚀 **Quick Start**: [`QUICK_START_VERCEL_SUPABASE.md`](./QUICK_START_VERCEL_SUPABASE.md) - 5-minute setup guide
- 📖 **Full Architecture**: [`VERCEL_SUPABASE_ARCHITECTURE.md`](./VERCEL_SUPABASE_ARCHITECTURE.md) - Complete architecture documentation
- ✅ **Deployment Checklist**: [`DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md`](./DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md) - Step-by-step deployment guide

## Project Structure

```
smart_funeral_system/
├── frontend/
│   └── my-app/                    # Next.js application
│       ├── app/                    # Next.js App Router
│       │   ├── api/               # Backend API routes
│       │   │   └── backend/       # All API endpoints
│       │   ├── layout.tsx         # Root layout
│       │   └── page.tsx           # Home page
│       ├── src/                   # Frontend source
│       │   ├── pages/             # React pages
│       │   ├── components/        # React components
│       │   └── api.js             # API client
│       ├── lib/                   # Shared utilities
│       │   ├── db.ts              # Database connection
│       │   └── helpers.ts         # Helper functions
│       ├── vercel.json            # Vercel configuration
│       ├── next.config.js         # Next.js configuration
│       └── .env.local             # Environment variables (gitignored)
│
└── backend/                       # Legacy PHP files (being migrated)
```

## Key Features

✅ **Serverless**: Auto-scaling, pay-per-use  
✅ **Global CDN**: Fast content delivery worldwide  
✅ **Zero DevOps**: No server management needed  
✅ **Type Safety**: TypeScript throughout  
✅ **Unified Deployment**: Frontend + Backend in one repo  

## Environment Variables

### Required Variables

**Server-side** (API routes):
- `DATABASE_URL` - Supabase connection string (recommended)
- OR `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET` - Authentication token secret

**Client-side** (browser):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

See [`frontend/my-app/env.example`](./frontend/my-app/env.example) for full template.

## Getting Started

### 1. Local Development

```bash
cd frontend/my-app
cp env.example .env.local
# Edit .env.local with your Supabase credentials
npm install
npm run dev
```

Visit: http://localhost:3000

### 2. Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory: `frontend/my-app`
4. Add environment variables
5. Deploy!

See [`QUICK_START_VERCEL_SUPABASE.md`](./QUICK_START_VERCEL_SUPABASE.md) for detailed steps.

## API Routes

All backend endpoints are in `app/api/backend/`:

- `/api/backend/login` - User authentication
- `/api/backend/register` - User registration
- `/api/backend/getTributes` - Get tribute list
- `/api/backend/getAllPackages` - Get all packages
- `/api/backend/createBooking` - Create booking
- ... and more

**URL Mapping:**
- Frontend calls: `/backend/login`
- Vercel rewrites to: `/api/backend/login`
- Next.js handles: `app/api/backend/login/route.ts`

## Database Connection

The project uses Supabase PostgreSQL with connection pooling:

- **Direct Connection**: `db.[project-ref].supabase.co:5432`
- **Connection Pooler** (recommended for Vercel): `aws-0-[region].pooler.supabase.com:6543`

Connection is configured in `lib/db.ts` and supports:
- Connection string (`DATABASE_URL`)
- Individual variables (`DB_HOST`, `DB_USER`, etc.)
- SSL encryption (required by Supabase)

## Migration Status

**Completed:**
- ✅ Next.js setup
- ✅ Database connection (Supabase)
- ✅ Authentication routes (login, register)
- ✅ Core API routes (getTributes, getAllPackages, etc.)

**In Progress:**
- ⏳ Remaining PHP endpoints → TypeScript conversion
- ⏳ Frontend API client updates

## Troubleshooting

### Database Connection Issues
- Verify Supabase project is active
- Check connection string format
- Ensure SSL is enabled
- See architecture guide for details

### Vercel Deployment Issues
- Check build logs in Vercel Dashboard
- Verify environment variables are set
- Ensure `vercel.json` is configured
- Test build locally: `npm run build`

### API Route Issues
- Check route file exists: `app/api/backend/[name]/route.ts`
- Verify HTTP method exports (GET, POST, etc.)
- Check `vercel.json` rewrites

## Documentation

- **Architecture**: [`VERCEL_SUPABASE_ARCHITECTURE.md`](./VERCEL_SUPABASE_ARCHITECTURE.md)
- **Quick Start**: [`QUICK_START_VERCEL_SUPABASE.md`](./QUICK_START_VERCEL_SUPABASE.md)
- **Deployment**: [`DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md`](./DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md)
- **Next.js Setup**: [`NEXTJS_SETUP_INSTRUCTIONS.md`](./NEXTJS_SETUP_INSTRUCTIONS.md)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Status**: ✅ Ready for deployment

**Architecture**: Vercel (Frontend + Backend) + Supabase (Database)

