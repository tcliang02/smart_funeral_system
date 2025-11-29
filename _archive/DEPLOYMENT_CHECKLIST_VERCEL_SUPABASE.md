# ✅ Deployment Checklist: Vercel + Supabase

## Pre-Deployment Setup

### 1. Supabase Database Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Wait for database initialization (2-3 minutes)
- [ ] Import database schema (use SQL Editor or migration scripts)
- [ ] Test database connection locally
- [ ] Get connection credentials:
  - [ ] Connection string from Settings → Database
  - [ ] Anon key from Settings → API

### 2. Environment Variables Setup

**Local Development:**
- [ ] Copy `env.example` to `.env.local`
- [ ] Update `DATABASE_URL` with your Supabase connection string
- [ ] Update `DB_PASSWORD` (if using individual variables)
- [ ] Update `JWT_SECRET` (generate random string)
- [ ] Update `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Test locally: `npm run dev`

**Vercel Production:**
- [ ] Go to Vercel Dashboard → Project → Settings → Environment Variables
- [ ] Add `DATABASE_URL` (or individual DB_* variables)
- [ ] Add `JWT_SECRET`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set for all environments: Production, Preview, Development

### 3. Code Preparation
- [ ] All API routes converted to Next.js (`app/api/backend/*`)
- [ ] Frontend API calls use `/backend/*` endpoints
- [ ] TypeScript errors resolved (`npm run build` succeeds)
- [ ] All dependencies in `package.json`
- [ ] `vercel.json` configured correctly
- [ ] `next.config.js` configured

### 4. Testing
- [ ] Test database connection: `/api/backend/test-db`
- [ ] Test login: `/api/backend/login`
- [ ] Test register: `/api/backend/register`
- [ ] Test all critical API endpoints
- [ ] Test frontend pages load correctly
- [ ] Test authentication flow
- [ ] Test protected routes

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Configure project:
  - [ ] Root Directory: `frontend/my-app`
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Build Command: `npm run build` (default)
  - [ ] Output Directory: `.next` (default)

### Step 3: Add Environment Variables in Vercel
- [ ] Add all environment variables from `.env.local`
- [ ] Verify all variables are added
- [ ] Check variable names match exactly (case-sensitive)

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Note deployment URL

### Step 5: Post-Deployment Testing
- [ ] Visit deployment URL
- [ ] Test database connection: `https://your-app.vercel.app/api/backend/test-db`
- [ ] Test login functionality
- [ ] Test register functionality
- [ ] Test all critical features
- [ ] Check browser console for errors
- [ ] Check Vercel function logs for errors

## Post-Deployment

### Monitoring
- [ ] Set up Vercel Analytics (optional)
- [ ] Monitor function logs in Vercel Dashboard
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor Supabase database usage

### Optimization
- [ ] Enable Vercel Edge Network (automatic)
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic)
- [ ] Configure caching headers (if needed)

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Run `npm run build` locally to see errors
- Verify all dependencies are in `package.json`
- Check TypeScript errors

### Database Connection Fails
- Verify environment variables in Vercel Dashboard
- Check Supabase project is active
- Verify connection string format
- Test connection string locally

### API Routes Return 404
- Check `vercel.json` rewrites are correct
- Verify route files exist: `app/api/backend/[name]/route.ts`
- Check file exports correct HTTP methods

### Environment Variables Not Working
- Verify variables are added in Vercel Dashboard
- Check variable names match exactly
- Redeploy after adding variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

## Quick Commands

```bash
# Local development
cd frontend/my-app
npm run dev

# Build locally
npm run build

# Test production build
npm start

# Check TypeScript errors
npx tsc --noEmit

# Check linting
npm run lint
```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Architecture: See `VERCEL_SUPABASE_ARCHITECTURE.md`

---

**Status:** Ready to deploy! ✅

