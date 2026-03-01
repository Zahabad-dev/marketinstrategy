@echo off
REM Marketing Strategy SaaS - Deploy Script for Windows
REM Este script automatiza el deployment a Vercel

echo 🚀 Marketing Strategy SaaS - Deployment Script
echo ================================================
echo.

REM Check if logged in to Vercel
echo 📝 Verificando login de Vercel...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ No estás logueado en Vercel
    echo Ejecuta: vercel login
    exit /b 1
)

echo ✅ Login verificado
echo.

REM Check environment variables
echo 🔐 Verificando variables de entorno...
echo.
echo Asegúrate de haber configurado en Vercel Dashboard:
echo   - DATABASE_URL
echo   - JWT_SECRET
echo   - NEXT_PUBLIC_APP_URL
echo.
set /p confirm="¿Has configurado las variables de entorno? (y/n): "

if /i not "%confirm%"=="y" (
    echo ❌ Por favor configura las variables de entorno primero
    echo Vercel Dashboard ^> Settings ^> Environment Variables
    exit /b 1
)

echo ✅ Variables confirmadas
echo.

REM Run type check
echo 🔍 Verificando TypeScript...
call npm run type-check
if errorlevel 1 (
    echo ❌ Errores de TypeScript encontrados
    exit /b 1
)
echo ✅ TypeScript OK
echo.

REM Run build locally to test
echo 🏗️  Probando build local...
call npm run build
if errorlevel 1 (
    echo ❌ Build falló
    exit /b 1
)
echo ✅ Build exitoso
echo.

REM Deploy to production
echo 🚀 Desplegando a Vercel...
call vercel --prod

if not errorlevel 1 (
    echo.
    echo ✅ ¡Deployment exitoso!
    echo.
    echo 📋 Próximos pasos:
    echo   1. Verifica que la app cargue: https://tu-app.vercel.app
    echo   2. Prueba login con usuario admin
    echo   3. Crea un cliente de prueba
    echo   4. Crea una campaña de prueba
    echo   5. Sube un contenido de prueba
    echo.
    echo 📊 Monitoreo:
    echo   - Vercel Dashboard: https://vercel.com/dashboard
    echo   - Logs: vercel logs --follow
    echo.
) else (
    echo ❌ Deployment falló
    exit /b 1
)
