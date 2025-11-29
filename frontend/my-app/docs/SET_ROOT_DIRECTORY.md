# 🔧 Set Root Directory in Vercel Dashboard

## ✅ Correct Setting:

Since you're deploying from **local file system** (not Git), the root directory should be:

### Option 1: Leave it EMPTY (Recommended)
- Go to: https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/settings/general
- Find "Root Directory"
- **Clear it** (make it empty/blank)
- Click "Save"

### Option 2: Set to `.` (current directory)
- Set Root Directory to: `.`
- Click "Save"

---

## ⚠️ Why This Happens:

When deploying via `vercel` CLI from `frontend/my-app`, Vercel should automatically use that directory as root. But if a root directory is set in the dashboard, it overrides the CLI setting.

**Solution:** Clear the root directory setting (make it empty) so Vercel uses the directory you're deploying from.

---

## ✅ After Clearing Root Directory:

1. **Redeploy** from `frontend/my-app`:
   ```powershell
   cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
   vercel --prod
   ```

2. **Or redeploy from Vercel dashboard:**
   - Deployments → ... → Redeploy

---

**The root directory should be EMPTY or `.` when deploying via CLI!**














