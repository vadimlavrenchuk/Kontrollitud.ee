# Deploy without node_modules (faster)
# Usage: .\deploy-quick.ps1

Write-Host "Quick deployment..." -ForegroundColor Green

$SERVER = "root@kontrollitud.ee"
$REMOTE_DIR = "/root/Kontrollitud.ee"

# Build frontend
Write-Host "`nBuilding..." -ForegroundColor Yellow
cd frontend
npm run build
cd ..

# Create archive WITHOUT node_modules
Write-Host "`nCreating archive (no node_modules)..." -ForegroundColor Yellow

tar --exclude='node_modules' `
    --exclude='.git' `
    --exclude='*.tar*' `
    --exclude='ssl' `
    --exclude='frontend/src' `
    --exclude='frontend/public' `
    -czf deploy.tar.gz `
    backend `
    frontend/dist `
    frontend/nginx.conf `
    .env `
    frontend/.env `
    docker-compose.yml

Write-Host "Archive ready" -ForegroundColor Green

# Upload
Write-Host "`nUploading..." -ForegroundColor Yellow
scp deploy.tar.gz ${SERVER}:/tmp/

# Deploy
Write-Host "`nDeploying..." -ForegroundColor Yellow
$commands = "cd /root/Kontrollitud.ee && tar -xzf /tmp/deploy.tar.gz && rm /tmp/deploy.tar.gz && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker image prune -f && echo 'Done!'"
ssh $SERVER $commands

Remove-Item deploy.tar.gz
Write-Host "`nComplete! https://kontrollitud.ee" -ForegroundColor Green
