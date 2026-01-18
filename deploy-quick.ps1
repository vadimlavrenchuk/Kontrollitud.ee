# Deploy without node_modules (faster)
# Usage: .\deploy-quick.ps1

Write-Host "Quick deployment..." -ForegroundColor Green

$SERVER = "root@kontrollitud.ee"

# Clean old build and build fresh
Write-Host "`nCleaning old build..." -ForegroundColor Yellow
Remove-Item frontend/dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend/node_modules/.vite -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Building fresh..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Create archive WITHOUT node_modules
Write-Host "`nCreating archive (no node_modules)..." -ForegroundColor Yellow

tar --exclude='node_modules' `
    --exclude='.git' `
    --exclude='*.tar*' `
    --exclude='ssl' `
    -czf deploy.tar.gz `
    backend `
    frontend `
    .env `
    docker-compose.yml

Write-Host "Archive ready" -ForegroundColor Green

# Upload
Write-Host "`nUploading..." -ForegroundColor Yellow
scp deploy.tar.gz ${SERVER}:/tmp/

# Deploy with forced rebuild (no Docker cache)
Write-Host "`nDeploying..." -ForegroundColor Yellow
$commands = @"
cd /root/Kontrollitud.ee
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
docker image prune -f
echo '✅ Deployment complete!'
"@
ssh $SERVER $commands

Remove-Item deploy.tar.gz
Write-Host "`nComplete! https://kontrollitud.ee" -ForegroundColor Green
