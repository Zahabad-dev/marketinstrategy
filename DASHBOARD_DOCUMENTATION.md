# Dashboard Principal - Guía Completa

## Descripción General

El dashboard principal es el corazón del sistema de gestión de campañas de marketing. Proporciona una interfaz completa con navegación lateral, selección de clientes y fechas, y un calendario editable basado en FullCalendar.

## Características Principales

### 1. Navegación con Sidebar
- **Navegación colapsable**: Sidebar que se puede expandir/contraer
- **Rutas disponibles**:
  - Dashboard (`/dashboard`)
  - Calendario (`/calendar`)
  - Clientes (`/clients`)
  - Campañas (`/campaigns`)
  - Usuarios (`/app/users`) - Solo ADMIN
- **Indicador de rol**: Badge que muestra el rol del usuario (ADMIN/EDITOR/CLIENT)
- **Logout**: Botón para cerrar sesión

### 2. Autenticación Contextual
- **AuthProvider**: Context de React que maneja el estado de autenticación
- **Hooks disponibles**:
  - `useAuth()`: Accede al contexto de autenticación
  - `isAdmin()`: Verifica si el usuario es ADMIN
  - `isEditor()`: Verifica si el usuario es EDITOR
  - `isClient()`: Verifica si el usuario es CLIENT
- **Auto-login**: Verifica token automáticamente al cargar
- **Token refresh**: Manejo de tokens JWT

### 3. Selectores de Filtrado

#### Cliente
- Lista desplegable con todos los clientes
- Filtra campañas y contenidos por cliente seleccionado
- Efecto cascade: al seleccionar cliente, filtra las campañas disponibles

#### Campaña
- Lista desplegable con campañas del mes/año seleccionado
- Si hay cliente seleccionado, muestra solo sus campañas
- Muestra formato: `Nombre Cliente - Objetivo (Mes/Año)`

#### Mes y Año
- Selectores independientes para mes y año
- Rango de años: 2 años atrás hasta 2 años adelante
- Nombres de meses en español
- Actualiza el calendario automáticamente

### 4. Calendario Editable

