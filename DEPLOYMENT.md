# 🚀 Guía de Deployment en Vercel

## Marketing Strategy SaaS - Deployment Production

Esta guía cubre el deployment completo del sistema como SaaS en Vercel con base de datos serverless y storage escalable.

---

## 📋 Pre-requisitos

### 1. Cuentas Necesarias
- ✅ Cuenta de [Vercel](https://vercel.com) (gratis)
- ✅ Cuenta de [PlanetScale](https://planetscale.com) o [Railway](https://railway.app) para MySQL serverless
- ✅ (Opcional) Cuenta de [Cloudinary](https://cloudinary.com) o AWS S3 para uploads

### 2. Herramientas Locales
```bash
# Node.js 18+ y npm
node --version  # v18.0.0 o superior
npm --version   # 9.0.0 o superior

# Git
git --version

# CLI de Vercel (opcional pero recomendado)
npm install -g vercel
```

---

## 🗄️ Paso 1: Configurar Base de Datos

### Opción A: PlanetScale (Recomendado - MySQL Serverless)

1. **Crear cuenta en [PlanetScale](https://planetscale.com)**

2. **Crear nueva base de datos:**
   ```
   Database name: marketingstrategy
   Region: US East (o más cercana)
   Plan: Hobby (gratis)
   ```

3. **Obtener connection string:**
   - Click en "Connect"
   - Seleccionar "Prisma" o "General"
   - Copiar DATABASE_URL
   - Ejemplo: `mysql://user:pass@aws.connect.psdb.cloud/marketingstrategy?sslaccept=strict`

4. **Ejecutar schema SQL:**
   - Abrir consola de PlanetScale
   - Ejecutar el contenido de `schema.sql` (crear archivo con schema de la base de datos)

### Opción B: Railway (MySQL/PostgreSQL)

1. **Crear cuenta en [Railway](https://railway.app)**

2. **Crear nuevo proyecto:**
   - New Project → Provision MySQL
   - Esperar a que termine setup

3. **Obtener DATABASE_URL:**
   - Click en MySQL service
   - Tab "Connect"
   - Copiar MySQL Connection URL

4. **Importar schema:**
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Conectar al proyecto
   railway link
   
   # Ejecutar migrations
   railway run mysql -u root -p < schema.sql
   ```

### Opción C: Vercel Postgres (PostgreSQL Serverless)

1. **En tu proyecto de Vercel:**
   - Storage → Create Database
   - Select Postgres
   - Copiar credenciales

2. **Adaptar queries a PostgreSQL:**
   - Cambiar ` por "
   - Ajustar sintaxis MySQL → PostgreSQL si es necesario

---

## 📦 Paso 2: Preparar el Proyecto

### 1. Clonar/Preparar Código

```bash
# Si está en Git
git clone https://github.com/tu-usuario/marketingstrategy.git
cd marketingstrategy

# O navegar al proyecto existente
cd d:\PxY\laboratorio2\codigos\marketinstrategy
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno Locales

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local con tus valores
# Mínimo requerido:
# - DATABASE_URL
# - JWT_SECRET
```

### 4. Probar Localmente

```bash
# Development server
npm run dev

# Verificar que funcione en http://localhost:3000
# Probar login, crear contenidos, etc.

# Build de producción (test)
npm run build
npm start
```

---

## ☁️ Paso 3: Deploy en Vercel

### Opción A: Deploy desde CLI (Recomendado)

```bash
# Login a Vercel
vercel login

# Deploy (primera vez)
vercel

# Responder preguntas:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? marketingstrategy
# - Directory? ./
# - Override settings? No

# Deploy a producción
vercel --prod
```

### Opción B: Deploy desde GitHub

1. **Push a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Marketing Strategy SaaS"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/marketingstrategy.git
   git push -u origin main
   ```

2. **Conectar en Vercel:**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Import Git Repository
   - Seleccionar tu repo
   - Framework Preset: Next.js
   - Root Directory: ./
   - Click "Deploy"

### Opción C: Deploy desde Dashboard

1. **Comprimir proyecto:**
   ```bash
   # Excluir node_modules y .next
   tar -czf marketing-strategy.tar.gz . --exclude=node_modules --exclude=.next --exclude=.git
   ```

2. **Upload manual en Vercel:**
   - Vercel Dashboard → Add New Project
   - Import from Archive
   - Upload .tar.gz
   - Deploy

---

## 🔐 Paso 4: Configurar Variables de Entorno en Vercel

### En Vercel Dashboard:

1. **Ir a tu proyecto → Settings → Environment Variables**

2. **Agregar variables requeridas:**

   **PRODUCCIÓN (Production):**
   ```
   DATABASE_URL = mysql://user:pass@host:3306/db?sslaccept=strict
   JWT_SECRET = genera-key-segura-de-32-chars-o-mas
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
   MAX_UPLOAD_SIZE = 104857600
   UPLOAD_DIR = ./public/uploads
   ```

   **OPCIONAL (si usas storage externo):**
   ```
   USE_EXTERNAL_STORAGE = true
   STORAGE_PROVIDER = S3
   AWS_ACCESS_KEY_ID = tu-key
   AWS_SECRET_ACCESS_KEY = tu-secret
   AWS_REGION = us-east-1
   AWS_S3_BUCKET = tu-bucket
   ```

3. **Generar JWT_SECRET seguro:**
   ```bash
   # En Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # O usa generador online (SSL):
   # https://randomkeygen.com/
   ```

4. **Aplicar a todos los environments:**
   - Marcar checkboxes: Production, Preview, Development
   - Save

---

## 📁 Paso 5: Configurar Storage de Uploads

### Opción A: Vercel Blob (Recomendado para Vercel)

```bash
# Instalar
npm install @vercel/blob

# Habilitar en Vercel Dashboard
# Storage → Blob → Create
```

**Actualizar `lib/upload.ts`:**
```typescript
import { put } from '@vercel/blob'

export async function uploadToVercelBlob(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  return blob.url
}
```

### Opción B: AWS S3

1. **Crear bucket en AWS:**
   - S3 → Create bucket
   - Nombre: `marketingstrategy-uploads`
   - Region: us-east-1
   - Public access: Block all (usar signed URLs)

2. **Crear IAM user:**
   - IAM → Users → Add user
   - Permissions: AmazonS3FullAccess
   - Copiar Access Key ID y Secret

3. **Agregar variables en Vercel:**
   ```
   USE_EXTERNAL_STORAGE = true
   STORAGE_PROVIDER = S3
   AWS_ACCESS_KEY_ID = AKIA...
   AWS_SECRET_ACCESS_KEY = ...
   AWS_S3_BUCKET = marketingstrategy-uploads
   AWS_REGION = us-east-1
   ```

### Opción C: Cloudinary (Más fácil)

1. **Crear cuenta en [Cloudinary](https://cloudinary.com)**

2. **Copiar credenciales:**
   - Dashboard → Account Details
   - Cloud name, API Key, API Secret

3. **Agregar variables en Vercel:**
   ```
   USE_EXTERNAL_STORAGE = true
   STORAGE_PROVIDER = CLOUDINARY
   CLOUDINARY_CLOUD_NAME = tu-cloud
   CLOUDINARY_API_KEY = 123456789
   CLOUDINARY_API_SECRET = abc123xyz
   ```

4. **Instalar SDK:**
   ```bash
   npm install cloudinary
   ```

---

## 🗃️ Paso 6: Inicializar Base de Datos

### Crear Usuario Admin Inicial

**Opción 1: Via API (después del deploy)**

```bash
# Crear primer admin via API
curl -X POST https://tu-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin Principal",
    "email": "admin@tuempresa.com",
    "password": "ChangeThisPassword123!",
    "rol": "ADMIN"
  }'
```

**Opción 2: Via SQL directo**

```sql
-- Conectar a la base de datos y ejecutar:
INSERT INTO Usuario (id, nombre, email, passwordHash, rol, activo, createdAt, updatedAt)
VALUES (
  UUID(),
  'Admin Principal',
  'admin@tuempresa.com',
  '$2b$10$hashed_password_here', -- Genera con bcrypt
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

**Generar password hash:**
```bash
# En Node.js
node
> const bcrypt = require('bcrypt')
> bcrypt.hashSync('TuPasswordSeguro123!', 10)
'$2b$10$...'
```

---

## ✅ Paso 7: Verificar Deployment

### Checklist de Verificación:

1. **✅ App carga correctamente**
   - Visitar `https://tu-app.vercel.app`
   - No debe mostrar errores 500

2. **✅ Login funciona**
   - Ir a `/login`
   - Ingresar credenciales del admin
   - Debe redireccionar a `/dashboard`

3. **✅ Database conexión OK**
   - Vercel Dashboard → Deployments → [último deploy] → Functions
   - Revisar logs de `/api/auth/login`
   - No debe haber errores de conexión

4. **✅ Upload funciona**
   - En dashboard, intentar subir una imagen
   - Verificar que se guarde y se muestre

5. **✅ Todas las rutas protegidas**
   - Intentar acceder a `/dashboard` sin login
   - Debe redireccionar a `/login`

6. **✅ Roles funcionan**
   - Login como ADMIN: puede crear clientes/campañas
   - Login como EDITOR: puede crear contenidos
   - Login como CLIENT: solo puede ver

---

## 🔒 Paso 8: Seguridad en Producción

### 1. Configurar CORS (ya en vercel.json)

Verificar que `vercel.json` tenga:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://tu-app.vercel.app" }
      ]
    }
  ]
}
```

### 2. Habilitar HTTPS (automático en Vercel)

Vercel provee SSL automático. Verificar:
- Usar solo HTTPS URLs
- Redirección HTTP → HTTPS habilitada

### 3. Rate Limiting

Agregar en `/middleware.ts` (crear si no existe):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Implementar rate limiting aquí
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### 4. Proteger variables sensibles

Nunca incluir en código:
- ❌ JWT_SECRET
- ❌ Database passwords
- ❌ API keys

Siempre usar environment variables.

---

## 📊 Paso 9: Monitoreo y Analytics

### 1. Vercel Analytics

```bash
# Instalar
npm install @vercel/analytics

# Agregar en layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Logs y Debugging

**Ver logs en tiempo real:**
```bash
vercel logs tu-app.vercel.app --follow
```

**En Vercel Dashboard:**
- Deployments → [deploy] → Functions
- Click en cualquier function para ver logs

### 3. Error Tracking (Opcional - Sentry)

```bash
npm install @sentry/nextjs

# Seguir wizard
npx @sentry/wizard@latest -i nextjs
```

---

## 🚀 Paso 10: Optimizaciones

### 1. Configurar Cache

**En `next.config.js`:**
```javascript
module.exports = {
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Image Optimization

Usar Next.js Image component:
```tsx
import Image from 'next/image'

<Image 
  src={content.archivoLocal}
  alt={content.titulo}
  width={800}
  height={600}
  priority={false}
/>
```

### 3. Code Splitting

Ya está habilitado por Next.js automáticamente.

---

## 🔄 Paso 11: CI/CD Automático

### Git + Vercel (Auto-deploy)

1. **Conectar GitHub/GitLab:**
   - Vercel detecta automáticamente pushes

2. **Configurar branches:**
   - `main` → Production
   - `develop` → Preview
   - Feature branches → Preview unique URLs

3. **Workflow:**
   ```bash
   # Desarrollo local
   git checkout -b feature/nueva-funcionalidad
   # ... hacer cambios ...
   git commit -m "Add: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   
   # Vercel automáticamente crea preview
   # Revisar en URL de preview
   
   # Merge a main
   git checkout main
   git merge feature/nueva-funcionalidad
   git push origin main
   
   # Vercel automáticamente deploya a producción
   ```

---

## 📱 Paso 12: Dominio Personalizado

### 1. Comprar dominio (ejemplo: marketingstrategy.com)

### 2. Configurar en Vercel:

**Vercel Dashboard:**
- Settings → Domains
- Add Domain
- Ingresar: `marketingstrategy.com`

### 3. Configurar DNS:

**En tu registrador (GoDaddy/Namecheap/Cloudflare):**

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 4. Esperar propagación (15 min - 48 hrs)

### 5. Actualizar NEXT_PUBLIC_APP_URL:

```
NEXT_PUBLIC_APP_URL = https://marketingstrategy.com
```

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL not defined"

**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Agregar DATABASE_URL
3. Redeploy

### Error: "Module not found"

**Solución:**
```bash
# Borrar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Error: "API route timeout"

**Solución:**
- Optimizar query de base de datos
- Agregar índices a tablas
- Aumentar timeout en vercel.json (max 60s en plan Pro)

### Error: "Upload failed"

**Solución:**
1. Verificar MAX_UPLOAD_SIZE
2. Verificar permisos de storage (S3/Cloudinary)
3. Check logs: `vercel logs`

### 502 Bad Gateway

**Solución:**
- Database no responde
- Verificar DATABASE_URL
- Verificar IP whitelist (PlanetScale requiere permitir todas IPs)

---

## 📈 Escalabilidad

### Plan Gratuito Vercel:
- ✅ 100GB bandwidth/mes
- ✅ Serverless functions ilimitadas
- ✅ 100 deployments/día
- ⚠️ 10s function timeout
- ⚠️ 4.5GB storage

### Cuándo escalar:

**Plan Pro ($20/mes):**
- 1TB bandwidth
- 60s function timeout
- Analytics avanzado
- Password protection
- Mejor soporte

**Enterprise:**
- Bandwidth ilimitado
- 900s timeout
- SLA 99.99%
- Dedicated support

---

## 🎯 Checklist Final Pre-Launch

- [ ] Database configurada y accesible
- [ ] Variables de entorno en Vercel configuradas
- [ ] JWT_SECRET generado de forma segura
- [ ] Storage de uploads configurado (Blob/S3/Cloudinary)
- [ ] Usuario ADMIN inicial creado
- [ ] Login funciona en producción
- [ ] Upload de archivos funciona
- [ ] Todas las rutas protegidas correctamente
- [ ] HTTPS habilitado (automático)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Analytics habilitado (opcional)
- [ ] Error tracking configurado (opcional)
- [ ] Backup de base de datos configurado
- [ ] Documentación entregada al cliente
- [ ] Credenciales admin entregadas de forma segura

---

## 📞 Soporte Post-Deploy

### Comandos Útiles:

```bash
# Ver logs en tiempo real
vercel logs --follow

# Redeploy
vercel --prod

# Rollback a deploy anterior
vercel rollback

# Listar deployments
vercel ls

# Ver info del proyecto
vercel inspect
```

### Recursos:

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PlanetScale Docs](https://planetscale.com/docs)

---

## 🎉 ¡Deployment Completo!

Tu SaaS de Marketing Strategy está ahora en producción:

- **URL:** `https://tu-app.vercel.app`
- **Database:** Serverless MySQL/PostgreSQL
- **Storage:** Vercel Blob / S3 / Cloudinary
- **Auto-scaling:** ✅
- **SSL:** ✅
- **CI/CD:** ✅

**Próximos pasos:**
1. Crear primeros clientes
2. Agregar campañas
3. Llenar calendario
4. Invitar equipo (editores)
5. Compartir acceso con clientes

---

**¿Necesitas ayuda?** Revisa los logs, consulta la documentación o contacta soporte de Vercel.
