# 📚 Documentación de API REST - Marketing SaaS

Documentación completa de todos los endpoints REST serverless del sistema.

## 🔐 Autenticación

Todos los endpoints (excepto `/api/auth/*`) requieren autenticación mediante JWT.

**Headers requeridos:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación-auth)
- [Usuarios](#usuarios-users)
- [Clientes](#clientes-clients)
- [Campañas](#campañas-campaigns)
- [Contenidos](#contenidos-contents)
- [Códigos de Respuesta](#códigos-de-respuesta)

---

## 🔑 Autenticación (/api/auth)

### POST /api/auth/register
Registrar nuevo usuario.

**Permisos:** Público

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com",
  "password": "contraseña123",
  "rol": "CLIENT"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "nombre": "Juan Pérez",
      "email": "juan@empresa.com",
      "rol": "CLIENT"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /api/auth/login
Iniciar sesión.

**Permisos:** Público

**Request Body:**
```json
{
  "email": "admin@marketing.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "nombre": "Administrador",
      "email": "admin@marketing.com",
      "rol": "ADMIN"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /api/auth/refresh
Refrescar token de acceso.

**Permisos:** Público

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

### GET /api/auth/me
Obtener usuario actual.

**Permisos:** Autenticado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombre": "Admin User",
    "email": "admin@marketing.com",
    "rol": "ADMIN",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

---

## 👥 Usuarios (/api/users)

### GET /api/users
Listar usuarios con paginación.

**Permisos:** ADMIN

**Query Parameters:**
- `page` (number, default: 1) - Número de página
- `perPage` (number, default: 20) - Items por página
- `rol` (string, optional) - Filtrar por rol: ADMIN, EDITOR, CLIENT
- `search` (string, optional) - Buscar por nombre o email

**Example:**
```bash
GET /api/users?page=1&perPage=10&rol=EDITOR&search=maria
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid...",
        "nombre": "María Editor",
        "email": "maria@marketing.com",
        "rol": "EDITOR",
        "createdAt": "2026-02-15T10:00:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "perPage": 10,
    "totalPages": 2
  }
}
```

### GET /api/users/[id]
Obtener usuario por ID.

**Permisos:** Autenticado (propio perfil) o ADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombre": "Usuario",
    "email": "usuario@example.com",
    "rol": "CLIENT",
    "createdAt": "2026-01-10T00:00:00.000Z"
  }
}
```

### PUT /api/users/[id]
Actualizar usuario.

**Permisos:** ADMIN o propio usuario

**Request Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "rol": "EDITOR"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombre": "Nuevo Nombre",
    "email": "usuario@example.com",
    "rol": "EDITOR",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

### DELETE /api/users/[id]
Eliminar usuario.

**Permisos:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Usuario eliminado"
  }
}
```

---

## 🏢 Clientes (/api/clients)

### GET /api/clients
Listar clientes con paginación.

**Permisos:** Autenticado
- **ADMIN/EDITOR**: Ven todos los clientes
- **CLIENT**: Solo sus propios clientes

**Query Parameters:**
- `page` (number, default: 1)
- `perPage` (number, default: 20)
- `search` (string, optional) - Buscar por nombre de empresa o contacto

**Example:**
```bash
GET /api/clients?page=1&perPage=20&search=empresa
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid...",
        "nombreEmpresa": "Empresa XYZ",
        "contacto": "contacto@empresa.com",
        "usuarioId": "uuid...",
        "createdAt": "2026-02-01T00:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "perPage": 20,
    "totalPages": 1
  }
}
```

### POST /api/clients
Crear nuevo cliente.

**Permisos:** Autenticado

**Request Body:**
```json
{
  "nombreEmpresa": "Empresa ABC",
  "contacto": "juan.perez@empresa.com",
  "usuarioId": "uuid-del-usuario"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombreEmpresa": "Empresa ABC",
    "contacto": "juan.perez@empresa.com",
    "usuarioId": "uuid...",
    "createdAt": "2026-03-01T12:30:00.000Z"
  }
}
```

### GET /api/clients/[id]
Obtener cliente por ID.

**Permisos:** Autenticado (owner) o ADMIN/EDITOR

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombreEmpresa": "Empresa ABC",
    "contacto": "contacto@empresa.com",
    "usuarioId": "uuid...",
    "createdAt": "2026-02-01T00:00:00.000Z"
  }
}
```

