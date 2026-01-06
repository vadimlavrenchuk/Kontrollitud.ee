# Fast Deploy using rsync
# Usage: .\deploy-fast.ps1

Write-Host "Fast deployment to kontrollitud.ee..." -ForegroundColor Green

$SERVER = "root@kontrollitud.ee"
$REMOTE_DIR = "/root/Kontrollitud.ee"

# Build frontend
Write-Host "`nBuilding frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "Build complete" -ForegroundColor Green

# Sync files using rsync (much faster than tar)
Write-Host "`nSyncing files to server..." -ForegroundColor Yellow

rsync -avz --delete `
  --exclude 'node_modules' `
  --exclude '.git' `
  --exclude '*.tar*' `
  --exclude 'ssl' `
  --exclude 'frontend/node_modules' `
  --exclude 'backend/node_modules' `
  --include 'backend/**' `
  --include 'frontend/dist/**' `
  --include 'frontend/nginx.conf' `
  --include '.env' `
  --include 'frontend/.env' `
  --include 'docker-compose.yml' `
  --exclude 'frontend/src' `
  --exclude 'frontend/public' `
  ./ ${SERVER}:${REMOTE_DIR}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Sync failed!" -ForegroundColor Red
    exit 1
}

# Restart on server
Write-Host "`nRestarting containers..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_DIR && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker image prune -f"

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Visit: https://kontrollitud.ee" -ForegroundColor Cyan
