# Railway Deployment - Quick Start Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Railway Deployment Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Step 1: Export Database
Write-Host "[Step 1/5] Exporting Database..." -ForegroundColor Yellow
Write-Host "ACTION REQUIRED: Start XAMPP MySQL if not running!" -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter when MySQL is running"

$exportPath = "c:\xampp\htdocs\smart_funeral_system\database_backup.sql"
C:\xampp\mysql\bin\mysqldump.exe -u root smart_funeral_system > $exportPath

if (Test-Path $exportPath) {
    Write-Host "✅ Database exported successfully!" -ForegroundColor Green
    Write-Host "   Location: $exportPath`n" -ForegroundColor Gray
} else {
    Write-Host "❌ Export failed! Make sure MySQL is running in XAMPP" -ForegroundColor Red
    exit 1
}

# Step 2: Install Railway CLI
Write-Host "[Step 2/5] Checking Railway CLI..." -ForegroundColor Yellow
$railwayCLI = Get-Command railway -ErrorAction SilentlyContinue

if (!$railwayCLI) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed!`n" -ForegroundColor Green
} else {
    Write-Host "✅ Railway CLI already installed!`n" -ForegroundColor Green
}

# Step 3: Login to Railway
Write-Host "[Step 3/5] Logging in to Railway..." -ForegroundColor Yellow
Write-Host "A browser window will open. Please sign in with GitHub." -ForegroundColor Cyan
railway login

# Step 4: Initialize Railway Project
Write-Host "`n[Step 4/5] Initializing Railway Project..." -ForegroundColor Yellow
cd c:\xampp\htdocs\smart_funeral_system\backend
railway init

# Step 5: Deploy Backend
Write-Host "`n[Step 5/5] Deploying Backend to Railway..." -ForegroundColor Yellow
railway up

Write-Host "`n================================" -ForegroundColor Green
Write-Host "✅ Backend Deployed!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Add MySQL database to your project" -ForegroundColor White
Write-Host "3. Set environment variables (DB_HOST, DB_USER, etc.)" -ForegroundColor White
Write-Host "4. Import database_backup.sql to Railway MySQL" -ForegroundColor White
Write-Host "5. Generate domain for your backend" -ForegroundColor White
Write-Host "6. Update frontend config with Railway URL" -ForegroundColor White
Write-Host "7. Deploy frontend to Vercel`n" -ForegroundColor White

Write-Host "Full guide: RAILWAY_DEPLOYMENT_COMPLETE_GUIDE.md" -ForegroundColor Gray
