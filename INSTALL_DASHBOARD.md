# Guía Rápida: Instalación del Dashboard

## Resumen Ejecutivo

Se ha implementado un **dashboard principal completo** con sidebar de navegación, autenticación contextual, selectores de cliente/mes/año, y calendario editable con permisos basados en roles (ADMIN/EDITOR).

## ✅ Componentes Creados

### Archivos Nuevos
1. **`contexts/AuthContext.tsx`** - Context de autenticación con hooks
2. **`components/Sidebar.tsx`** - Navegación lateral colapsable
3. **`components/AddClientModal.tsx`** - Formulario para crear clientes (ADMIN)
4. **`components/AddCampaignModal.tsx`** - Formulario para crear campañas (ADMIN)
5. **`components/AddContentModal.tsx`** - Formulario para agregar contenido con upload
6. **`components/EditContentModal.tsx`** - Formulario para editar/aprobar contenido
7. **`app/dashboard/page.tsx`** - Página principal del dashboard

### Archivos Modificados
1. **`app/layout.tsx`** - Agregado `<AuthProvider>` 
2. **`components/ContentDetailModal.tsx`** - Agregado botón "Editar"

## 🚀 Instalación

### Paso 1: Verificar Dependencias
Las dependencias de FullCalendar ya deberían estar instaladas. Verificar:

```bash
npm list @fullcalendar/react
```

Si **NO** están instaladas:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### Paso 2: Verificar Base de Datos
Asegurar que hay datos de prueba:

```bash
# Verificar que existe el usuario admin
npx prisma studio
```

Debería haber al menos:
- 1 usuario ADMIN (admin@marketing.com / admin123)
- 1 usuario EDITOR (editor@marketing.com / editor123)

### Paso 3: Iniciar Servidor
```bash
npm run dev
```

### Paso 4: Probar el Dashboard
1. Abrir: http://localhost:3000/login
2. Login con: **admin@marketing.com** / **admin123**
3. Deberías ver el dashboard con:
   - Sidebar a la izquierda
   - Header con botones "Nuevo Cliente" y "Nueva Campaña"
   - Filtros (Cliente, Campaña, Mes, Año)
   - Calendario mensual

## 🧪 Testing Rápido

### Test 1: Crear Cliente (ADMIN)
1. Click en botón **"Nuevo Cliente"**
2. Llenar formulario:
   - Empresa: "Cliente de Prueba"
   - Contacto: "Juan Pérez"
   - Email: "juan@prueba.com"
   - Password: "123456"
3. Click en **"Crear Cliente"**
4. ✅ Debe aparecer en selector de clientes

### Test 2: Crear Campaña (ADMIN)
1. Seleccionar mes/año en filtros (ej: Marzo 2026)
2. Click en botón **"Nueva Campaña"**
3. Llenar formulario:
   - Cliente: Seleccionar "Cliente de Prueba"
   - Mes: Marzo
   - Año: 2026
   - Objetivo: "Campaña de lanzamiento"
4. Click en **"Crear Campaña"**
5. ✅ Debe aparecer en selector de campañas

### Test 3: Agregar Contenido
1. Seleccionar la campaña recién creada
2. Click en una **fecha del calendario**
3. Llenar formulario:
   - Campaña: Ya seleccionada
   - Fecha: Ya seleccionada
   - Título: "Post de Instagram"
   - Descripción: "Anuncio de producto"
   - Tipo: **Imagen** (click en botón verde)
   - Archivo: Seleccionar una imagen JPG/PNG
4. Click en **"Crear Contenido"**
5. ✅ Debe aparecer en el calendario con color verde y emoji 🖼️

### Test 4: Editar y Aprobar Contenido (ADMIN)
1. Click en el **evento del calendario**
2. Se abre modal de detalle
3. Click en botón **"Editar"**
4. Modificar título a "Post de Instagram - FINAL"
5. Click en botón **"✓ Aprobar"** (botón verde)
6. ✅ Estado cambia a APROBADO

### Test 5: Probar como EDITOR
1. Logout (botón en sidebar)
2. Login con: **editor@marketing.com** / **editor123**
3. Verificar que:
   - ✅ Puede ver el dashboard
   - ✅ Puede seleccionar cliente y campaña
   - ✅ Puede agregar contenido
   - ✅ Puede editar título/descripción
   - ❌ NO ve botones "Nuevo Cliente" ni "Nueva Campaña"
   - ❌ NO puede aprobar/rechazar contenido
   - ❌ NO puede cambiar estado de contenido

## 📋 Funcionalidades Principales

### Permisos por Rol

| Acción | ADMIN | EDITOR | CLIENT |
|--------|-------|--------|--------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Crear clientes | ✅ | ❌ | ❌ |
| Crear campañas | ✅ | ❌ | ❌ |
| Agregar contenido | ✅ | ✅ | ❌ |
| Editar título/descripción | ✅ | ✅ | ❌ |
| Cambiar estado | ✅ | ❌ | ❌ |
| Aprobar contenido | ✅ | ❌ | ❌ |
| Rechazar contenido | ✅ | ❌ | ❌ |