### PUT /api/clients/[id]
Actualizar cliente.

**Permisos:** ADMIN/EDITOR o owner

**Request Body:**
```json
{
  "nombreEmpresa": "Empresa ABC S.A.",
  "contacto": "nuevo.contacto@empresa.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "nombreEmpresa": "Empresa ABC S.A.",
    "contacto": "nuevo.contacto@empresa.com",
    "usuarioId": "uuid...",
    "updatedAt": "2026-03-01T13:00:00.000Z"
  }
}
```

### DELETE /api/clients/[id]
Eliminar cliente.

**Permisos:** ADMIN/EDITOR o owner

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Cliente eliminado"
  }
}
```

---

## 📊 Campañas (/api/campaigns)

### GET /api/campaigns
Listar campañas con paginación.

**Permisos:** Autenticado
- **ADMIN/EDITOR**: Ven todas las campañas
- **CLIENT**: Solo sus propias campañas

**Query Parameters:**
- `page` (number, default: 1)
- `perPage` (number, default: 20)
- `clienteId` (string, optional) - Filtrar por cliente
- `estado` (string, optional) - PLANIFICADA, EN_PROGRESO, COMPLETADA, CANCELADA
- `mes` (number, optional) - Filtrar por mes (1-12)
- `año` (number, optional) - Filtrar por año

**Example:**
```bash
GET /api/campaigns?clienteId=uuid&mes=3&año=2026&estado=EN_PROGRESO
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid...",
        "clienteId": "uuid...",
        "mes": 3,
        "año": 2026,
        "objetivoGeneral": "Campaña de lanzamiento de producto",
        "estado": "EN_PROGRESO",
        "createdAt": "2026-03-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "perPage": 20,
    "totalPages": 1
  }
}
```

### POST /api/campaigns
Crear nueva campaña.

**Permisos:** Autenticado

**Request Body:**
```json
{
  "clienteId": "uuid...",
  "mes": 4,
  "año": 2026,
  "objetivoGeneral": "Incrementar ventas en un 20%",
  "estado": "PLANIFICADA"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "clienteId": "uuid...",
    "mes": 4,
    "año": 2026,
    "objetivoGeneral": "Incrementar ventas en un 20%",
    "estado": "PLANIFICADA",
    "createdAt": "2026-03-01T14:00:00.000Z"
  }
}
```

### GET /api/campaigns/[id]
Obtener campaña por ID.

**Permisos:** Autenticado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "clienteId": "uuid...",
    "mes": 3,
    "año": 2026,
    "objetivoGeneral": "Campaña mensual",
    "estado": "EN_PROGRESO"
  }
}
```

### PUT /api/campaigns/[id]
Actualizar campaña.

**Permisos:** ADMIN o EDITOR

**Request Body:**
```json
{
  "objetivoGeneral": "Objetivo actualizado",
  "estado": "COMPLETADA"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "objetivoGeneral": "Objetivo actualizado",
    "estado": "COMPLETADA",
    "updatedAt": "2026-03-01T15:00:00.000Z"
  }
}
```

### DELETE /api/campaigns/[id]
Eliminar campaña.

