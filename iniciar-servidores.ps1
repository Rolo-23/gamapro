# Script para iniciar backend y frontend en Windows PowerShell
Write-Host "🚀 Iniciando servidores del Sistema GAMA..." -ForegroundColor Green
Write-Host ""

# Verificar si existen los archivos .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No existe .env (frontend)" -ForegroundColor Yellow
    Write-Host "   Ejecutando setup-env..." -ForegroundColor Yellow
    node setup-env.mjs
    Write-Host ""
}

if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  No existe server\.env (backend)" -ForegroundColor Yellow
    Write-Host "   Ejecutando setup-env..." -ForegroundColor Yellow
    node setup-env.mjs
    Write-Host ""
}

Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Necesitas abrir DOS ventanas de PowerShell:" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd server" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "TERMINAL 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "¿Quieres que abra las terminales automáticamente? (S/N)" -ForegroundColor Cyan
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "Abriendo terminales..." -ForegroundColor Green
    
    # Terminal 1 - Backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; Write-Host '🔧 Backend - Terminal 1' -ForegroundColor Yellow; Write-Host 'Ejecuta: npm run dev' -ForegroundColor Cyan; Write-Host ''"
    
    # Terminal 2 - Frontend  
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🎨 Frontend - Terminal 2' -ForegroundColor Yellow; Write-Host 'Ejecuta: npm run dev' -ForegroundColor Cyan; Write-Host ''"
    
    Write-Host "✅ Terminales abiertas. Ejecuta 'npm run dev' en cada una." -ForegroundColor Green
}

