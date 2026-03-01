# 🚀 Deploy con GitHub + Vercel (RECOMENDADO)

**Tiempo estimado:** 15 minutos  
**Ventaja:** Auto-deploy automático en cada push a GitHub

---

## ✅ Por qué GitHub + Vercel

- ✅ **Auto-deploy:** Cada push a `main` despliega automáticamente
- ✅ **Preview:** Cada PR crea preview deployment único
- ✅ **Rollback:** Fácil volver a versiones anteriores
- ✅ **CI/CD:** Build automático y testing
- ✅ **Git History:** Historial completo de cambios
- ✅ **Colaboración:** Múltiples desarrolladores

---

## 📋 PARTE 1: Subir a GitHub (5 minutos)

### Paso 1.1: Crear Repositorio en GitHub

1. **Ir a GitHub:** https://github.com/new

2. **Llenar formulario:**
   ```
   Repository name: marketinstrategy
   Description: SaaS de gestión de calendarios de marketing
   Visibility: ✓ Private (recomendado) o Public
   
   NO marcar:
   ❌ Add README (ya existe)
   ❌ Add .gitignore (ya existe)
   ❌ Choose license
   ```

3. **Click "Create repository"**

### Paso 1.2: Conectar tu Proyecto Local

```powershell
# En la carpeta del proyecto (ya debes estar aquí)
cd d:\PxY\laboratorio2\codigos\marketinstrategy

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit - Marketing Strategy SaaS completo"

# Conectar con GitHub (REEMPLAZA 'tu-usuario' con tu username de GitHub)
git remote add origin https://github.com/tu-usuario/marketinstrategy.git

# Renombrar branch a main
git branch -M main

# Subir a GitHub
git push -u origin main
```

**✅ Listo! Tu código está en GitHub**

---

## 📋 PARTE 2: Conectar con Vercel (5 minutos)

### Paso 2.1: Importar Proyecto en Vercel

1. **Ir a Vercel:** https://vercel.com/new

2. **Login con GitHub:**
   - Click "Continue with GitHub"
   - Autorizar Vercel

3. **Import Git Repository:**
   - Vercel mostrará tus repos de GitHub
   - Buscar: `marketinstrategy`
   - Click "Import"

### Paso 2.2: Configurar Proyecto

**Configure Project:**

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**✅ No tocar nada, Vercel lo detecta automáticamente**

### Paso 2.3: Configurar Variables de Entorno

**IMPORTANTE:** Antes de hacer deploy, agregar estas variables:

Click en **Environment Variables** → Agregar una por una:

```env
DATABASE_URL
mysql://user:password@host:3306/database
(Obtener de PlanetScale o Railway - ver Parte 3)

JWT_SECRET
Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Ejemplo: a3f9d2e8b1c4567890abcdef1234567890abcdef1234567890abcdef12345678

JWT_EXPIRES_IN
7d

NODE_ENV
production

NEXT_PUBLIC_APP_URL
https://tu-proyecto.vercel.app
(Vercel te dará la URL después del deploy, puedes editarla después)

MAX_UPLOAD_SIZE
104857600
```

**Aplicar a:** ✓ Production, ✓ Preview, ✓ Development

### Paso 2.4: Deploy!

Click **"Deploy"**

**Vercel automáticamente:**
1. ✅ Clona tu repo
2. ✅ Instala dependencias
3. ✅ Ejecuta `npm run build`
4. ✅ Despliega a producción
5. ✅ Te da una URL: `https://marketinstrategy-xxx.vercel.app`

**⏱️ Esperar 2-3 minutos...**

---

## 📋 PARTE 3: Configurar Base de Datos (5 minutos)

### Opción A: PlanetScale (Recomendado - MySQL Serverless)

1. **Crear cuenta:** https://planetscale.com

2. **Create database:**
   ```
   Name: marketingstrategy
   Region: AWS us-east-1 (o la más cercana)
   Plan: Hobby (gratis)
   ```

3. **Obtener connection string:**
   - Click en tu database
   - Tab "Connect"
   - Framework: **Prisma** o **MySQL**
   - Copiar connection string
   - Ejemplo: `mysql://user:pass@aws.connect.psdb.cloud/marketingstrategy?sslaccept=strict`

4. **Ejecutar SQL schema:**
   - Tab "Console" en PlanetScale
   - Copiar contenido de tu `schema.sql`
   - Ejecutar

