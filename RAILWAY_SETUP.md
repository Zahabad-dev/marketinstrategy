# 🚂 Railway Database Setup Guide

**Tiempo:** 5 minutos  
**Costo:** GRATIS ($5 de crédito incluido)

---

## PASO 1: Crear Cuenta en Railway (1 min)

### 1.1 Registro

1. **Abre:** https://railway.app

2. **Login con GitHub:**
   - Click "Login with GitHub"
   - Autoriza Railway
   - Acepta términos

3. **Verificar cuenta:**
   - Railway te dará **$5 USD de crédito gratis**
   - Suficiente para varios meses de desarrollo

---

## PASO 2: Crear Base de Datos MySQL (2 min)

### 2.1 Nuevo Proyecto

1. **Click en "+ New Project"** (botón morado arriba a la derecha)

2. **Selecciona "Provision MySQL"**
   - Railway automáticamente crea un contenedor MySQL
   - Espera 20-30 segundos mientras se provisiona
   - ✅ Verás un nuevo servicio "MySQL" en tu proyecto

### 2.2 Obtener Connection String

1. **Click en el servicio "MySQL"** que apareció

2. **Ve a la pestaña "Variables"**

3. **Busca estas variables:**
   ```
   MYSQL_URL          (este es el que necesitas!)
   o
   DATABASE_URL
   ```

4. **Click en el ícono de copiar** 📋 al lado de `MYSQL_URL`

5. **Guarda esta URL** - La forma será algo así:
   ```
   mysql://root:AbCdEf123XyZ@containers-us-west-123.railway.app:6543/railway
   ```

   **⚠️ IMPORTANTE:** Esta es tu `DATABASE_URL` para Vercel

---

## PASO 3: Importar Schema SQL (2 min)

Tienes **2 opciones** - elige la que prefieras:

### Opción A: Railway Query Editor (MÁS FÁCIL) ✅

1. **En Railway, con el servicio MySQL seleccionado:**
   - Ve a la pestaña **"Data"**
   - Click en **"Query"** (arriba a la derecha)

2. **Abrir el schema:**
   - En VS Code, abre: `database/schema.sql`
   - Selecciona **TODO** el contenido (Ctrl+A)
   - Copia (Ctrl+C)

3. **Ejecutar en Railway:**
   - Pega el SQL en el Query Editor de Railway
   - Click **"Run"** o presiona **Ctrl + Enter**
   - Verás mensajes de éxito: ✅

4. **Verificar:**
   - Las tablas creadas aparecerán en "Data" → "Tables"
   - Deberías ver: `users`, `clients`, `campaigns`, `contents`

### Opción B: MySQL CLI (Si tienes mysql instalado)

```powershell
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Importar schema (REEMPLAZA con tu connection string)
mysql -h containers-us-west-123.railway.app -P 6543 -u root -p railway < database/schema.sql
# Te pedirá la password (está en la connection string)
```

---

## PASO 4: Verificar Base de Datos (30 seg)

1. **En Railway → Pestaña "Data":**
   - Deberías ver 4 tablas:
     - ✅ `users`
     - ✅ `clients`
     - ✅ `campaigns`
     - ✅ `contents`

2. **Click en "users":**
   - Debería estar vacía (0 rows)
   - Esto es normal, crearás el admin después

---

## PASO 5: Usar en Vercel

### 5.1 Copiar la Connection String

Ya la tienes de **PASO 2.2**, pero si la perdiste:

1. Railway → MySQL service → Variables
2. Copiar `MYSQL_URL`

### 5.2 Agregar a Vercel

Cuando configures tu proyecto en Vercel:

**Environment Variables:**
```
Name:  DATABASE_URL
Value: mysql://root:password@containers-us-west-123.railway.app:6543/railway
       (tu connection string de Railway)
```

**Aplicar a:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 📊 Información de Railway

### Plan Gratis

- **Crédito:** $5 USD gratis
- **Duración:** ~500 horas de uso (suficiente para desarrollo)
- **RAM:** 512 MB
- **Storage:** 1 GB
- **Conexiones:** Ilimitadas

### Cuándo se cobra

- Cuando se acaben los $5 (varios meses)
- Puedes agregar tarjeta para continuar (~$5-10/mes en producción)

### Ventajas de Railway

- ✅ Setup en 2 minutos
- ✅ No requiere tarjeta de crédito
- ✅ MySQL 8.0 actualizado
- ✅ Backups automáticos
- ✅ Query editor incluido
- ✅ Monitoreo en tiempo real
- ✅ Compatible con Vercel

---

## 🔧 Configuración Avanzada (Opcional)

### Permitir Conexiones Externas

Por defecto Railway ya permite conexiones desde cualquier IP. Si tienes problemas:

1. Railway → MySQL service → Settings
2. Scroll a "Networking"
3. Verifica que "Public Networking" esté **ON**

### Ver Logs

1. Railway → MySQL service
2. Pestaña "Logs"
3. Ver conexiones en tiempo real

### Crear Usuario Admin (después del deploy)

Una vez que Vercel esté desplegado:

```bash
# Opción 1: Via API
curl -X POST https://tu-proyecto.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin Principal",
    "email": "admin@tuempresa.com",
    "password": "AdminPass123!",
    "rol": "ADMIN"
  }'

# Opción 2: SQL directo en Railway Query
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
-- Password: admin123
```

---

## ⚠️ Troubleshooting

### Error: "Access denied for user"
→ Verifica que copiaste la connection string completa con la password

### Error: "Can't connect to MySQL server"
→ Verifica que Railway MySQL está running (debería mostrar verde)
→ Verifica Public Networking esté ON

### Error: "Unknown database"
→ Asegúrate de ejecutar TODO el schema.sql
→ La primera línea crea la database

### Tablas no aparecen
→ Ejecuta el schema.sql de nuevo
→ Verifica en Railway → Data → Tables

### Connection timeout
→ Railway puede estar reiniciando el servicio
→ Espera 1 minuto e intenta de nuevo

---

## 🎯 Resumen - Lista de Verificación

Antes de continuar a Vercel, verifica:

- ✅ Cuenta Railway creada
- ✅ Proyecto MySQL creado
- ✅ MYSQL_URL copiada y guardada
- ✅ Schema SQL ejecutado exitosamente
- ✅ 4 tablas visibles en Railway Data
- ✅ Connection string lista para Vercel

---

## 🚀 Siguiente Paso

Ahora que tienes la base de datos configurada:

**IR A VERCEL:**
https://vercel.com/new

1. Import tu repo de GitHub "marketinstrategy"
2. En Environment Variables, agregar:
   - `DATABASE_URL` = [tu MYSQL_URL de Railway]
3. Continuar con el deploy

**Guía completa:** Ver `DEPLOY_GITHUB_VERCEL.md`

---

## 📞 Recursos

- **Railway Docs:** https://docs.railway.app
- **Railway Status:** https://status.railway.app
- **Community Discord:** https://discord.gg/railway

---

**¡Listo!** Tu base de datos MySQL está configurada y lista para usarse con Vercel 🎉
