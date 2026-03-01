# Sistema de Autenticación JWT

Este documento describe el sistema completo de autenticación JWT implementado en la plataforma de Marketing SaaS.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Roles y Permisos](#roles-y-permisos)
- [Rutas de Autenticación](#rutas-de-autenticación)
- [Middleware de Protección](#middleware-de-protección)
- [Uso en API Routes](#uso-en-api-routes)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Variables de Entorno](#variables-de-entorno)

## 🏗️ Arquitectura

El sistema utiliza JWT (JSON Web Tokens) con dos tipos de tokens:

- **Access Token**: Válido por 7 días (configurable), usado para autenticar requests
- **Refresh Token**: Válido por 30 días (configurable), usado para renovar access tokens

### Componentes Principales

```
/lib
  ├── auth.ts          # Funciones JWT (generar, verificar tokens)
  ├── permissions.ts   # Control de acceso por roles
  └── validations.ts   # Schemas de validación

/pages/api/auth
  ├── login.ts         # Autenticación de usuarios
  ├── register.ts      # Registro de nuevos usuarios
  ├── refresh.ts       # Renovación de access token
  └── me.ts           # Obtener usuario actual

/middleware.ts         # Protección global de rutas
```

## 👥 Roles y Permisos

### Jerarquía de Roles

```typescript
enum UserRole {
  ADMIN = 'ADMIN',      // Nivel 3 - Control total
  EDITOR = 'EDITOR',    // Nivel 2 - Gestión de contenidos
  CLIENT = 'CLIENT'     // Nivel 1 - Solo visualización
}
```

### Matriz de Permisos

| Recurso | ADMIN | EDITOR | CLIENT |
|---------|-------|--------|--------|
| **Usuarios** | ✅ CRUD | ❌ | ❌ |
| **Clientes** | ✅ CRUD | ✅ Read | ✅ Read (solo propios) |
| **Campañas** | ✅ CRUD | ✅ CRUD | ✅ Read (solo propias) |
| **Contenidos** | ✅ CRUD | ✅ CRUD | ✅ Read (solo propios) |

### Funciones de Permisos

#### Verificación de Rol

```typescript
import { isAdmin, isEditorOrAdmin, hasRole } from '@/lib/permissions'

// Verificar si es admin
if (isAdmin(userRole)) {
  // Solo admins
}

// Verificar si es editor o admin
if (isEditorOrAdmin(userRole)) {
  // Editores y admins
}

// Verificar rol específico
if (hasRole(userRole, UserRole.EDITOR)) {
  // Usuario tiene rol de editor o superior
}
```

#### Control de Recursos

```typescript
import { canModifyResource, canDeleteResource } from '@/lib/permissions'

// Verificar si puede modificar
if (!canModifyResource(userRole, userId, resourceOwnerId)) {
  return res.status(403).json({ error: 'Acceso denegado' })
}

// Verificar si puede eliminar
if (!canDeleteResource(userRole, userId, resourceOwnerId)) {
  return res.status(403).json({ error: 'Acceso denegado' })
}
```

## 🔐 Rutas de Autenticación

### 1. Registro de Usuario

**POST** `/api/auth/register`

```typescript
// Request
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "nombre": "Juan Pérez",
  "rol": "CLIENT" // opcional, por defecto CLIENT
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "rol": "CLIENT",
    "createdAt": "2026-03-01T00:00:00.000Z"
  },
  "message": "Usuario registrado exitosamente"
}
```

### 2. Login

**POST** `/api/auth/login`

```typescript
// Request
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "rol": "CLIENT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Refresh Token

**POST** `/api/auth/refresh`

```typescript
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Usuario Actual

**GET** `/api/auth/me`

```typescript
// Headers
Authorization: Bearer <accessToken>

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "rol": "CLIENT",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

## 🛡️ Middleware de Protección

El archivo `middleware.ts` intercepta todas las requests y:

1. **Rutas Públicas**: Permite acceso sin autenticación
   - `/login`
   - `/register`
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/health`

2. **Rutas Protegidas**: Requiere token JWT válido
   - Verifica token de cookie o header `Authorization`
   - Valida firma y expiración del token
   - Extrae información del usuario (userId, email, rol)
   - Adjunta información al request mediante headers

3. **Comportamiento por Tipo de Ruta**:
   - **API Routes** (`/api/*`): Retorna 401 JSON si no autenticado
   - **Page Routes**: Redirige a `/login` con parámetro `?from=`

### Headers Inyectados

El middleware adjunta estos headers a las requests autenticadas:

```typescript
x-user-id: string      // ID del usuario
x-user-role: UserRole  // Rol del usuario (ADMIN/EDITOR/CLIENT)
```

## 📝 Uso en API Routes

### Patrón Estándar de Protección

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { extractTokenFromHeader, verifyAccessToken, isAdmin } from '@/lib'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Verificar autenticación
    const token = extractTokenFromHeader(req.headers.authorization as string)
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No autorizado' 
      })
    }
    
    // 2. Verificar token y extraer payload
    const payload = verifyAccessToken(token)
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido' 
      })
    }
    
    // 3. Verificar permisos según rol
    if (!isAdmin(payload.rol)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado' 
      })
    }
    
    // 4. Procesar request
    // ... tu lógica aquí
    
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor' 
    })
  }
}
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Ruta Solo para Admins

```typescript
// /pages/api/admin/users.ts
import { isAdmin } from '@/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = extractTokenFromHeader(req.headers.authorization as string)
  const payload = verifyAccessToken(token!)
  
  if (!isAdmin(payload!.rol)) {
    return res.status(403).json({ error: 'Solo administradores' })
  }
  
  // Lógica de administración de usuarios
  const users = await UserModel.list({}, { page: 1, perPage: 20 })
  return res.json({ success: true, data: users })
}
```

