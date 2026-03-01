#!/bin/bash

# Marketing Strategy SaaS - Deploy Script
# Este script automatiza el deployment a Vercel

echo "🚀 Marketing Strategy SaaS - Deployment Script"
echo "================================================"
echo ""

# Check if logged in to Vercel
echo "📝 Verificando login de Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "❌ No estás logueado en Vercel"
    echo "Ejecuta: vercel login"
    exit 1
fi

echo "✅ Login verificado"
echo ""

# Check environment variables
echo "🔐 Verificando variables de entorno..."
echo ""
echo "Asegúrate de haber configurado en Vercel Dashboard:"
echo "  - DATABASE_URL"
echo "  - JWT_SECRET"
echo "  - NEXT_PUBLIC_APP_URL"
echo ""
read -p "¿Has configurado las variables de entorno? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Por favor configura las variables de entorno primero"
    echo "Vercel Dashboard > Settings > Environment Variables"
    exit 1
fi

echo "✅ Variables confirmadas"
echo ""

# Run type check
echo "🔍 Verificando TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Errores de TypeScript encontrados"
    exit 1
fi
echo "✅ TypeScript OK"
echo ""

# Run build locally to test
echo "🏗️  Probando build local..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build falló"
    exit 1
fi
echo "✅ Build exitoso"
echo ""

# Deploy to production
echo "🚀 Desplegando a Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Deployment exitoso!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Verifica que la app cargue: https://tu-app.vercel.app"
    echo "  2. Prueba login con usuario admin"
    echo "  3. Crea un cliente de prueba"
    echo "  4. Crea una campaña de prueba"
    echo "  5. Sube un contenido de prueba"
    echo ""
    echo "📊 Monitoreo:"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Logs: vercel logs --follow"
    echo ""
else
    echo "❌ Deployment falló"
    exit 1
fi
