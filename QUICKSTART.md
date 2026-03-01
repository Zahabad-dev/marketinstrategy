# 🎯 Guía de Inicio Rápido - Autenticación JWT

Esta guía te ayudará a configurar y probar el sistema de autenticación JWT en menos de 5 minutos.

## ⚡ Setup Rápido

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus secrets:

```bash
# Copiar archivo de configuración
cp .env.local.example .env.local

# Generar secrets seguros
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Edita `.env.local` con los secrets generados:

```env
JWT_SECRET=tu-secret-generado-aqui
REFRESH_TOKEN_SECRET=otro-secret-diferente-aqui
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
DATABASE_URL=mysql://user:password@localhost:3306/marketing_saas
```

### 2. Inicializar Base de Datos

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Crear tablas de base de datos
npm run db:init

# Poblar con datos de ejemplo (incluye usuarios de prueba)
npm run db:seed
```

### 3. Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🧪 Probar Autenticación

### Opción 1: Usando cURL

#### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marketing.com",
    "password": "admin123"
  }'
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "email": "admin@marketing.com",
      "nombre": "Admin User",
      "rol": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Guarda el `accessToken` para los siguientes pasos.**

#### 2. Acceder a Ruta Protegida

```bash
# Reemplaza YOUR_ACCESS_TOKEN con el token del paso anterior
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "email": "admin@marketing.com",
    "nombre": "Admin User",
    "rol": "ADMIN",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

#### 3. Probar Permisos por Rol

Listar usuarios (solo ADMIN):

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Crear contenido (ADMIN y EDITOR):

```bash
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campañaId": "uuid-de-campaña",
    "fecha": "2026-03-15",
    "titulo": "Nueva publicación",
    "tipo": "IMAGEN",
    "estado": "PENDIENTE"
  }'
```

#### 4. Refrescar Token

```bash
# Reemplaza YOUR_REFRESH_TOKEN con el refreshToken del login
export REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

### Opción 2: Usando Postman/Thunder Client

1. **Crear Colección "Marketing SaaS Auth"**

2. **Request: Login**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@marketing.com",
       "password": "admin123"
     }
     ```
   - Test Script (para guardar token):
     ```javascript
     const response = pm.response.json();
     pm.environment.set("access_token", response.data.accessToken);
     pm.environment.set("refresh_token", response.data.refreshToken);
     ```

3. **Request: Get My Profile**
   - Method: `GET`
   - URL: `http://localhost:3000/api/auth/me`
   - Headers:
     ```
     Authorization: Bearer {{access_token}}
     ```

4. **Request: List Users (Admin Only)**
   - Method: `GET`
   - URL: `http://localhost:3000/api/users`
   - Headers:
     ```
     Authorization: Bearer {{access_token}}
     ```

## 👥 Usuarios de Prueba

El comando `npm run db:seed` crea estos usuarios:

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| `admin@marketing.com` | `admin123` | ADMIN | Control total del sistema |
| `editor@marketing.com` | `editor123` | EDITOR | Gestión de contenidos |
| `cliente@empresa.com` | `cliente123` | CLIENT | Solo visualización |

## 🔐 Flujo de Autenticación

```
1. POST /api/auth/login
   ↓
2. Recibir accessToken y refreshToken
   ↓
3. Guardar tokens en localStorage/cookies
   ↓
4. Incluir accessToken en header de cada request:
   Authorization: Bearer <accessToken>
   ↓
5. Si accessToken expira (401):
   POST /api/auth/refresh con refreshToken
   ↓
6. Obtener nuevo accessToken
   ↓
7. Continuar usando nuevo accessToken
```

## 📋 Permisos por Rol

### ADMIN (Administrador)
- ✅ Gestionar usuarios (crear, leer, actualizar, eliminar)
- ✅ Gestionar clientes (CRUD completo)
- ✅ Gestionar campañas (CRUD completo)
- ✅ Gestionar contenidos del calendario (CRUD completo)
- ✅ Ver estadísticas y dashboard de administración

### EDITOR (Editor de Contenidos)
- ❌ NO puede gestionar usuarios
- ✅ Ver clientes
- ✅ Gestionar campañas (CRUD completo)
- ✅ Gestionar contenidos del calendario (CRUD completo)
- ✅ Ver todas las campañas y contenidos

### CLIENT (Cliente)
- ❌ NO puede gestionar usuarios
- ✅ Ver sus propios clientes
- ✅ Ver sus propias campañas mensuales
- ✅ Ver contenidos de sus campañas
- ❌ NO puede crear, editar o eliminar nada

## 🧪 Tests de Permisos

### Test 1: ADMIN puede listar usuarios

```bash
# Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@marketing.com", "password": "admin123"}' \
  | jq -r '.data.accessToken' > admin_token.txt

# Listar usuarios (debe funcionar)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $(cat admin_token.txt)"
```

✅ **Esperado**: Lista de usuarios (status 200)

### Test 2: CLIENT NO puede listar usuarios

```bash
# Login como cliente
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@empresa.com", "password": "cliente123"}' \
  | jq -r '.data.accessToken' > client_token.txt

# Intentar listar usuarios (debe fallar)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $(cat client_token.txt)"
```

❌ **Esperado**: Error 403 Forbidden

### Test 3: EDITOR puede crear contenido

```bash
# Login como editor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "editor@marketing.com", "password": "editor123"}' \
  | jq -r '.data.accessToken' > editor_token.txt

# Crear contenido (debe funcionar)
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer $(cat editor_token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "campañaId": "uuid-de-campaña",
    "fecha": "2026-03-15",
    "titulo": "Publicación de prueba",
    "tipo": "VIDEO_LINK",
    "urlReferencia": "https://youtube.com/watch",
    "estado": "PENDIENTE"
  }'
```

✅ **Esperado**: Contenido creado (status 201)

### Test 4: Sin token no puede acceder

```bash
# Intentar acceder sin token
curl http://localhost:3000/api/auth/me
```

❌ **Esperado**: Error 401 Unauthorized

## 🆘 Troubleshooting

### Error: "Token inválido o expirado"
- Verifica que JWT_SECRET en .env.local sea correcto
- Genera un nuevo token haciendo login nuevamente
- Verifica que el formato del header sea: `Bearer <token>`

### Error: "No autorizado - Token no proporcionado"
- Asegúrate de incluir el header `Authorization: Bearer <token>`
- Verifica que el token no tenga espacios extra

### Error: "Permisos insuficientes"
- Verifica el rol del usuario que está autenticado
- Confirma que el endpoint requiere ese rol específico
- Intenta con un usuario ADMIN para verificar

### Error: "Usuario no encontrado"
- Ejecuta `npm run db:seed` para crear usuarios de prueba
- Verifica la conexión a la base de datos

## 📚 Siguiente Paso

Lee la documentación completa en:
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Documentación completa de autenticación
- [examples/auth/README.md](./examples/auth/README.md) - Ejemplos de implementación

## 🎓 Recursos Adicionales

- **Verificar token JWT**: https://jwt.io/
- **Generar secrets**: `openssl rand -base64 32`
- **Logs del servidor**: Revisa la consola de Next.js para errores detallados
