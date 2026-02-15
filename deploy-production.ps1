# Автоматический деплой на production
# Использование: .\deploy-production.ps1

Write-Host "🚀 Starting production deployment..." -ForegroundColor Cyan

# 1. Build frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Pop-Location

# 2. Copy files to server
Write-Host "`n📤 Uploading files to server..." -ForegroundColor Yellow
scp -r "$PSScriptRoot\frontend\dist\*" root@65.109.166.160:/var/www/kontrollitud.ee/frontend/

# 3. Copy critical files into Docker container
Write-Host "`n🐳 Copying files into Docker container..." -ForegroundColor Yellow
ssh root@65.109.166.160 @"
    docker cp /var/www/kontrollitud.ee/frontend/critical.css proxy_app_1:/var/www/kontrollitud.ee/frontend/critical.css
    docker cp /var/www/kontrollitud.ee/frontend/service-worker.js proxy_app_1:/var/www/kontrollitud.ee/frontend/service-worker.js
    docker cp /var/www/kontrollitud.ee/frontend/index.html proxy_app_1:/var/www/kontrollitud.ee/frontend/index.html
"@

# 4. Clear nginx cache and reload
Write-Host "`n🔄 Clearing nginx cache and reloading..." -ForegroundColor Yellow
ssh root@65.109.166.160 "docker exec proxy_app_1 rm -rf /var/cache/nginx/* && docker exec proxy_app_1 nginx -s reload"

# 5. Commit and push
Write-Host "`n📝 Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git add .
git commit -m $commitMessage
git push

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Check: https://kontrollitud.ee" -ForegroundColor Cyan
