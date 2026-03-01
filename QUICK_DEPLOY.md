# 🎯 Quick Deploy - Marketing Strategy SaaS a Vercel

## Opción 1: Deploy Automático con Script (Windows)

```bash
# Ejecutar script de deployment
.\deploy.bat
```

El script automáticamente:
1. ✅ Verifica login de Vercel
2. ✅ Confirma variables de entorno configuradas
3. ✅ Ejecuta type-check de TypeScript
4. ✅ Prueba build local
5. ✅ Despliega a producción

---

## Opción 2: Deploy Manual Paso a Paso

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login a Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# Deploy a production
vercel --prod
```

---

## Configurar Variables de Entorno

**Antes del deploy, en [Vercel Dashboard](https://vercel.com/dashboard):**

Settings → Environment Variables → Add

```env
DATABASE_URL = mysql://user:pass@host:3306/db
JWT_SECRET = [generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN = 7d
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
MAX_UPLOAD_SIZE = 104857600
```

---

## Configurar Base de Datos

### PlanetScale (Recomendado - MySQL Serverless)

1. Crear cuenta: https://planetscale.com
2. Crear database: `marketingstrategy`
3. Obtener connection string
4. Ejecutar schema SQL en consola de PlanetScale
5. Copiar DATABASE_URL a Vercel

### Railway (Alternativa)

1. Crear cuenta: https://railway.app
2. New Project → Provision MySQL
3. Copiar MySQL Connection URL
4. Pegar en Vercel como DATABASE_URL

---

## Crear Usuario Admin Inicial

**Opción 1: Via API (después del deploy)**

```bash
curl -X POST https://tu-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin Principal",
    "email": "admin@tuempresa.com",
    "password": "TuPasswordSeguro123!",
    "rol": "ADMIN"
  }'
```

**Opción 2: Via SQL directo**

```sql
-- Password hash para "admin123"
INSERT INTO Usuario (id, nombre, email, passwordHash, rol, activo, createdAt, updatedAt)
VALUES (
  UUID(),
  'Admin Principal',
  'admin@tuempresa.com',
  '$2b$10$6ZJKvKq6sZX5h/YqGxN8/.YrXqZJYqQX7kKZVZbJhYqQX7kKZVZbJ',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

---

## Verificar Deployment

1. **✅ App carga:** Visitar `https://tu-app.vercel.app`
2. **✅ Login funciona:** Ir a `/login` e ingresar credenciales
3. **✅ Dashboard carga:** Debe redireccionar a `/dashboard`
4. **✅ Database conecta:** Revisar logs de Vercel
5. **✅ Upload funciona:** Intentar subir una imagen

---

## Monitoreo Post-Deploy

```bash
# Ver logs en tiempo real
vercel logs tu-app.vercel.app --follow

# Ver deployments
vercel ls

# Redeploy
vercel --prod

# Rollback a deploy anterior
vercel rollback
```

---

## Troubleshooting Rápido

### Error: "DATABASE_URL not defined"
→ Agregar variable en Vercel Dashboard → Redeploy

### Error: "Module not found"
→ `rm -rf .next && npm install && vercel --prod`

### Error: "JWT_SECRET required"
→ Generar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
→ Agregar en Vercel

### Error: 502 Bad Gateway
→ Database no responde
→ Verificar DATABASE_URL
→ Verificar IP whitelist en PlanetScale

---

## Dominio Personalizado (Opcional)

1. **Comprar dominio** (GoDaddy, Namecheap, etc.)
2. **En Vercel:** Settings → Domains → Add
3. **Configurar DNS:**
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```
4. **Esperar propagación** (15 min - 48 hrs)
5. **Actualizar variable:** `NEXT_PUBLIC_APP_URL = https://tudominio.com`

---

## 🎉 ¡Listo!

Tu SaaS está en producción en:
**https://tu-app.vercel.app**

**Documentación completa:** [DEPLOYMENT.md](DEPLOYMENT.md)
