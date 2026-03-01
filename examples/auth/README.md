# Ejemplos de Autenticación JWT

Este directorio contiene ejemplos de cómo implementar autenticación y autorización en las rutas API.

## 📁 Estructura de Ejemplos

```
examples/
├── basic-auth.ts              # Autenticación básica
├── admin-only.ts              # Solo administradores
├── role-based.ts              # Basado en roles
├── resource-ownership.ts      # Control de propiedad de recursos
└── README.md                  # Este archivo
```

## 🔐 Ejemplo 1: Autenticación Básica

Cualquier usuario autenticado puede acceder.

```typescript
// /pages/api/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, ApiResponse } from '@/lib'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Requiere solo estar autenticado
  const payload = await requireAuth(req, res)
  if (!payload) return // requireAuth already sent error response
  
  // Usuario autenticado - procesar request
  return ApiResponse.success(res, {
    userId: payload.userId,
    email: payload.email,
    rol: payload.rol
  })
}
```

## 👑 Ejemplo 2: Solo Administradores

Solo usuarios con rol ADMIN pueden acceder.

```typescript
// /pages/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole, ApiResponse, isAdmin } from '@/lib'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Requiere rol ADMIN
  const payload = await requireRole(req, res, UserRole.ADMIN)
  if (!payload) return
  
  // Solo admins llegan aquí
  const stats = await getAdminDashboardStats()
  return ApiResponse.success(res, stats)
}
```

## 📝 Ejemplo 3: Múltiples Roles

Editores y administradores pueden acceder.

```typescript
// /pages/api/content/create.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole, ApiResponse, validate, createContentSchema } from '@/lib'
import { ContentModel } from '@/models'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return ApiResponse.error(res, 'Method not allowed', 405)
  }
  
  // Requiere rol EDITOR o ADMIN
  const payload = await requireRole(req, res, [UserRole.ADMIN, UserRole.EDITOR])
  if (!payload) return
  
  try {
    // Validar datos
    const data = validate(createContentSchema, req.body)
    
    // Crear contenido
    const content = await ContentModel.create(data)
    
    return ApiResponse.success(res, content, 201)
  } catch (error) {
    return ApiResponse.error(res, error.message)
  }
}
```

## 🔒 Ejemplo 4: Control de Propiedad

Solo el propietario o admin puede modificar el recurso.

```typescript
// /pages/api/campaigns/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  requireAuth, 
  ApiResponse, 
  canModifyResource, 
  validate,
  updateCampaignSchema 
} from '@/lib'
import { CampaignModel, ClientModel } from '@/models'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  // Requiere autenticación
  const payload = await requireAuth(req, res)
  if (!payload) return
  
  // Obtener campaña
  const campaign = await CampaignModel.findById(id as string)
  if (!campaign) {
    return ApiResponse.notFound(res, 'Campaña no encontrada')
  }
  
  if (req.method === 'GET') {
    // Verificar si puede ver esta campaña
    const client = await ClientModel.findById(campaign.clienteId)
    if (!client) {
      return ApiResponse.notFound(res, 'Cliente no encontrado')
    }
    
    // Verificar acceso
    if (!canModifyResource(payload.rol, payload.userId, client.usuarioId)) {
      return ApiResponse.forbidden(res, 'No tienes acceso a esta campaña')
    }
    
    return ApiResponse.success(res, campaign)
  }
  
  if (req.method === 'PUT') {
    // Solo editores y admins pueden modificar
    const client = await ClientModel.findById(campaign.clienteId)
    if (!client) {
      return ApiResponse.notFound(res, 'Cliente no encontrado')
    }
    
    if (!canModifyResource(payload.rol, payload.userId, client.usuarioId)) {
      return ApiResponse.forbidden(res, 'No puedes modificar esta campaña')
    }
    
    try {
      const data = validate(updateCampaignSchema, req.body)
      const updated = await CampaignModel.update(id as string, data)
      return ApiResponse.success(res, updated)
    } catch (error) {
      return ApiResponse.error(res, error.message)
    }
  }
  
  return ApiResponse.error(res, 'Method not allowed', 405)
}
```

## 🎯 Ejemplo 5: Cliente Solo Ve Sus Datos

Clientes solo pueden ver sus propias campañas.

