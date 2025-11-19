# Script para iniciar el proyecto DICRI

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Sistema de Gestión de Evidencias - DICRI" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Construir y levantar los contenedores
Write-Host "Construyendo e iniciando contenedores..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Aplicación iniciada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Servicios disponibles:" -ForegroundColor Cyan
    Write-Host "  - Frontend:  http://localhost:3002" -ForegroundColor White
    Write-Host "  - Backend:   http://localhost:3001" -ForegroundColor White
    Write-Host "  - SQL Server: localhost:1434" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
    Write-Host "  Técnico:     jperez / Password123!" -ForegroundColor White
    Write-Host "  Coordinador: mgonzalez / Password123!" -ForegroundColor White
    Write-Host "  Admin:       admin / Password123!" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver los logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Para detener:      docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al iniciar la aplicación" -ForegroundColor Red
    Write-Host "Ver logs con: docker-compose logs" -ForegroundColor Yellow
}