### Tipos de Contenido Soportados

1. **🖼️ Imagen** (Verde)
   - Upload de archivos: JPG, PNG, GIF, WebP
   - Preview directo en modal

2. **🔗 Video Link** (Morado)
   - URLs de YouTube, Vimeo
   - Embed automático en modal
   - Fallback a link externo

3. **🎥 Video File** (Azul)
   - Upload de archivos: MP4, WebM, etc.
   - Player HTML5 en modal

4. **📄 PDF** (Rojo)
   - Upload de archivos PDF
   - Link para abrir en nueva pestaña

## 🔧 Configuración

### Colores por Tipo de Contenido
Editar en `app/dashboard/page.tsx`:
```tsx
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6',  // Morado
  VIDEO_FILE: '#3B82F6',  // Azul
  IMAGEN: '#10B981',      // Verde
  PDF: '#EF4444',         // Rojo
}
```

### Rutas del Sidebar
Editar en `components/Sidebar.tsx`:
```tsx
const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Clientes', href: '/clients', icon: Building2 },
  { name: 'Campañas', href: '/campaigns', icon: FolderKanban },
  { name: 'Usuarios', href: '/app/users', icon: Users, adminOnly: true },
]
```

### Logo del Sistema
Editar en `components/Sidebar.tsx`, línea ~60:
```tsx
<h1 className="text-xl font-bold">Tu Logo Aquí</h1>
```

## 🐛 Solución de Problemas

### Problema: "Cannot find module '@fullcalendar/react'"
**Solución**:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### Problema: Botones de ADMIN no aparecen
**Verificar**:
1. Usuario tiene rol ADMIN en la base de datos
2. Token JWT contiene `rol: 'ADMIN'`
3. Console del navegador no muestra errores

**Debug**:
```javascript
// En Console del navegador
localStorage.getItem('accessToken')
// Copiar el token y decodificarlo en jwt.io
```

### Problema: Upload de archivos falla
**Verificar**:
1. Directorio `public/uploads/` existe
2. Formidable instalado: `npm list formidable`
3. Archivo no supera 50MB

**Crear directorio manualmente**:
```bash
mkdir -p public/uploads/imagen
mkdir -p public/uploads/video
mkdir -p public/uploads/pdf
```

### Problema: Calendario no muestra eventos
**Verificar**:
1. Hay contenidos en la base de datos para el mes/año seleccionado
2. Los contenidos tienen `campañaId` válido
3. La campaña tiene `mes` y `año` correctos
4. Console del navegador muestra datos en Network tab

### Problema: Modal de edición no permite cambiar estado (EDITOR)
**Esto es correcto**: Solo ADMIN puede cambiar el estado de contenidos. EDITOR solo puede editar título y descripción.

## 📚 Documentación Completa

Para más detalles, consultar:
- **`DASHBOARD_DOCUMENTATION.md`** - Documentación completa del dashboard
- **`API_DOCUMENTATION.md`** - Endpoints REST utilizados
- **`CALENDAR_DOCUMENTATION.md`** - Detalles de FullCalendar
- **`AUTHENTICATION.md`** - Sistema de autenticación

## 🎯 Siguiente Pasos Recomendados

1. **Agregar datos de prueba**:
   - Crear 2-3 clientes
   - Crear 3-4 campañas para diferentes meses
   - Agregar 10-15 contenidos de diferentes tipos

2. **Personalizar diseño**:
   - Cambiar logo en Sidebar
   - Ajustar colores si es necesario
   - Agregar logo/favicon del proyecto

3. **Configurar producción**:
   - Configurar variables de entorno
   - Optimizar build de Next.js
   - Configurar CDN para archivos multimedia

4. **Testing completo**:
   - Probar todos los flujos con ADMIN
   - Probar todos los flujos con EDITOR
   - Verificar restricciones de permisos

## ✨ Características Destacadas

- ✅ **Autenticación contextual** con React Context API
- ✅ **Sidebar colapsable** con indicador de rol
- ✅ **Filtros en cascade** (cliente → campañas)
- ✅ **Calendario editable** con FullCalendar
- ✅ **Color coding** automático por tipo
- ✅ **Upload de archivos** con validación MIME
- ✅ **Preview inteligente** (YouTube/Vimeo embed automático)
- ✅ **Permisos granulares** por rol
- ✅ **Aprobación rápida** con botones de ADMIN
- ✅ **Interfaz en español** completa

## 🎉 Resultado Final

Has implementado un **sistema completo de gestión de campañas** con:
- Dashboard profesional con sidebar
- Gestión de clientes (ADMIN)
- Gestión de campañas mensuales (ADMIN)
- Calendario visual editable
- Sistema de permisos robusto
- Upload de multimedia
- Flujo de aprobación de contenidos

¡El sistema está listo para usar!
