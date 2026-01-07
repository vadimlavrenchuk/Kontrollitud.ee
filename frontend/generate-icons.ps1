# PWA Icon Generator Script
# This script helps generate PWA icons from your logo

Write-Host "PWA Icon Generator for Kontrollitud.ee" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "Required icon sizes:" -ForegroundColor Yellow
foreach ($size in $iconSizes) {
    Write-Host "  - ${size}x${size} pixels" -ForegroundColor White
}

Write-Host ""
Write-Host "To generate icons, you can use:" -ForegroundColor Green
Write-Host "  1. Online tools:" -ForegroundColor White
Write-Host "     - https://www.pwabuilder.com/imageGenerator" -ForegroundColor Cyan
Write-Host "     - https://realfavicongenerator.net/" -ForegroundColor Cyan
Write-Host "     - https://favicon.io/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Image editing software:" -ForegroundColor White
Write-Host "     - Photoshop / GIMP" -ForegroundColor Cyan
Write-Host "     - Figma / Canva" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Command line (ImageMagick):" -ForegroundColor White
Write-Host "     magick convert logo.png -resize 192x192 icon-192x192.png" -ForegroundColor Cyan
Write-Host ""

# Create icons directory
$iconsDir = Join-Path $PSScriptRoot "public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "Created directory: $iconsDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Place your generated icons in: public/icons/" -ForegroundColor Yellow
Write-Host "Files needed:" -ForegroundColor Yellow
foreach ($size in $iconSizes) {
    Write-Host "  - icon-${size}x${size}.png" -ForegroundColor White
}

Write-Host ""
Write-Host "Tip: Use your logo (logokontroll.jpg) as the source image" -ForegroundColor Magenta
Write-Host "Location: frontend/src/assets/logokontroll.jpg" -ForegroundColor Magenta

# Check if logo exists
$logoPath = Join-Path $PSScriptRoot "src\assets\logokontroll.jpg"
if (Test-Path $logoPath) {
    Write-Host ""
    Write-Host "✓ Logo found at: $logoPath" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠ Logo not found. Please check the path." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue..."
