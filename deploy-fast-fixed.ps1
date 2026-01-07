# Fast deployment with proper Docker cleanup
# Usage: .\deploy-fast-fixed.ps1

Write-Host "Fast deployment to kontrollitud.ee..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Pull latest code
Write-Host "Pulling code..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee; git pull"

# Step 2: ALWAYS stop containers first (prevents image hash errors)
Write-Host "Stopping containers..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee; docker-compose down"

# Step 3: Build
Write-Host "Building..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee; docker-compose build"

# Step 4: Start
Write-Host "Starting..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /root/Kontrollitud.ee; docker-compose up -d"

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
