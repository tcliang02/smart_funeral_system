# Vercel Environment Variables Setup

## Required Environment Variables

To fix the 500 errors on Vercel, you need to set the following environment variables in your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/tan-chia-bi22-2712s-projects
- Select your project: `smart_funeral_system`
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables

#### Database Connection (REQUIRED)
```
DATABASE_URL=postgres://postgres:[YOUR_PASSWORD]@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

**OR** use individual variables:
```
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=4FEk9eJXBil2tyt2
DB_NAME=postgres
DB_PORT=5432
```

#### JWT Authentication (REQUIRED)
```
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters-long
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

#### Supabase Configuration (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY2NzA4NywiZXhwIjoyMDc4MjQzMDg3fQ.6nJQzduFKH6lk5-VBgNf59kl1BqNKkRIYLWw0ECE9zM
```

#### AI Services (REQUIRED)
```
DEEPSEEK_API_KEY=sk-3ff887b3eab042c9a3294fd3d62c8d80
```

#### Optional (for voice features)
```
ELEVENLABS_API_KEY=your-elevenlabs-key-if-using-voice-features
ELEVENLABS_API_URL=https://api.elevenlabs.io/v1
```

### 3. Set for All Environments
Make sure to add these variables for:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 4. Redeploy
After adding the variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

### 5. Test the Connection
After redeploying, test the database connection:
```
https://your-vercel-app.vercel.app/api/backend/test-db
```

Should return:
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

## Troubleshooting

### Still getting 500 errors?
1. Check Vercel logs: **Deployments** → Click deployment → **Functions** tab
2. Look for error messages about missing environment variables
3. Verify all variables are set correctly (no extra spaces, correct values)
4. Make sure variables are set for the correct environment (Production/Preview/Development)

### Database Connection Issues
- Verify your Supabase password is correct
- Check if your Supabase project is active
- Try using the connection pooler instead:
  ```
  DB_HOST=aws-0-[region].pooler.supabase.com
  DB_PORT=6543
  ```

### JWT_SECRET Issues
- Must be at least 32 characters long
- Should be a random, secure string
- Never commit this to Git!

## Quick Checklist

- [ ] DATABASE_URL or DB_* variables set
- [ ] JWT_SECRET set (32+ characters)
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] SUPABASE_SERVICE_ROLE_KEY set
- [ ] DEEPSEEK_API_KEY set
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after setting variables
- [ ] Test endpoint returns success

