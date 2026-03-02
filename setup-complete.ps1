# =====================================================
# Script de configuración completa de MarketinStrategy
# =====================================================

Write-Host "🚀 Configuración de Base de Datos MarketinStrategy" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Ruta de MySQL
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Verificar que MySQL existe
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL no encontrado en: $mysqlPath" -ForegroundColor Red
    Write-Host "Por favor, actualiza la ruta en este script." -ForegroundColor Yellow
    exit 1
}

# Solicitar contraseña de root
Write-Host "📝 Por favor ingresa la contraseña de root de MySQL:" -ForegroundColor Yellow
$rootPassword = Read-Host -AsSecureString
$rootPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword))

Write-Host ""
Write-Host "⚙️  Paso 1: Creando base de datos y usuario..." -ForegroundColor Green

# Ejecutar setup-db.sql
$setupResult = & $mysqlPath -u root -p"$rootPasswordPlain" < setup-db.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos y usuario creados correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear base de datos:" -ForegroundColor Red
    Write-Host $setupResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚙️  Paso 2: Creando tablas (schema)..." -ForegroundColor Green

# Ejecutar schema.sql
$schemaResult = & $mysqlPath -u marketuser -pmarketpass marketinstrategy < database/schema.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tablas creadas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear tablas:" -ForegroundColor Red
    Write-Host $schemaResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚙️  Paso 3: Creando usuario administrador..." -ForegroundColor Green

# Ejecutar create-admin-local.js
$adminResult = node create-admin-local.js 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Usuario administrador creado correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Verifica el resultado:" -ForegroundColor Yellow
    Write-Host $adminResult -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Credenciales de la base de datos:" -ForegroundColor Yellow
Write-Host "  Database: marketinstrategy" -ForegroundColor White
Write-Host "  Username: marketuser" -ForegroundColor White
Write-Host "  Password: marketpass" -ForegroundColor White
Write-Host "  Host: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "👤 Usuario Admin creado:" -ForegroundColor Yellow
Write-Host "  Email: admin@marketinstrategy.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Inicia el servidor con:" -ForegroundColor Green
Write-Host "  npm run dev:network" -ForegroundColor Cyan
Write-Host ""
