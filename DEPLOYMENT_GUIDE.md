# Deployment Guide - Smart Funeral System

## Git Setup & Push

### 1. Initial Commit

```bash
git add .
git commit -m "Initial commit: Smart Funeral System - Complete platform with service provider management, memorial creation, booking system, and AI features"
```

### 2. Create GitHub Repository

1. Go to GitHub and create a new repository
2. Copy the repository URL

### 3. Add Remote and Push

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Vercel Deployment

### Prerequisites

- GitHub account with your repository
- Vercel account (sign up at https://vercel.com)

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js

### Step 2: Configure Project Settings

**Root Directory**: Set to `frontend/my-app`

**Build Settings**:
- Framework Preset: Next.js
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables:

```
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional (for AI features):

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication (login/register)
- [ ] Test file uploads
- [ ] Test booking flow
- [ ] Verify database connections
- [ ] Check API endpoints are working
- [ ] Test on mobile devices

## Troubleshooting

### Build Fails

- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible from Vercel
- Check build logs for specific errors

### API Routes Not Working

- Ensure database connection string is correct
- Verify Supabase credentials
- Check CORS settings if needed

### File Uploads Failing

- Verify Supabase Storage is configured
- Check file size limits
- Ensure storage bucket permissions are set

## Notes

- Vercel automatically handles Next.js optimizations
- Serverless functions have execution time limits
- File uploads should use Supabase Storage (not local filesystem)
- Database must be accessible from Vercel's servers

