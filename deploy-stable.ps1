# Stable deployment script for Kontrollitud.ee
# This script ensures proper Docker image rebuilding without errors

Write-Host "🚀 Starting deployment to kontrollitud.ee..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Pull latest code
Write-Host "📥 Pulling latest code from Git..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee && git pull"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git pull failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code updated successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Stop and remove all containers
Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee && docker-compose down"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: docker-compose down failed, continuing..." -ForegroundColor Yellow
}

Write-Host "✅ Containers stopped" -ForegroundColor Green
Write-Host ""

# Step 3: Remove dangling images (optional but recommended)
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "docker image prune -f"

Write-Host ""

# Step 4: Build fresh images
Write-Host "🔨 Building fresh Docker images..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee && docker-compose build --no-cache"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Start containers
Write-Host "▶️ Starting containers..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee && docker-compose up -d"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start containers!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Containers started" -ForegroundColor Green
Write-Host ""

# Step 6: Verify containers are running
Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$containerStatus = ssh root@kontrollitud.ee "docker ps --filter name=kontrollitudee --format '{{.Names}}: {{.Status}}'"

Write-Host ""
Write-Host "Container Status:" -ForegroundColor Cyan
Write-Host $containerStatus
Write-Host ""

if ($containerStatus -match "Up") {
    Write-Host "✅ Deployment successful! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your site is live at: https://kontrollitud.ee" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Warning: Some containers may not be running properly" -ForegroundColor Yellow
    Write-Host "Check logs with: ssh root@kontrollitud.ee 'docker-compose logs'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