#### Visualización
- Vista mensual con FullCalendar
- Eventos color-coded por tipo:
  - 🖼️ **Verde** (#10B981): Imágenes
  - 🔗 **Morado** (#8B5CF6): Enlaces de video
  - 🎥 **Azul** (#3B82F6): Archivos de video
  - 📄 **Rojo** (#EF4444): PDFs
- Máximo 3 eventos por día con "+X más" expandible
- Emoji indicators por tipo de contenido

#### Interacción
- **Click en evento**: Abre modal de detalle con opción de editar
- **Selección de fecha** (EDITOR/ADMIN): Click en fecha vacía para agregar contenido
- **Navegación**: Botones anterior/siguiente y "Hoy"
- **Locale español**: Interfaz completamente en español

### 5. Permisos por Rol

#### ADMIN
- ✅ Crear clientes (botón "Nuevo Cliente")
- ✅ Crear campañas mensuales (botón "Nueva Campaña")
- ✅ Agregar contenidos al calendario
- ✅ Editar títulos y descripciones de contenidos
- ✅ Cambiar estado de contenidos
- ✅ **Aprobar contenidos** (botón rápido en modal)
- ✅ **Rechazar contenidos**
- ✅ Ver todos los clientes y campañas

#### EDITOR
- ✅ Seleccionar cliente
- ✅ Seleccionar campaña
- ✅ Agregar contenidos al calendario
- ✅ Subir videos o agregar links de referencia
- ✅ Editar títulos y descripciones de contenidos
- ❌ NO puede crear clientes
- ❌ NO puede crear campañas
- ❌ NO puede aprobar/rechazar contenidos
- ❌ NO puede cambiar el estado de contenidos

#### CLIENT
- ✅ Ver calendario de sus contenidos
- ❌ NO puede editar contenidos
- ❌ NO puede agregar contenidos
- ❌ NO puede crear clientes o campañas

## Componentes Creados

### 1. AuthContext (`contexts/AuthContext.tsx`)
```tsx
// Uso del contexto
const { user, isAdmin, isEditor, logout } = useAuth()

// Verificar rol
if (isAdmin()) {
  // Mostrar botones de admin
}
```

**Funciones disponibles**:
- `login(email, password)`: Inicia sesión
- `logout()`: Cierra sesión y redirige a /login
- `refreshUser()`: Actualiza datos del usuario
- `isAdmin()`, `isEditor()`, `isClient()`: Helpers de rol

### 2. Sidebar (`components/Sidebar.tsx`)
- Navegación lateral colapsable
- Filtra rutas por rol de usuario
- Badge de rol con colores distintivos
- Botón de logout
- Iconos de Lucide React

### 3. AddClientModal (`components/AddClientModal.tsx`)
**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSuccess`: () => void

**Funcionalidad**:
- Crea usuario CLIENT en `/api/users`
- Crea registro de cliente en `/api/clients`
- Validación de email único
- Password mínimo 6 caracteres

### 4. AddCampaignModal (`components/AddCampaignModal.tsx`)
**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSuccess`: () => void
- `preselectedClient?`: string
- `preselectedMonth?`: number
- `preselectedYear?`: number

**Funcionalidad**:
- Selector de cliente
- Selector de mes/año
- Campo de objetivo general
- Estado inicial (PLANIFICADA por defecto)
- Pre-selección automática de filtros actuales

### 5. AddContentModal (`components/AddContentModal.tsx`)
**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSuccess`: () => void
- `selectedDate?`: Date | null
- `preselectedCampaign?`: string
- `preselectedClient?`: string

**Funcionalidad**:
- Selector de cliente (para filtrar campañas)
- Selector de campaña
- Selector de fecha
- Título y descripción
- **Selector visual de tipo** (botones con iconos):
  - Imagen
  - Video Link
  - Video File
  - PDF
- **Upload de archivos** para IMAGEN, VIDEO_FILE, PDF
- **Campo URL** para VIDEO_LINK
- Usa `/api/contents/upload` para subir archivos
- Validación de tipo MIME
- Muestra tamaño del archivo seleccionado

### 6. EditContentModal (`components/EditContentModal.tsx`)
**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSuccess`: () => void
- `content`: ContenidoCalendarizado | null

**Funcionalidad**:
- Editar título y descripción (EDITOR/ADMIN)
- Cambiar estado (solo ADMIN)
- **Botones rápidos de aprobación** (solo ADMIN):
  - ✓ Aprobar (cambia a APROBADO)
  - ✗ Rechazar (cambia a RECHAZADO)
- Muestra tipo y estado actual
- Deshabilita campos según rol

### 7. ContentDetailModal (Actualizado)
**Nuevas Props**:
- `canEdit?`: boolean
- `onEdit?`: () => void

**Funcionalidad agregada**:
- Botón "Editar" si `canEdit={true}`
- Al hacer click en "Editar", ejecuta `onEdit()` que abre EditContentModal

### 8. Dashboard Page (`app/dashboard/page.tsx`)
Página principal con:
- Header con título y botones de acción (ADMIN)
- Barra de filtros (Cliente, Campaña, Mes, Año, Limpiar)
- Calendario FullCalendar
- Integración de todos los modales
- Gestión de estado complejo
- Fetch automático al cambiar filtros

## Flujo de Trabajo

### Flujo ADMIN

1. **Login** → Dashboard se carga automáticamente
2. **Crear Cliente**:
   - Click en "Nuevo Cliente"
   - Llenar formulario (Empresa, Contacto, Email, Password)
   - Usuario CLIENT se crea automáticamente
3. **Crear Campaña**:
   - Seleccionar mes/año y cliente en filtros (opcional)
   - Click en "Nueva Campaña"
   - Seleccionar cliente
   - Definir mes/año y objetivo
   - Campaña creada
4. **Agregar Contenido**:
   - Seleccionar campaña en filtros
   - Click en fecha del calendario
   - Llenar formulario de contenido
   - Subir archivo o agregar URL
   - Contenido agregado con estado PENDIENTE
5. **Aprobar Contenido**:
   - Click en evento del calendario
   - Click en "Editar"
   - Click en "✓ Aprobar" (botón rápido)
   - Estado cambia a APROBADO

### Flujo EDITOR

1. **Login** → Dashboard se carga
2. **Seleccionar Cliente y Campaña**:
   - Usar selectores de filtro
3. **Agregar Contenido**:
   - Click en fecha del calendario
   - Llenar formulario
   - Subir archivo o URL
   - Enviar (estado PENDIENTE)
4. **Editar Contenido**:
   - Click en evento
   - Click en "Editar"
   - Modificar título/descripción
   - Guardar
5. **Esperar Aprobación**:
   - ADMIN debe aprobar el contenido

## Estructura de Archivos

```
marketinstrategy/
├── app/
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard principal
│   └── layout.tsx              # Layout con AuthProvider
├── components/
│   ├── Sidebar.tsx             # Navegación lateral
│   ├── AddClientModal.tsx      # Modal crear cliente
│   ├── AddCampaignModal.tsx    # Modal crear campaña
│   ├── AddContentModal.tsx     # Modal agregar contenido
│   ├── EditContentModal.tsx    # Modal editar/aprobar contenido
│   └── ContentDetailModal.tsx  # Modal detalle contenido
├── contexts/
│   └── AuthContext.tsx         # Context de autenticación
└── pages/
    └── api/
        └── auth/
            └── me.ts           # GET usuario actual
```

## API Endpoints Usados

### Autenticación
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `POST /api/users` - Crear usuario (ADMIN)

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente (ADMIN)

### Campañas
- `GET /api/campaigns` - Listar campañas
- `POST /api/campaigns` - Crear campaña (ADMIN)

### Contenidos
- `GET /api/contents` - Listar contenidos (con filtros)
- `POST /api/contents` - Crear contenido (EDITOR/ADMIN)
- `PUT /api/contents/:id` - Actualizar contenido (EDITOR/ADMIN)
- `POST /api/contents/upload` - Subir archivo (EDITOR/ADMIN)

## Instalación y Uso

### 1. Verificar Dependencias
```bash
npm list @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

Si no están instaladas (deberían estar desde el calendario):
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### 2. Variables de Entorno
Asegurar que `.env.local` tenga:
```env
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=tu_secreto_refresh
REFRESH_TOKEN_EXPIRES_IN=30d
DATABASE_URL=file:./prisma/dev.db
```

### 3. Iniciar Servidor
```bash
npm run dev
```

### 4. Acceder al Dashboard
1. Navegar a: http://localhost:3000/login
2. Iniciar sesión con:
   - **ADMIN**: admin@marketing.com / admin123
   - **EDITOR**: editor@marketing.com / editor123
3. Dashboard se carga automáticamente

## Personalización

### Cambiar Colores de Tipos de Contenido
En `app/dashboard/page.tsx`:
```tsx
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6',  // Morado
  VIDEO_FILE: '#3B82F6',  // Azul
  IMAGEN: '#10B981',      // Verde
  PDF: '#EF4444',         // Rojo
}
```

### Modificar Rutas del Sidebar
En `components/Sidebar.tsx`:
```tsx
const navItems: NavItem[] = [
  { name: 'Mi Ruta', href: '/mi-ruta', icon: MiIcono },
  { name: 'Admin Only', href: '/admin', icon: Shield, adminOnly: true },
  // ...
]
```

### Cambiar Logo del Sidebar
En `components/Sidebar.tsx`, línea ~60:
```tsx
<h1 className="text-xl font-bold">Tu Logo</h1>
```

## Resolución de Problemas

### Error: Cannot find module '@fullcalendar/react'
**Solución**: Instalar dependencias de FullCalendar
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### Error: "Token no proporcionado" al cargar dashboard
**Solución**: 
1. Borrar localStorage: `localStorage.clear()`
2. Volver a login
3. Verificar que `/api/auth/login` devuelve `accessToken` y `refreshToken`

### Calendario no muestra eventos
**Verificar**:
1. Hay contenidos en la base de datos para el mes/año seleccionado
2. Los contenidos tienen `campañaId` válido
3. La campaña pertenece al cliente seleccionado (si hay filtro)
4. Revisar Console para errores de fetch

### Botón "Nuevo Cliente" no aparece
**Verificar**:
1. Usuario tiene rol ADMIN
2. `isAdmin()` retorna `true`
3. Token es válido y contiene `rol: 'ADMIN'`

### Upload de archivos falla
**Verificar**:
1. Endpoint `/api/contents/upload` existe
2. Formidable está instalado: `npm list formidable`
3. Directorio `public/uploads/` tiene permisos de escritura
4. Archivo no supera 50MB

### Modal de edición no permite cambiar estado
**Esto es correcto**: Solo ADMIN puede cambiar el estado. EDITOR solo puede editar título/descripción.

## Mejoras Futuras Sugeridas

1. **Drag & Drop**: Mover eventos entre fechas
2. **Vista Semanal**: Agregar vista de semana en FullCalendar
3. **Notificaciones**: Sistema de notificaciones en tiempo real
4. **Comentarios**: Permitir comentarios en contenidos
5. **Historial**: Registro de cambios de estado
6. **Estadísticas**: Panel de analytics en dashboard
7. **Exportar**: Exportar calendario a PDF o Excel
8. **Templates**: Plantillas de contenido reutilizables
9. **Preview**: Vista previa antes de aprobar
10. **Bulk Actions**: Aprobar/rechazar múltiples contenidos

## Testing

### Checklist de Funcionalidad

#### Autenticación
- [ ] Login funciona con credenciales válidas
- [ ] Logout cierra sesión y redirige a /login
- [ ] Token se guarda en localStorage
- [ ] Context carga usuario correctamente
- [ ] Roles se detectan correctamente (isAdmin, isEditor)

#### Sidebar
- [ ] Sidebar colapsa/expande correctamente
- [ ] Badge de rol muestra color correcto
- [ ] Rutas filtran según rol (Usuarios solo para ADMIN)
- [ ] Navegación funciona (click en links)
- [ ] Logout button funciona

#### Filtros
- [ ] Selector de cliente carga todos los clientes
- [ ] Selector de campaña se filtra por cliente
- [ ] Selector de mes/año funciona
- [ ] Botón "Limpiar" resetea todos los filtros
- [ ] Calendario actualiza al cambiar filtros

#### Calendario
- [ ] Eventos se muestran en fechas correctas
- [ ] Colores corresponden a tipos de contenido
- [ ] Emojis aparecen en eventos
- [ ] Click en evento abre modal de detalle
- [ ] Click en fecha vacía abre modal de agregar (EDITOR/ADMIN)
- [ ] Navegación mes anterior/siguiente funciona
- [ ] Botón "Hoy" funciona

#### Modal Crear Cliente (ADMIN)
- [ ] Modal abre al click en "Nuevo Cliente"
- [ ] Campos validan correctamente
- [ ] Email duplicado muestra error
- [ ] Usuario CLIENT se crea
- [ ] Cliente se crea vinculado al usuario
- [ ] Lista de clientes se actualiza

#### Modal Crear Campaña (ADMIN)
- [ ] Modal abre al click en "Nueva Campaña"
- [ ] Selector de cliente funciona
- [ ] Mes/año se pre-seleccionan si hay filtros
- [ ] Campaña se crea correctamente
- [ ] Lista de campañas se actualiza

#### Modal Agregar Contenido (EDITOR/ADMIN)
- [ ] Modal abre al click en fecha
- [ ] Selector de cliente filtra campañas
- [ ] Fecha se pre-selecciona
- [ ] Selector de tipo funciona (4 opciones)
- [ ] Upload de imagen funciona
- [ ] Upload de video funciona
- [ ] Upload de PDF funciona
- [ ] URL para VIDEO_LINK funciona
- [ ] Archivo sube y retorna publicUrl
- [ ] Contenido se crea con estado PENDIENTE
- [ ] Calendario se actualiza

#### Modal Editar Contenido (EDITOR/ADMIN)
- [ ] Modal abre desde detalle
- [ ] EDITOR puede editar título/descripción
- [ ] EDITOR NO puede cambiar estado
- [ ] ADMIN puede editar título/descripción
- [ ] ADMIN puede cambiar estado
- [ ] Botón "Aprobar" funciona (ADMIN)
- [ ] Botón "Rechazar" funciona (ADMIN)
- [ ] Cambios se guardan
- [ ] Calendario se actualiza

#### Modal Detalle Contenido
- [ ] Muestra información completa
- [ ] Preview de imagen funciona
- [ ] Preview de YouTube funciona
- [ ] Preview de Vimeo funciona
- [ ] Preview de video funciona
- [ ] Link a PDF funciona
- [ ] Botón "Editar" aparece si canEdit=true
- [ ] Botón "Cerrar" funciona

## Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Revisar `API_DOCUMENTATION.md` para endpoints
3. Revisar `CALENDAR_DOCUMENTATION.md` para FullCalendar
4. Verificar logs de consola del navegador
5. Verificar logs del servidor Next.js

## Conclusión

El dashboard proporciona una interfaz completa y robusta para la gestión de contenido de marketing con permisos granulares, calendario visual editable, y flujos de trabajo optimizados para cada rol de usuario.