### Ejemplo 2: Ruta para Editores y Admins

```typescript
// /pages/api/campaigns/index.ts
import { isEditorOrAdmin } from '@/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = extractTokenFromHeader(req.headers.authorization as string)
  const payload = verifyAccessToken(token!)
  
  if (req.method === 'POST') {
    // Solo editores y admins pueden crear campañas
    if (!isEditorOrAdmin(payload!.rol)) {
      return res.status(403).json({ error: 'Permiso denegado' })
    }
    
    const campaign = await CampaignModel.create(req.body)
    return res.status(201).json({ success: true, data: campaign })
  }
  
  // GET: Todos los roles pueden ver campañas (filtradas por permisos)
  const filters = getAccessibleCampaignFilter(payload!.rol, payload!.userId)
  const campaigns = await CampaignModel.list(filters, { page: 1, perPage: 20 })
  return res.json({ success: true, data: campaigns })
}
```

### Ejemplo 3: Control de Recurso Específico

```typescript
// /pages/api/clients/[id].ts
import { canModifyResource } from '@/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const token = extractTokenFromHeader(req.headers.authorization as string)
  const payload = verifyAccessToken(token!)
  
  // Obtener recurso
  const client = await ClientModel.findById(id as string)
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' })
  }
  
  if (req.method === 'PUT') {
    // Verificar si puede modificar este cliente específico
    if (!canModifyResource(payload!.rol, payload!.userId, client.usuarioId)) {
      return res.status(403).json({ error: 'No puedes modificar este cliente' })
    }
    
    const updated = await ClientModel.update(id as string, req.body)
    return res.json({ success: true, data: updated })
  }
}
```

### Ejemplo 4: Cliente Solo Ve Sus Campañas

```typescript
// /pages/api/campaigns/my-campaigns.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = extractTokenFromHeader(req.headers.authorization as string)
  const payload = verifyAccessToken(token!)
  
  if (payload!.rol === UserRole.CLIENT) {
    // Obtener clientes del usuario
    const clients = await ClientModel.findByUsuarioId(payload!.userId)
    const clientIds = clients.map(c => c.id)
    
    // Obtener campañas de esos clientes
    const campaigns = await CampaignModel.list(
      { clienteId: clientIds[0] }, // Simplificado para ejemplo
      { page: 1, perPage: 20 }
    )
    
    return res.json({ success: true, data: campaigns })
  }
  
  // Editores y admins ven todas
  const campaigns = await CampaignModel.list({}, { page: 1, perPage: 20 })
  return res.json({ success: true, data: campaigns })
}
```

## 🔧 Variables de Entorno

Configurar en `.env.local`:

```bash
# JWT Configuration
JWT_SECRET=tu-secret-super-seguro-aqui-cambialo
REFRESH_TOKEN_SECRET=otro-secret-diferente-para-refresh
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Database (necesario para autenticación)
DATABASE_URL=mysql://user:password@localhost:3306/marketing_saas
```

### Generar Secrets Seguros

```bash
# En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# En OpenSSL
openssl rand -base64 32
```

## 🧪 Testing de Autenticación

### 1. Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marketing.com",
    "password": "admin123",
    "nombre": "Admin User",
    "rol": "ADMIN"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marketing.com",
    "password": "admin123"
  }'
```

### 3. Usar Token en Request

```bash
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca commitear secrets** en el control de versiones
2. **Usar HTTPS** en producción para proteger tokens en tránsito
3. **Rotar secrets** regularmente
4. **Validar input** siempre con Zod schemas
5. **Hashear passwords** con bcrypt (SALT_ROUNDS >= 10)
6. **Limitar intentos de login** para prevenir fuerza bruta
7. **Logs de acceso** para auditoría de seguridad
8. **Tokens de corta duración** y refresh token rotation

## 🎓 Flujo Completo de Autenticación

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    {email, password}
       ▼
┌─────────────────┐
│  Login Route    │
│  - Verifica     │
│    credenciales │
│  - Genera JWT   │
└──────┬──────────┘
       │
       │ 2. Retorna tokens
       │    {accessToken, refreshToken}
       ▼
┌─────────────┐
│   Cliente   │
│  Guarda     │
│  tokens     │
└──────┬──────┘
       │
       │ 3. Request a API protegida
       │    Authorization: Bearer <token>
       ▼
┌──────────────┐
│  Middleware  │
│  - Extrae    │
│    token     │
│  - Verifica  │
│  - Adjunta   │
│    user info │
└──────┬───────┘
       │
       │ 4. Headers con user info
       │    x-user-id, x-user-role
       ▼
┌──────────────────┐
│   API Route      │
│  - Verifica      │
│    permisos      │
│  - Procesa       │
│    request       │
└──────┬───────────┘
       │
       │ 5. Response
       ▼
┌─────────────┐
│   Cliente   │
└─────────────┘
```

## 📚 Referencias

- [JWT.io](https://jwt.io/) - Información sobre JSON Web Tokens
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) - Documentación oficial

## 🆘 Troubleshooting

### Token Inválido

- Verificar que JWT_SECRET coincida entre generación y verificación
- Revisar que el token no haya expirado
- Confirmar que el formato sea `Bearer <token>`

### Permisos Denegados

- Verificar rol del usuario en la base de datos
- Confirmar que la lógica de permisos esté correctamente implementada
- Revisar logs del servidor para detalles del error

### Usuario No Encontrado

- Verificar que el userId en el token coincida con un usuario existente
- Confirmar que la base de datos esté conectada correctamente