5. **Actualizar en Vercel:**
   - Vercel Dashboard → Settings → Environment Variables
   - Editar `DATABASE_URL`
   - Pegar la connection string de PlanetScale
   - Save
   - **Redeploy:** Deployments → [...] → Redeploy

### Opción B: Railway (Alternativa)

1. **Crear cuenta:** https://railway.app

2. **New Project:**
   - Click "New Project"
   - Select "Provision MySQL"
   - Esperar a que termine

3. **Obtener connection string:**
   - Click en MySQL service
   - Tab "Connect"
   - Copiar "MySQL Connection URL"
   - Ejemplo: `mysql://root:pass@containers-us-west-1.railway.app:6789/railway`

4. **Importar schema:**
   ```powershell
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Link al proyecto
   railway link
   
   # Ejecutar schema
   railway run mysql -h containers-us-west-1.railway.app -u root -p < schema.sql
   ```

5. **Actualizar en Vercel:**
   - Igual que PlanetScale
   - Editar `DATABASE_URL` con la de Railway
   - Redeploy

---

## 📋 PARTE 4: Crear Usuario Admin (2 minutos)

### Método 1: Via API (Recomendado)

```powershell
# REEMPLAZA la URL con tu URL de Vercel
curl -X POST https://tu-proyecto.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "nombre": "Admin Principal",
    "email": "admin@tuempresa.com",
    "password": "AdminPass123!",
    "rol": "ADMIN"
  }'
```

### Método 2: SQL Directo

```sql
-- En PlanetScale Console o Railway
-- Password hash para "admin123"
INSERT INTO Usuario (id, nombre, email, passwordHash, rol, activo, createdAt, updatedAt)
VALUES (
  UUID(),
  'Admin Principal',
  'admin@tuempresa.com',
  '$2b$10$YhT4g5L8MwN2KpD9HxE6GuP7sJqV8ZwX3RtC1BnF5AoI2DhE7GfK6',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

---

## ✅ VERIFICAR DEPLOYMENT

### 1. App Carga

Ir a: `https://tu-proyecto.vercel.app`

**✅ Debería mostrar la página de login**

### 2. Login Funciona

```
Email: admin@tuempresa.com
Password: admin123 (o el que pusiste)
```

**✅ Debería redireccionar a `/dashboard`**

### 3. Revisar Logs (si hay errores)

Vercel Dashboard → Deployments → [último deploy] → Functions

**Buscar errores en:**
- `/api/auth/login`
- `/api/clients`
- `/api/campaigns`

**Errores comunes:**
- `DATABASE_URL not defined` → Agregar variable en Vercel
- `Connection refused` → Verificar IP whitelist en PlanetScale
- `JWT_SECRET required` → Agregar variable en Vercel

---

## 🔄 WORKFLOW DIARIO (Auto-Deploy)

De ahora en adelante, **cada cambio se despliega automáticamente:**

```powershell
# 1. Hacer cambios en el código
# ... editar archivos ...

# 2. Commit
git add .
git commit -m "Add: nueva feature XYZ"

# 3. Push a GitHub
git push origin main

# ✅ Vercel automáticamente detecta el push y despliega!
```

**Ver el deploy en:** Vercel Dashboard → Deployments

---

## 🌿 PREVIEW DEPLOYMENTS (Branches)

Para probar cambios antes de producción:

```powershell
# 1. Crear branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar ...

# 3. Commit y push
git add .
git commit -m "Work in progress"
git push origin feature/nueva-funcionalidad

# ✅ Vercel crea un preview deployment único!
# URL: https://marketinstrategy-git-feature-nueva-xxx.vercel.app
```

**Cuando esté listo:**
```powershell
# Merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main

# ✅ Se despliega automáticamente a producción!
```

---

## 📊 MONITOREO

### Ver Logs en Tiempo Real

**Opción 1: Vercel Dashboard**
- Deployments → [deployment] → Functions
- Click en cualquier función → Ver logs

**Opción 2: CLI**
```powershell
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Ver logs
vercel logs tu-proyecto.vercel.app --follow
```

### Analytics (Opcional)

Vercel Dashboard → Analytics (gratis en plan Pro)

---

## 🔧 ACTUALIZAR VARIABLES DE ENTORNO

Si necesitas cambiar `JWT_SECRET`, `DATABASE_URL`, etc:

1. Vercel Dashboard → Settings → Environment Variables
2. Editar variable
3. Save
4. **IMPORTANTE:** Deployments → [...] → Redeploy
   (Los cambios NO se aplican sin redeploy)