```typescript
// /pages/api/my/campaigns.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, ApiResponse, validate, paginationSchema } from '@/lib'
import { CampaignModel, ClientModel } from '@/models'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return ApiResponse.error(res, 'Method not allowed', 405)
  }
  
  const payload = await requireAuth(req, res)
  if (!payload) return
  
  try {
    // Validar paginación
    const validatedPagination = validate(paginationSchema, req.query)
    const pagination = {
      page: validatedPagination.page ?? 1,
      perPage: validatedPagination.perPage ?? 20,
    }
    
    let campaigns
    let total
    
    if (payload.rol === UserRole.CLIENT) {
      // Clientes solo ven sus campañas
      // 1. Obtener clientes asociados al usuario
      const clients = await ClientModel.findByUsuarioId(payload.userId)
      
      if (clients.length === 0) {
        return ApiResponse.success(res, {
          data: [],
          total: 0,
          page: pagination.page,
          perPage: pagination.perPage,
          totalPages: 0
        })
      }
      
      // 2. Obtener campañas de esos clientes
      const clientIds = clients.map(c => c.id)
      const allCampaigns = []
      
      for (const clientId of clientIds) {
        const clientCampaigns = await CampaignModel.findByClienteId(clientId)
        allCampaigns.push(...clientCampaigns)
      }
      
      campaigns = allCampaigns
      total = allCampaigns.length
      
    } else {
      // Editores y admins ven todas
      const filters = {
        clienteId: req.query.clienteId as string | undefined,
        estado: req.query.estado as string | undefined,
      }
      
      ;[campaigns, total] = await Promise.all([
        CampaignModel.list(filters, pagination),
        CampaignModel.count(filters)
      ])
    }
    
    return ApiResponse.success(res, {
      data: campaigns,
      total,
      page: pagination.page,
      perPage: pagination.perPage,
      totalPages: Math.ceil(total / pagination.perPage)
    })
    
  } catch (error) {
    console.error('My campaigns error:', error)
    return ApiResponse.serverError(res)
  }
}
```

## 🛠️ Helpers Disponibles

### Autenticación

```typescript
// Requiere solo estar autenticado
const payload = await requireAuth(req, res)
if (!payload) return // Ya envió respuesta de error

// Requiere rol específico
const payload = await requireRole(req, res, UserRole.ADMIN)
if (!payload) return

// Requiere uno de varios roles
const payload = await requireRole(req, res, [UserRole.ADMIN, UserRole.EDITOR])
if (!payload) return
```

### Respuestas API

```typescript
// Éxito
ApiResponse.success(res, data, 200)

// Errores
ApiResponse.error(res, 'Mensaje', 400)
ApiResponse.unauthorized(res, 'No autorizado')
ApiResponse.forbidden(res, 'Acceso denegado')
ApiResponse.notFound(res, 'No encontrado')
ApiResponse.serverError(res, 'Error del servidor')
```

### Permisos

```typescript
import { 
  isAdmin, 
  isEditorOrAdmin, 
  canModifyResource, 
  canDeleteResource 
} from '@/lib/permissions'

// Verificar si es admin
if (isAdmin(payload.rol)) {
  // Solo admins
}

// Verificar si es editor o admin
if (isEditorOrAdmin(payload.rol)) {
  // Editores y admins
}

// Verificar si puede modificar recurso
if (!canModifyResource(payload.rol, payload.userId, resourceOwnerId)) {
  return ApiResponse.forbidden(res)
}

// Verificar si puede eliminar recurso
if (!canDeleteResource(payload.rol, payload.userId, resourceOwnerId)) {
  return ApiResponse.forbidden(res)
}
```

## 📋 Checklist de Implementación

Para implementar autenticación en una nueva ruta API:

- [ ] Importar `requireAuth` o `requireRole` de `@/lib`
- [ ] Validar autenticación al inicio del handler
- [ ] Verificar permisos específicos si es necesario
- [ ] Usar `ApiResponse` helpers para respuestas consistentes
- [ ] Manejar errores apropiadamente
- [ ] Validar input con Zod schemas
- [ ] Registrar errores en logs
- [ ] Documentar endpoint en API docs

## 🧪 Testing

### Test de Autenticación

```bash
# Sin token - debe retornar 401
curl http://localhost:3000/api/profile

# Con token inválido - debe retornar 401
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer token_invalido"

# Con token válido - debe retornar 200
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Test de Roles

```bash
# Cliente intenta acceder a ruta de admin - debe retornar 403
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# Admin accede correctamente - debe retornar 200
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🔍 Debugging

Verificar payload del token:

```typescript
import { decodeToken } from '@/lib'

const decoded = decodeToken(token)
console.log('Token payload:', decoded)
```

Ver información del usuario autenticado:

```typescript
console.log('User ID:', payload.userId)
console.log('User email:', payload.email)
console.log('User role:', payload.rol)
console.log('Token issued at:', new Date(payload.iat! * 1000))
console.log('Token expires at:', new Date(payload.exp! * 1000))
```

## 📚 Referencias

- [AUTHENTICATION.md](../AUTHENTICATION.md) - Documentación completa
- [lib/api-helpers.ts](../lib/api-helpers.ts) - Implementación de helpers
- [lib/permissions.ts](../lib/permissions.ts) - Lógica de permisos
- [middleware.ts](../middleware.ts) - Middleware global
