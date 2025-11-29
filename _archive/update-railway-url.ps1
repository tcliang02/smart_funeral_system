# Quick Railway Setup Script
# Run this after you get your Railway URL

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayURL
)

Write-Host "🚀 Updating configuration with Railway URL: $RailwayURL" -ForegroundColor Green

# Update config.js
$configPath = "frontend\my-app\src\config.js"
$configContent = Get-Content $configPath -Raw
$configContent = $configContent -replace "https://your-app-name\.railway\.app", $RailwayURL
Set-Content $configPath $configContent
Write-Host "✅ Updated config.js" -ForegroundColor Green

# Update login.js
$loginPath = "frontend\my-app\api\login.js"
$loginContent = Get-Content $loginPath -Raw
$loginContent = $loginContent -replace "https://your-app-name\.railway\.app", $RailwayURL
Set-Content $loginPath $loginContent
Write-Host "✅ Updated login.js" -ForegroundColor Green

# Update register.js
$registerPath = "frontend\my-app\api\register.js"
$registerContent = Get-Content $registerPath -Raw
$registerContent = $registerContent -replace "https://your-app-name\.railway\.app", $RailwayURL
Set-Content $registerPath $registerContent
Write-Host "✅ Updated register.js" -ForegroundColor Green

Write-Host ""
Write-Host "🎊 Configuration updated! Next steps:" -ForegroundColor Cyan
Write-Host "1. cd frontend\my-app" -ForegroundColor Yellow
Write-Host "2. vercel --prod" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your system will be accessible 24/7 with permanent URL! 🚀" -ForegroundColor Green
