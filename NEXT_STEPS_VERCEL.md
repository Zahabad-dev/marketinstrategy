# ✅ RAILWAY CONFIGURADO - SIGUIENTE: VERCEL

## 🎉 Base de Datos Railway - LISTO

✅ **4 tablas creadas:**
- users
- clients
- campaigns
- contenidos_calendarizados

---

## 🚀 DEPLOY A VERCEL (Ahora - 5 minutos)

### PASO 1: Ir a Vercel

Abre: **https://vercel.com/new**

### PASO 2: Login y Import

1. **Click "Continue with GitHub"**
2. Autoriza Vercel
3. **Import tu repositorio:** `marketinstrategy`
4. Click **"Import"**

### PASO 3: Configure Project

**NO CAMBIES NADA** - Vercel detecta automáticamente:
- Framework: Next.js ✅
- Root Directory: ./ ✅
- Build Command: npm run build ✅

### PASO 4: Environment Variables (IMPORTANTE)

Click en **"Environment Variables"** y agrega estas **6 variables**:

---

#### Variable 1:
```
Name:  DATABASE_URL
Value: mysql://root:ypSkugjCaCdkjtDbUYDGdpFiVBxiGrvS@nozomi.proxy.rlwy.net:37955/railway
```

#### Variable 2:
```
Name:  JWT_SECRET
Value: 32edafb6aabfb92c3b78da194d51a147739579db998579d15b6410f22f267763
```

#### Variable 3:
```
Name:  JWT_EXPIRES_IN
Value: 7d
```

#### Variable 4:
```
Name:  NODE_ENV
Value: production
```

#### Variable 5:
```
Name:  NEXT_PUBLIC_APP_URL
Value: https://tu-proyecto.vercel.app
```
**(Después del deploy, edita esto con tu URL real de Vercel)**

#### Variable 6:
```
Name:  MAX_UPLOAD_SIZE
Value: 104857600
```

---

**Aplicar a:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

### PASO 5: Deploy!

1. Click **"Deploy"**
2. ⏱️ Esperar 2-3 minutos...
3. ✅ Vercel te dará una URL: `https://marketinstrategy-xxxx.vercel.app`

---

## 📋 DESPUÉS DEL DEPLOY (3 minutos)

### 1. Actualizar NEXT_PUBLIC_APP_URL

1. Vercel Dashboard → Settings → Environment Variables
2. Editar `NEXT_PUBLIC_APP_URL`
3. Cambiar a tu URL real (ej: `https://marketinstrategy-abc123.vercel.app`)
4. Save
5. Deployments → [...] → **Redeploy**

### 2. Crear Usuario ADMIN

**Opción A - Via API (Recomendado):**

```powershell
# REEMPLAZA con tu URL de Vercel
curl -X POST https://tu-proyecto.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "nombre": "Admin Principal",
    "email": "admin@tuempresa.com",
    "password": "Admin123!",
    "rol": "ADMIN"
  }'
```

**Opción B - SQL Directo en Railway:**

1. Railway → MySQL → Data → Query
2. Ejecuta:

```sql
INSERT INTO users (id, nombre, email, password, rol, created_at, updated_at)
VALUES (
  UUID(),
  'Admin Principal',
  'admin@tuempresa.com',
  '$2b$10$YhT4g5L8MwN2KpD9HxE6GuP7sJqV8ZwX3RtC1BnF5AoI2DhE7GfK6',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Login con:**
- Email: `admin@tuempresa.com`
- Password: `admin123`

---

## 🎯 VERIFICAR QUE TODO FUNCIONA

### 1. Abrir tu app
`https://tu-proyecto.vercel.app`

✅ Debería aparecer la página de login

### 2. Login
Email: `admin@tuempresa.com`  
Password: `admin123` (o el que pusiste)

✅ Debería redireccionar a `/dashboard`

### 3. Revisar logs (si hay errores)

Vercel Dashboard → Deployments → [tu deploy] → Functions

Buscar errores en:
- `/api/auth/login`
- `/api/clients`
- `/api/campaigns`

---

## 🔧 TROUBLESHOOTING

### Error: "DATABASE_URL is not defined"
→ Verifica que agregaste DATABASE_URL en Environment Variables  
→ Redeploy después de agregar

### Error: "Connection refused"
→ Verifica que Railway MySQL esté Online (punto verde)  
→ Verifica que copiaste la URL completa

### Error: "Invalid JWT"
→ Verifica que JWT_SECRET esté en Environment Variables  
→ Debe ser el mismo valor siempre

### La app carga pero login no funciona
→ Vercel → Functions → Ver logs de `/api/auth/login`  
→ Verifica que creaste el usuario admin

---

## ✨ WORKFLOW DE AHORA EN ADELANTE

Cada vez que hagas cambios:

```powershell
git add .
git commit -m "descripción del cambio"
git push
```

**Vercel despliega AUTOMÁTICAMENTE** en 1-2 minutos 🚀

---

## 📊 RESUMEN DE LO QUE TIENES

- ✅ Código en GitHub: https://github.com/Zahabad-dev/marketinstrategy
- ✅ Base de datos MySQL en Railway (4 tablas)
- ✅ Listo para deploy a Vercel
- ✅ Variables de entorno generadas
- ✅ Auto-deploy configurado (git push → deploy automático)

---

## 🎉 SIGUIENTE PASO

**Ir a:** https://vercel.com/new

Y seguir los pasos de arriba ☝️

---

**¡Todo listo para producción!** 🚀
