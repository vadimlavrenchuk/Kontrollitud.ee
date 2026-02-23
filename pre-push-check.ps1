# 🔒 Pre-Push Security Check
# Проверка на наличие секретов перед push в GitHub
# Использование: .\pre-push-check.ps1

$ErrorActionPreference = "Continue"
$foundSecrets = $false

Write-Host "🔍 Scanning for secrets before push..." -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# 1. Проверка IP адресов в MD файлах
Write-Host "Checking: IP addresses..." -ForegroundColor Yellow
$ipResults = Get-ChildItem -Recurse -Filter "*.md" -File | 
             Where-Object { $_.FullName -notlike "*local*" } |
             Select-String -Pattern "\d+\.\d+\.\d+\.\d+" -ErrorAction SilentlyContinue

if ($ipResults) {
    Write-Host "❌ WARNING: Found IP addresses!" -ForegroundColor Red
    $foundSecrets = $true
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}

# 2. Проверка SSH команд
Write-Host "Checking: SSH commands..." -ForegroundColor Yellow  
$sshResults = Get-ChildItem -Recurse -Filter "*.md" -File |
              Where-Object { $_.FullName -notlike "*local*" } |
              Select-String -Pattern "ssh root@" -ErrorAction SilentlyContinue

if ($sshResults) {
    Write-Host "❌ WARNING: Found SSH commands!" -ForegroundColor Red
    $foundSecrets = $true
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}

# 3. Проверка admin emails
Write-Host "Checking: Admin emails..." -ForegroundColor Yellow
$emailResults = Get-ChildItem -Recurse -Filter "*.md" -File |
                Where-Object { $_.FullName -notlike "*local*" } |
                Select-String -Pattern "vadim.*@" -ErrorAction SilentlyContinue

if ($emailResults) {
    Write-Host "❌ WARNING: Found admin emails!" -ForegroundColor Red
    $foundSecrets = $true
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}

# 4. Проверка личных путей
Write-Host "Checking: Personal paths..." -ForegroundColor Yellow
$pathResults = Get-ChildItem -Recurse -Include "*.md","*.ps1" -File |
               Where-Object { $_.FullName -notlike "*local*" -and $_.FullName -notlike "*pre-push-check*" } |
               Select-String -Pattern "C:\\Users\\vadim" -ErrorAction SilentlyContinue

if ($pathResults) {
    Write-Host "❌ WARNING: Found personal paths!" -ForegroundColor Red
    $foundSecrets = $true
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}

# 5. Проверка .local файлов в git staging
Write-Host "`nChecking for .local files in staging..." -ForegroundColor Yellow
$localStaged = git diff --cached --name-only 2>$null | Where-Object { $_ -like "*local*" }

if ($localStaged) {
    Write-Host "❌ ERROR: .local files are staged!" -ForegroundColor Red
    foreach ($file in $localStaged) {
        Write-Host "   📄 $file" -ForegroundColor Yellow
    }
    $foundSecrets = $true
} else {
    Write-Host "✅ No .local files in staging" -ForegroundColor Green
}

# Итоговый результат
Write-Host "`n======================================" -ForegroundColor Cyan
if ($foundSecrets) {
    Write-Host "❌ SECURITY CHECK FAILED!" -ForegroundColor Red
    Write-Host "`nFound potential secrets in your code." -ForegroundColor Yellow
    Write-Host "Please review and fix before pushing.`n" -ForegroundColor Yellow
    
    Write-Host "Recommendations:" -ForegroundColor Cyan
    Write-Host "1. Move sensitive data to .local files" -ForegroundColor White
    Write-Host "2. Use placeholders like YOUR_SERVER, YOUR_API_KEY" -ForegroundColor White
    Write-Host "3. Check .gitignore is up to date" -ForegroundColor White
    Write-Host "4. Use environment variables for secrets`n" -ForegroundColor White
    
    exit 1
} else {
    Write-Host "✅ SECURITY CHECK PASSED!" -ForegroundColor Green
    Write-Host "`nNo obvious secrets detected." -ForegroundColor White
    Write-Host "Safe to push to GitHub.`n" -ForegroundColor White
    exit 0
}
