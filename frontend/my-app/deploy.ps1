# 🚀 Quick Deploy Script for Vercel
# Run this script to deploy your website online!

Write-Host "🚀 Starting deployment to Vercel..." -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Vercel login status..." -ForegroundColor Yellow
$loginCheck = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  vercel login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "📦 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Add environment variables in Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "   2. Select your project" -ForegroundColor Cyan
    Write-Host "   3. Go to Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host "   4. Add all variables from .env.local" -ForegroundColor Cyan
    Write-Host "   5. Redeploy" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check errors above." -ForegroundColor Red
}