---

## 🌐 DOMINIO PERSONALIZADO (Opcional)

### Agregar tu Dominio

1. **Comprar dominio** (GoDaddy, Namecheap, etc.)

2. **En Vercel:**
   - Settings → Domains
   - Add Domain
   - Ingresar: `tudominio.com`

3. **Configurar DNS:**

   En tu registrador de dominios:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

4. **Esperar propagación:** 15 min - 48 hrs

5. **Actualizar variable:**
   ```env
   NEXT_PUBLIC_APP_URL = https://tudominio.com
   ```
   Redeploy

---

## 🎯 RESUMEN COMPLETO

### Lo que acabas de hacer:

1. ✅ Subiste código a GitHub
2. ✅ Conectaste GitHub con Vercel
3. ✅ Configuraste variables de entorno
4. ✅ Desplegaste a producción
5. ✅ Configuraste base de datos (PlanetScale/Railway)
6. ✅ Creaste usuario admin
7. ✅ Verificaste que todo funciona

### Lo que tienes ahora:

- 🌐 **App en producción:** `https://tu-proyecto.vercel.app`
- 🔄 **Auto-deploy:** Push a GitHub → Deploy automático
- 🌿 **Preview deployments:** Cada branch tiene su URL
- 📊 **Monitoreo:** Logs en tiempo real
- 🗄️ **Database serverless:** PlanetScale/Railway
- 🔐 **SSL/HTTPS:** Automático
- 📈 **Escalable:** Serverless auto-scaling

### Próximos pasos:

1. Login como ADMIN
2. Crear primer cliente
3. Crear primera campaña
4. Agregar contenidos
5. Crear usuario EDITOR
6. Crear usuario CLIENT
7. ¡Usar el sistema!

---

## 💡 TIPS IMPORTANTES

### Branches Recomendados

```
main          → Producción (auto-deploy)
develop       → Staging (preview deployment)
feature/*     → Features nuevas (preview deployment)
hotfix/*      → Fixes urgentes
```

### Git Best Practices

```powershell
# Commits descriptivos
git commit -m "Add: sistema de notificaciones"   # Nueva feature
git commit -m "Fix: error en upload de PDFs"     # Bug fix
git commit -m "Update: documentación de API"     # Actualización
git commit -m "Refactor: componente Modal"       # Refactoring

# Push frecuente
git push origin main  # Al menos 1 vez al día
```

### Vercel Best Practices

- ✅ Usar environment variables (NUNCA hardcodear secrets)
- ✅ Revisar logs después de cada deploy
- ✅ Testear en preview antes de merge a main
- ✅ Mantener `main` branch siempre estable
- ✅ Usar Git tags para releases (`v1.0.0`, `v1.1.0`, etc.)

---

## 🆘 TROUBLESHOOTING

### Error: "You don't have access to this deployment"
→ Verificar que estás logueado en Vercel con la cuenta correcta

### Error: "Build failed"
→ Revisar logs en Vercel Dashboard → Deployments → [failed] → Build Logs

### Error: "DATABASE_URL is not defined"
→ Agregar variable en Vercel → Settings → Environment Variables
→ Redeploy

### Error: "Connection timed out" (Database)
→ PlanetScale: Permitir todas las IPs (0.0.0.0/0)
→ Railway: Verificar connection string

### Deploy se queda "Building" por más de 10 min
→ Cancelar deploy
→ Verificar `package.json` scripts
→ Intentar deploy de nuevo

### Cambios no se reflejan
→ Hacer hard refresh: Ctrl + Shift + R
→ Limpiar caché del navegador
→ Verificar que el deploy terminó exitosamente

---

## 📞 RECURSOS

- **GitHub Docs:** https://docs.github.com
- **Vercel Docs:** https://vercel.com/docs
- **PlanetScale Docs:** https://planetscale.com/docs
- **Railway Docs:** https://docs.railway.app

---

## 🎉 ¡LISTO!

Tu **Marketing Strategy SaaS** está ahora:

- ✅ En GitHub (versionado)
- ✅ En Vercel (producción)
- ✅ Con base de datos serverless
- ✅ Con auto-deploy configurado
- ✅ Listo para escalar

**Cada vez que hagas push a GitHub, Vercel automáticamente despliega los cambios.** 🚀

---

**Siguiente:** Invita a tu equipo a colaborar en GitHub!
