# 🚀 Deploy Script for Kontrollitud.ee
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment to kontrollitud.ee..." -ForegroundColor Green

# Configuration
$SERVER = "root@kontrollitud.ee"
$REMOTE_DIR = "/root/Kontrollitud.ee"
$TAR_FILE = "kontrollitud-deploy.tar.gz"

# Step 1: Check if .env files exist
Write-Host "`n📝 Checking environment files..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "frontend\.env")) {
    Write-Host "❌ Error: frontend\.env file not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Environment files found" -ForegroundColor Green

# Step 2: Build frontend
Write-Host "`n🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 3: Create tar archive
Write-Host "`n📦 Creating deployment archive..." -ForegroundColor Yellow

# Files to include
$FilesToInclude = @(
    "backend/*",
    "frontend/dist/*",
    "frontend/nginx.conf",
    ".env",
    "frontend/.env",
    "docker-compose.yml",
    "package.json"
)

# Create temporary directory
$TempDir = "temp_deploy"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy backend
Copy-Item -Recurse "backend" "$TempDir/backend"

# Copy frontend dist and nginx conf
New-Item -ItemType Directory -Path "$TempDir/frontend" | Out-Null
Copy-Item -Recurse "frontend/dist" "$TempDir/frontend/dist"
Copy-Item "frontend/nginx.conf" "$TempDir/frontend/nginx.conf"

# Copy config files
Copy-Item ".env" "$TempDir/.env"
Copy-Item "frontend/.env" "$TempDir/frontend/.env"
Copy-Item "docker-compose.yml" "$TempDir/docker-compose.yml"
Copy-Item "package.json" "$TempDir/package.json"

# Create tar archive using tar (if available) or 7zip
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $TAR_FILE -C $TempDir .
} else {
    Write-Host "⚠️ tar not found, using PowerShell compression..." -ForegroundColor Yellow
    Compress-Archive -Path "$TempDir\*" -DestinationPath "$TAR_FILE.zip" -Force
    Rename-Item "$TAR_FILE.zip" $TAR_FILE
}

# Cleanup temp directory
Remove-Item -Recurse -Force $TempDir

Write-Host "✅ Archive created: $TAR_FILE" -ForegroundColor Green

# Step 4: Upload to server
Write-Host "`n📤 Uploading to server..." -ForegroundColor Yellow
scp $TAR_FILE "${SERVER}:/tmp/$TAR_FILE"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Upload complete" -ForegroundColor Green

# Step 5: Deploy on server
Write-Host "`n🔧 Deploying on server..." -ForegroundColor Yellow

$DeployCommands = @"
set -e
echo '📦 Extracting archive...'
cd $REMOTE_DIR
tar -xzf /tmp/$TAR_FILE
rm /tmp/$TAR_FILE

echo '🛑 Stopping containers...'
docker-compose down

echo '📦 Rebuilding containers...'
docker-compose build --no-cache

echo '🚀 Starting containers...'
docker-compose up -d

echo '🧹 Cleaning up old images...'
docker image prune -f

echo '✅ Deployment complete!'
docker-compose ps
"@

ssh $SERVER $DeployCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Cleanup local tar file
Remove-Item $TAR_FILE

Write-Host "`n✅ Deployment successful! 🎉" -ForegroundColor Green
Write-Host "Visit: https://kontrollitud.ee" -ForegroundColor Cyan
