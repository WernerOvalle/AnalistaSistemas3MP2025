# Script para detener el proyecto DICRI

Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contenedores detenidos exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para eliminar también los volúmenes (reinicia la BD):" -ForegroundColor Yellow
    Write-Host "  docker-compose down -v" -ForegroundColor White
} else {
    Write-Host "❌ Error al detener los contenedores" -ForegroundColor Red
}
