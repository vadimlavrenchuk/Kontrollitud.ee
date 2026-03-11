# deploy.example.ps1 — Шаблон деплоя для Kontrollitud.ee
# Скопируй в deploy.local.ps1 и настрой под свой сервер
# deploy.local.ps1 НЕ попадёт в git (deploy*.ps1 в .gitignore)

$ErrorActionPreference = "Stop"
$StartTime = Get-Date

# ── НАСТРОЙКИ ───────────────────────────────────────────────────────────────
$SERVER          = "root@YOUR_DOMAIN_OR_IP"        # ssh root@kontrollitud.ee
$SERVER_FRONTEND = "/var/www/your-site/frontend/"   # путь к статике на сервере
$BACKEND_NAME    = "your-backend-container-name"    # имя Docker-контейнера бэкенда

function Step($n, $total, $msg) {
    Write-Host "`n[$n/$total] $msg" -ForegroundColor Yellow
}
function OK($msg)   { Write-Host "  OK: $msg" -ForegroundColor Green }
function FAIL($msg) { Write-Host "  FAIL: $msg" -ForegroundColor Red; exit 1 }
function WARN($msg) { Write-Host "  WARN: $msg" -ForegroundColor DarkYellow }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY: your-site.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Убеждаемся что запущен из корня проекта
if (-not (Test-Path "frontend\package.json")) {
    FAIL "Run this script from the project root (where frontend/ folder is)"
}

# ── 1. BUILD ────────────────────────────────────────────────────────────────
# Собирает фронтенд: минификация, code-splitting, оптимизация изображений
Step 1 4 "Building frontend (production)..."
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) { Set-Location ..; FAIL "npm run build failed" }
Set-Location ..
OK "Build complete"

# ── 2. UPLOAD ────────────────────────────────────────────────────────────────
# Загружает dist/ на сервер через SCP
Step 2 4 "Uploading dist/ to server..."
scp -r "frontend\dist\*" "${SERVER}:${SERVER_FRONTEND}"
if ($LASTEXITCODE -ne 0) { FAIL "scp upload failed" }
OK "Files uploaded"

# ── 3. SITEMAP ────────────────────────────────────────────────────────────────
# Запускает генерацию sitemap.xml на сервере (с динамическими URL компаний)
# Требует: backend/gen-sitemap-server.js
Step 3 4 "Regenerating sitemap.xml on server..."
scp "backend\gen-sitemap-server.js" "${SERVER}:/tmp/gen-sitemap.js" 2>$null
ssh $SERVER @"
docker cp /tmp/gen-sitemap.js ${BACKEND_NAME}:/app/gen-sitemap.js 2>/dev/null
docker exec ${BACKEND_NAME} node /app/gen-sitemap.js
docker cp ${BACKEND_NAME}:/tmp/sitemap.xml ${SERVER_FRONTEND}sitemap.xml
"@
if ($LASTEXITCODE -ne 0) {
    WARN "Sitemap generation failed (non-critical)"
} else {
    OK "sitemap.xml updated"
}

# ── 4. GIT PUSH ────────────────────────────────────────────────────────────────
Step 4 4 "Git push..."
$doPush = Read-Host "  Push to GitHub? (y/N)"
if ($doPush -eq "y" -or $doPush -eq "Y") {
    git push origin master
    if ($LASTEXITCODE -ne 0) { WARN "git push failed" } else { OK "Pushed to GitHub" }
} else {
    WARN "Skipped git push"
}

$Elapsed = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY COMPLETE in ${Elapsed}s" -ForegroundColor Green
Write-Host "  Site:    https://your-site.com" -ForegroundColor Cyan
Write-Host "  Sitemap: https://your-site.com/sitemap.xml" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
