# Deploy Script Example for Kontrollitud.ee
# Copy this file to deploy.local.ps1 and customize for your server

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# ============================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================

$SERVER = "root@YOUR_SERVER_IP_OR_DOMAIN"
$SERVER_PATH = "/var/www/yoursite/frontend/"

# ============================================
# BUILD FRONTEND
# ============================================

Write-Host "`n🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# ============================================
# DEPLOY TO SERVER
# ============================================

Write-Host "`n📤 Uploading files to server..." -ForegroundColor Yellow
scp -r "frontend\dist\*" "$SERVER`:$SERVER_PATH"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

# ============================================
# RELOAD SERVER (if using Nginx)
# ============================================

Write-Host "`n🔄 Reloading server..." -ForegroundColor Yellow
ssh $SERVER "docker exec YOUR_CONTAINER_NAME nginx -s reload"

# Or if not using Docker:
# ssh $SERVER "sudo systemctl reload nginx"

# ============================================
# COMMIT AND PUSH (optional)
# ============================================

Write-Host "`n📝 Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter to skip)"

if (-not [string]::IsNullOrWhiteSpace($commitMessage)) {
    git add .
    git commit -m $commitMessage
    git push
    Write-Host "✅ Changes committed and pushed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping git commit" -ForegroundColor Yellow
}

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Check: https://yoursite.com" -ForegroundColor Cyan