**Permisos:** ADMIN o EDITOR

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Campaña eliminada"
  }
}
```

### GET /api/campaigns/calendar
Ver campañas en formato calendario (endpoint especial).

**Permisos:** Autenticado

**Query Parameters:**
- `mes` (number, required) - Mes (1-12)
- `año` (number, required) - Año
- `clienteId` (string, optional) - Filtrar por cliente

**Example:**
```bash
GET /api/campaigns/calendar?mes=3&año=2026&clienteId=uuid
```

---

## 📄 Contenidos (/api/contents)

### GET /api/contents
Listar contenidos con paginación.

**Permisos:** Autenticado

**Query Parameters:**
- `page` (number, default: 1)
- `perPage` (number, default: 20)
- `campañaId` (string, optional) - Filtrar por campaña
- `estado` (string, optional) - PENDIENTE, EN_REVISION, APROBADO, PUBLICADO, RECHAZADO
- `tipo` (string, optional) - VIDEO_LINK, VIDEO_FILE, IMAGEN, PDF

**Example:**
```bash
GET /api/contents?campañaId=uuid&estado=APROBADO&tipo=IMAGEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid...",
        "campañaId": "uuid...",
        "fecha": "2026-03-15",
        "titulo": "Post Instagram",
        "descripcion": "Imagen promocional",
        "tipo": "IMAGEN",
        "archivoLocal": "/uploads/imagen/2026/03/file.jpg",
        "estado": "APROBADO",
        "createdAt": "2026-03-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "perPage": 20,
    "totalPages": 2
  }
}
```

### POST /api/contents
Crear nuevo contenido.

**Permisos:** Autenticado

**Request Body (VIDEO_LINK):**
```json
{
  "campañaId": "uuid...",
  "fecha": "2026-03-20",
  "titulo": "Video YouTube",
  "descripcion": "Video promocional",
  "tipo": "VIDEO_LINK",
  "urlReferencia": "https://youtube.com/watch?v=...",
  "estado": "PENDIENTE"
}
```

**Request Body (IMAGEN/VIDEO_FILE/PDF - con archivo):**
```json
{
  "campañaId": "uuid...",
  "fecha": "2026-03-20",
  "titulo": "Imagen promocional",
  "descripcion": "Banner para Facebook",
  "tipo": "IMAGEN",
  "archivoLocal": "/uploads/imagen/2026/03/banner_1234.jpg",
  "estado": "PENDIENTE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "campañaId": "uuid...",
    "fecha": "2026-03-20",
    "titulo": "Video YouTube",
    "tipo": "VIDEO_LINK",
    "urlReferencia": "https://youtube.com/watch?v=...",
    "estado": "PENDIENTE",
    "createdAt": "2026-03-01T16:00:00.000Z"
  }
}
```

### GET /api/contents/[id]
Obtener contenido por ID.

**Permisos:** Autenticado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "campañaId": "uuid...",
    "fecha": "2026-03-15",
    "titulo": "Post Instagram",
    "tipo": "IMAGEN",
    "archivoLocal": "/uploads/imagen/2026/03/post.jpg",
    "estado": "APROBADO"
  }
}
```

### PUT /api/contents/[id]
Actualizar contenido.

**Permisos:** ADMIN o EDITOR

**Request Body:**
```json
{
  "titulo": "Título actualizado",
  "descripcion": "Nueva descripción",
  "estado": "APROBADO"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "titulo": "Título actualizado",
    "estado": "APROBADO",
    "updatedAt": "2026-03-01T17:00:00.000Z"
  }
}
```

### DELETE /api/contents/[id]
Eliminar contenido.

**Permisos:** ADMIN o EDITOR

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Contenido eliminado"
  }
}
```

### POST /api/contents/upload
Subir archivo multimedia (imagen, video, PDF).

**Permisos:** ADMIN o EDITOR

**Request:** `multipart/form-data`

**Query Parameters:**
- `type` (required) - Tipo de archivo: IMAGEN, VIDEO_FILE, PDF

**Form Fields:**
- `file` - Archivo a subir (max 50MB)

**Tipos de archivo permitidos:**
- **IMAGEN**: jpg, jpeg, png, gif, webp
- **VIDEO_FILE**: mp4, quicktime, avi
- **PDF**: pdf

**Example (cURL):**
```bash
curl -X POST "http://localhost:3000/api/contents/upload?type=IMAGEN" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

