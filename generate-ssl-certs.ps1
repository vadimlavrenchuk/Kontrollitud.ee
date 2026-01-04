# Generate self-signed SSL certificates for local development
# Uses Docker to run OpenSSL

Write-Host "Generating self-signed SSL certificates for localhost..." -ForegroundColor Green

# Check if ssl directory exists
if (-not (Test-Path ssl)) {
    New-Item -ItemType Directory -Path ssl
    Write-Host "Created ssl/ directory" -ForegroundColor Yellow
}

# Generate certificates using Docker
docker run --rm -v "${PWD}/ssl:/ssl" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
    -keyout /ssl/key.pem `
    -out /ssl/cert.pem `
    -subj "/C=EE/ST=Harjumaa/L=Tallinn/O=Kontrollitud/CN=localhost"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SSL certificates successfully created!" -ForegroundColor Green
    Write-Host "Location: $PWD\ssl\" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Files:" -ForegroundColor Yellow
    Write-Host "  - cert.pem (public certificate)" -ForegroundColor White
    Write-Host "  - key.pem (private key)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update docker-compose.yml (add volume for ssl and port 443)" -ForegroundColor White
    Write-Host "2. Restart containers: docker-compose down && docker-compose up --build" -ForegroundColor White
    Write-Host "3. Open https://localhost in browser" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTE: Browser will show a warning about self-signed certificate - this is normal." -ForegroundColor Yellow
    Write-Host "      Click 'Continue' or 'Advanced -> Proceed to localhost'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error creating certificates" -ForegroundColor Red
    Write-Host "Make sure Docker is running and try again." -ForegroundColor Yellow
    Write-Host ""
}
