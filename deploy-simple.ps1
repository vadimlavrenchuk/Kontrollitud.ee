# Simple Deploy Script for Kontrollitud.ee
# Usage: .\deploy-simple.ps1

Write-Host "Starting deployment..." -ForegroundColor Green

# Configuration
$SERVER = "root@kontrollitud.ee"
$REMOTE_DIR = "/root/Kontrollitud.ee"

# Step 1: Build frontend
Write-Host "`nBuilding frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Step 2: Create tar archive
Write-Host "`nCreating archive..." -ForegroundColor Yellow

# Create temp directory
$TempDir = "deploy_temp"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy files
Copy-Item -Recurse backend $TempDir\backend
New-Item -ItemType Directory -Path $TempDir\frontend | Out-Null
Copy-Item -Recurse frontend\dist $TempDir\frontend\dist
Copy-Item frontend\nginx.conf $TempDir\frontend\nginx.conf
Copy-Item .env $TempDir\.env
Copy-Item frontend\.env $TempDir\frontend\.env
Copy-Item docker-compose.yml $TempDir\docker-compose.yml

# Create tar
tar -czf deploy.tar.gz -C $TempDir .
Remove-Item -Recurse -Force $TempDir

Write-Host "Archive created" -ForegroundColor Green

# Step 3: Upload
Write-Host "`nUploading to server..." -ForegroundColor Yellow
scp deploy.tar.gz ${SERVER}:/tmp/deploy.tar.gz
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Deploy
Write-Host "`nDeploying on server..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_DIR && tar -xzf /tmp/deploy.tar.gz && rm /tmp/deploy.tar.gz && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker image prune -f"

# Cleanup
Remove-Item deploy.tar.gz

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Visit: https://kontrollitud.ee" -ForegroundColor Cyan