**Example (JavaScript):**
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('/api/contents/upload?type=IMAGEN', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
})

const result = await response.json()
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "filename": "imagen_1709308800_abc123.jpg",
    "originalName": "mi-imagen.jpg",
    "publicUrl": "/uploads/imagen/2026/03/imagen_1709308800_abc123.jpg",
    "size": 245680,
    "mimeType": "image/jpeg"
  }
}
```

**Uso del archivo subido:**
Una vez subido el archivo, usa el `publicUrl` en el campo `archivoLocal` al crear contenido:

```json
POST /api/contents
{
  "campañaId": "uuid...",
  "fecha": "2026-03-20",
  "titulo": "Banner Facebook",
  "tipo": "IMAGEN",
  "archivoLocal": "/uploads/imagen/2026/03/imagen_1709308800_abc123.jpg"
}
```

---

## 📋 Códigos de Respuesta

### Éxito
- **200 OK** - Solicitud exitosa
- **201 Created** - Recurso creado exitosamente

### Errores del Cliente
- **400 Bad Request** - Datos inválidos o validación fallida
- **401 Unauthorized** - No autenticado (token faltante o inválido)
- **403 Forbidden** - Sin permisos para realizar la acción
- **404 Not Found** - Recurso no encontrado
- **405 Method Not Allowed** - Método HTTP no permitido

### Errores del Servidor
- **500 Internal Server Error** - Error interno del servidor

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔐 Permisos por Rol

### ADMIN (Administrador)
- ✅ Acceso completo a todos los endpoints
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de clientes (CRUD)
- ✅ Gestión de campañas (CRUD)
- ✅ Gestión de contenidos (CRUD)
- ✅ Subida de archivos

### EDITOR (Editor de Contenidos)
- ❌ NO puede gestionar usuarios
- ✅ Gestión de clientes (CRUD)
- ✅ Gestión de campañas (CRUD)
- ✅ Gestión de contenidos (CRUD)
- ✅ Subida de archivos

### CLIENT (Cliente)
- ❌ NO puede gestionar usuarios
- ✅ Ver sus propios clientes
- ✅ Ver sus propias campañas
- ✅ Ver contenidos de sus campañas
- ❌ NO puede crear, editar o eliminar
- ❌ NO puede subir archivos

---

## 🧪 Testing

### Instalar dependencias
```bash
npm install
npm install formidable @types/formidable
```

### Configuración
Asegúrate de tener configurado `.env.local`:
```env
JWT_SECRET=tu-secret-super-seguro
REFRESH_TOKEN_SECRET=otro-secret-diferente
DATABASE_URL=mysql://user:pass@localhost:3306/marketing_saas
```

### Ejemplo de test completo (cURL)

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketing.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Listar usuarios
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreEmpresa": "Mi Empresa",
    "contacto": "contacto@miempresa.com",
    "usuarioId": "uuid-del-usuario"
  }'

# 4. Subir imagen
curl -X POST "http://localhost:3000/api/contents/upload?type=IMAGEN" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./imagen.jpg"

# 5. Crear contenido con la imagen
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campañaId": "uuid-campaña",
    "fecha": "2026-03-20",
    "titulo": "Post Instagram",
    "tipo": "IMAGEN",
    "archivoLocal": "/uploads/imagen/2026/03/imagen_xxx.jpg"
  }'
```

---

## 📚 Recursos Adicionales

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Documentación completa de autenticación
- [QUICKSTART.md](./QUICKSTART.md) - Guía de inicio rápido
- [examples/auth/](./examples/auth/) - Ejemplos de implementación

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que el JWT token esté presente y válido
2. Confirma que el usuario tiene los permisos necesarios
3. Revisa los logs del servidor para errores detallados
4. Consulta la documentación de autenticación

---

**Última actualización:** Marzo 2026
