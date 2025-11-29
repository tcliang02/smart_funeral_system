# Vercel Deployment Steps

## Prerequisites
- ✅ Code pushed to GitHub: https://github.com/tcliang2002/smart_funeral_system
- ✅ Vercel account: https://vercel.com/tan-chia-bi22-2712s-projects

## Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **"smart_funeral_system"** from your GitHub repositories
4. Click **"Import"**

## Step 2: Configure Project Settings

### Root Directory (CRITICAL!)
- Click **"Configure Project"**
- Under **"Root Directory"**, click **"Edit"**
- Set to: `frontend/my-app`
- Click **"Continue"**

### Framework Settings (Auto-detected)
- Framework Preset: **Next.js** ✅
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

## Step 3: Add Environment Variables

**BEFORE clicking Deploy**, add these environment variables:

Click **"Environment Variables"** and add:

### Required Variables:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |

### Optional (for AI features):

| Variable Name | Description |
|--------------|-------------|
| `ELEVENLABS_API_KEY` | For voice cloning |
| `OPENAI_API_KEY` | For AI chatbot |

**Important**: 
- Add variables for **Production**, **Preview**, and **Development** environments
- Or select **"Apply to all environments"**

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://smart-funeral-system.vercel.app` (or custom name)

## Step 5: Verify Deployment

After deployment completes:

1. ✅ Visit your Vercel URL
2. ✅ Test login/register functionality
3. ✅ Test file uploads
4. ✅ Test booking flow
5. ✅ Check API endpoints

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database connection works
- [ ] File uploads work (Supabase Storage)
- [ ] Authentication works
- [ ] API routes respond correctly
- [ ] No build errors in Vercel logs

## Troubleshooting

### Build Fails
- Check Root Directory is `frontend/my-app`
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel
- Use Supabase connection pooler if available

### File Uploads Not Working
- Verify Supabase Storage bucket exists
- Check storage policies are set
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

