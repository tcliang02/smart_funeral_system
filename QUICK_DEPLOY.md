# Quick Deployment Guide

## Step 1: Push to GitHub

### Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `smart-funeral-system`)
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### Push Your Code

```bash
# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smart-funeral-system.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. **IMPORTANT**: Set **Root Directory** to `frontend/my-app`
5. Configure environment variables (see below)
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend/my-app

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set root directory: frontend/my-app
# - Link to existing project or create new
```

## Step 3: Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required:
```
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret_key
```

### Optional (for AI features):
```
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key
```

## Step 4: Verify Deployment

After deployment:
1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test login/register
3. Test file uploads
4. Test booking flow

## Troubleshooting

### Build Fails
- Check Root Directory is set to `frontend/my-app`
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Database Connection Issues
- Ensure `DATABASE_URL` uses connection pooler if available
- Verify database allows connections from Vercel IPs
- Check Supabase project settings

### File Uploads Not Working
- Verify Supabase Storage is configured
- Check storage bucket permissions
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

