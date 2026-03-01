# Guía Rápida: Vista Cliente Ejecutiva

## 🎯 Resumen Ejecutivo

Se ha implementado una **vista de presentación ejecutiva** en `/app/cliente` diseñada exclusivamente para usuarios CLIENT. Interfaz minimalista que permite visualizar calendario mensual, reproducir videos, ver imágenes y descargar archivos, sin opciones de edición.

## ✅ Archivos Creados/Modificados

### Nuevo
- **`app/cliente/page.tsx`** (550+ líneas) - Vista ejecutiva completa con:
  - Calendario mensual FullCalendar
  - Modal de visualización de contenido
  - Navegación de meses
  - Sistema de descarga de archivos
  - Auto-detección de videos YouTube/Vimeo
  - Filtrado automático por cliente

### Modificado
- **`app/globals.css`** - Agregada animación `fadeIn` para modales

## 🚀 Instalación

### Paso 1: Verificar Dependencias
```bash
npm list @fullcalendar/react
```

Si no están instaladas:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### Paso 2: Crear Usuario Cliente de Prueba

#### Opción A: Usar el Dashboard (Recomendado)
1. Login como ADMIN: `admin@marketing.com` / `admin123`
2. Ir a Dashboard
3. Click en "Nuevo Cliente"
4. Llenar formulario:
   - Empresa: "Cliente Demo"
   - Contacto: "María García"
   - Email: "cliente@demo.com"
   - Password: "cliente123"
5. Cliente creado automáticamente

#### Opción B: Insertar Directamente en DB
```sql
-- 1. Crear usuario CLIENT
INSERT INTO users (id, nombre, email, password, rol, createdAt, updatedAt)
VALUES (
  'client-user-id',
  'María García',
  'cliente@demo.com',
  '$2a$10$hashdepassword',  -- Hash de 'cliente123'
  'CLIENT',
  NOW(),
  NOW()
);

-- 2. Crear registro de cliente
INSERT INTO clientes (id, nombreEmpresa, contacto, usuarioId, createdAt, updatedAt)
VALUES (
  'client-id',
  'Cliente Demo',
  'María García',
  'client-user-id',
  NOW(),
  NOW()
);
```

### Paso 3: Crear Campaña para el Cliente

Como ADMIN:
1. Dashboard → "Nueva Campaña"
2. Cliente: "Cliente Demo"
3. Mes: Marzo
4. Año: 2026
5. Objetivo: "Campaña de prueba"
6. Crear

### Paso 4: Agregar Contenido APROBADO

Como ADMIN o EDITOR:
1. Seleccionar campaña del Cliente Demo
2. Click en fecha del calendario
3. Agregar contenido (imagen, video, o PDF)
4. **Importante**: Editar el contenido y **APROBARLO**
   - Solo contenidos APROBADOS o PUBLICADOS se muestran al cliente

### Paso 5: Probar Vista Cliente

1. Logout de cuenta ADMIN
2. Login con: **cliente@demo.com** / **cliente123**
3. Automáticamente redirige a `/cliente`
4. Debería ver:
   - Header con "Cliente Demo"
   - Navegación de mes (Marzo 2026)
   - Calendario con contenidos aprobados
   - Leyenda de colores

## 🧪 Testing Completo

### Test 1: Acceso y Redirección
```
✓ Usuario CLIENT accede a /cliente
✓ Usuario ADMIN es redirigido a /dashboard
✓ Usuario EDITOR es redirigido a /dashboard
✓ Usuario sin sesión es redirigido a /login
```

**Pasos**:
1. Login como `cliente@demo.com` / `cliente123`
2. Verificar que carga `/cliente`
3. Logout
4. Login como `admin@marketing.com` / `admin123`
5. Intentar ir a `/cliente`
6. Verificar redirección a `/dashboard`

### Test 2: Visualización de Imagen
```
✓ Click en evento con emoji 🖼️
✓ Modal abre con imagen en alta calidad
✓ Botón "Descargar" aparece
✓ Descarga funciona
```

**Pasos**:
1. En calendario, click en evento verde (imagen)
2. Modal abre mostrando la imagen
3. Verificar que se ve en alta calidad
4. Click en botón "Descargar"
5. Archivo se descarga

### Test 3: Reproducción de Video YouTube
```
✓ Click en evento con emoji 🔗
✓ Modal abre con video embebido
✓ Video se reproduce correctamente
✓ Controles de YouTube funcionan
```

**Pasos de preparación**:
1. Como ADMIN, agregar contenido tipo VIDEO_LINK
2. URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Aprobar el contenido

**Test**:
1. Como CLIENT, click en evento morado
2. Modal abre con iframe de YouTube
3. Click en play
4. Video reproduce

### Test 4: Video Local
```
✓ Click en evento con emoji 🎥
✓ Modal abre con player HTML5
✓ Controles de video funcionan
✓ Botón "Descargar" funciona
```

**Pasos**:
1. Click en evento azul (video file)
2. Modal muestra player de video
3. Click en play
4. Video reproduce con controles

### Test 5: Documento PDF
```
✓ Click en evento con emoji 📄
✓ Modal muestra iconos y botones
✓ Botón "Abrir PDF" abre en nueva pestaña
✓ Botón "Descargar" descarga archivo
```

**Pasos**:
1. Click en evento rojo (PDF)
2. Modal muestra icono 📄 grande
3. Click en "Abrir PDF"
4. Nueva pestaña abre con PDF
5. Click en "Descargar"
6. PDF se descarga

### Test 6: Navegación de Meses
```
✓ Botón "←" va al mes anterior
✓ Botón "→" va al mes siguiente
✓ Botón "Hoy" regresa al mes actual
✓ Contador de contenidos actualiza
```

**Pasos**:
1. Calendario en Marzo 2026
2. Click en "←"
3. Calendario cambia a Febrero 2026
4. Click en "→" dos veces
5. Debe estar en Abril 2026
6. Click en "Hoy"
7. Regresa a Marzo 2026

### Test 7: Filtrado por Cliente
```
✓ Solo ve contenidos de sus campañas
✓ No ve contenidos de otros clientes
✓ No ve contenidos PENDIENTES
✓ No ve contenidos RECHAZADOS
```

**Pasos de preparación**:
1. Crear segundo cliente "Cliente 2"
2. Crear campaña para Cliente 2
3. Agregar contenidos para Cliente 2 (aprobados)
4. Agregar contenido PENDIENTE para Cliente Demo
5. Agregar contenido RECHAZADO para Cliente Demo

**Test**:
1. Login como Cliente Demo
2. Verificar que NO ve contenidos de Cliente 2
3. Verificar que NO ve contenidos PENDIENTES
4. Verificar que NO ve contenidos RECHAZADOS
5. Solo ve contenidos APROBADOS/PUBLICADOS propios

## 📱 Características de la Vista

### Interfaz
- ✅ **Header limpio**: Nombre de empresa y botón logout
- ✅ **Navegación intuitiva**: Flechas y botón "Hoy"
- ✅ **Contador dinámico**: Muestra cantidad de contenidos
- ✅ **Calendario readonly**: Sin opciones de edición
- ✅ **Leyenda visual**: Colores y emojis explicados

### Modal de Visualización
- ✅ **Título grande**: Fácil de leer
- ✅ **Fecha formateada**: En español completo
- ✅ **Descripción**: Si existe, se muestra destacada
- ✅ **Preview inteligente**: Detecta YouTube/Vimeo automáticamente
- ✅ **Botones de acción**: Descargar/Abrir según tipo
- ✅ **Animación suave**: FadeIn al abrir

### Tipos de Contenido Soportados

| Tipo | Vista | Acciones |
|------|-------|----------|
| 🖼️ IMAGEN | `<img>` en alta calidad | Descargar |
| 🔗 VIDEO_LINK | `<iframe>` YouTube/Vimeo | Abrir en sitio |
| 🎥 VIDEO_FILE | `<video>` HTML5 player | Reproducir, Descargar |
| 📄 PDF | Icono con botones | Abrir, Descargar |

## 🎨 Personalización

### Cambiar Nombre/Logo en Header
Editar `app/cliente/page.tsx`, línea ~210:
```tsx
<h1 className="text-3xl font-bold text-gray-900">
  {client.nombreEmpresa}  {/* O texto fijo */}
</h1>
```

### Cambiar Colores del Gradiente
Editar `app/cliente/page.tsx`, línea ~195:
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  {/* Cambiar a: from-blue-50 to-indigo-100, etc. */}
</div>
```

### Ocultar Leyenda
Comentar líneas ~285-310:
```tsx
{/* Legend */}
{/* <div className="mt-6...">...</div> */}
```

### Ajustar Máximo de Eventos por Día
Editar `app/cliente/page.tsx`, línea ~265:
```tsx
dayMaxEvents={4}  // Cambiar a 3, 5, etc.
```

## 🔒 Seguridad Implementada

### Verificaciones de Acceso
```tsx
// 1. Verificar usuario autenticado
if (!user) router.push('/login')

// 2. Verificar rol CLIENT
if (!isClient()) router.push('/dashboard')

// 3. Verificar cliente existe
if (!client) mostrar error "Acceso No Disponible"
```

### Filtros de Datos
```tsx
// Solo campañas del cliente
campaigns.filter(c => c.clienteId === client.id)

// Solo contenidos de esas campañas
contents.filter(c => clientCampaignIds.includes(c.campañaId))

// Solo contenidos aprobados
contents.filter(c => c.estado === 'APROBADO' || c.estado === 'PUBLICADO')

// Solo del mes actual
contents.filter(c => contentDate.getMonth() + 1 === currentMonth)
```

## 🐛 Solución de Problemas

### Error: "Acceso No Disponible"
**Causa**: No existe registro en tabla `clientes` para este usuario.

**Solución**:
```sql
-- Verificar que existe
SELECT * FROM clientes WHERE usuarioId = 'USER_ID';

-- Si no existe, crear con el Dashboard (ADMIN)
-- O insertar manualmente (ver Paso 2)
```

### Calendario Vacío
**Verificar checklist**:
- [ ] Hay campañas para el cliente
- [ ] Hay contenidos en esas campañas
- [ ] Contenidos tienen estado APROBADO o PUBLICADO
- [ ] Contenidos están en el mes/año mostrado
- [ ] Console del navegador sin errores

### Videos No Se Reproducen
**YouTube/Vimeo**:
- Verificar URL es válida
- Verificar ID se extrae correctamente
- Abrir Console y buscar errores de iframe

**Videos Locales**:
- Verificar `archivoLocal` apunta a archivo válido
- Verificar archivo existe en `public/uploads/`
- Verificar formato es soportado (MP4, WebM)

### Descargas No Funcionan
**Verificar**:
- Navegador no bloquea descargas pop-up
- Archivo existe en servidor
- Permisos de lectura en directorio
- Atributo `download` en tag `<a>`

## 📊 Estadísticas de Uso

Para trackear uso del cliente:
```tsx
// Agregar en handleEventClick
console.log(`Cliente ${client.nombreEmpresa} vio contenido ${content.titulo}`)

// O enviar a analytics
gtag('event', 'content_view', {
  client_id: client.id,
  content_id: content.id,
  content_type: content.tipo
})
```

## 📚 Documentación Completa

Para información detallada:
- **[CLIENTE_VIEW_DOCUMENTATION.md](CLIENTE_VIEW_DOCUMENTATION.md)** - Documentación completa

## 🎉 Resultado Final

Has implementado una **vista ejecutiva profesional** con:
- ✅ Interfaz minimalista y elegante
- ✅ Calendario mensual limpio
- ✅ Reproductor multimedia completo
- ✅ Sistema de descarga de archivos
- ✅ Seguridad por filtrado de cliente
- ✅ Solo contenidos aprobados
- ✅ Diseño responsive
- ✅ Animaciones suaves

¡Listo para presentaciones ejecutivas con clientes! 🚀

## 📝 Checklist Final

Antes de mostrar al cliente real:
- [ ] Crear usuario CLIENT para el cliente
- [ ] Crear campañas con contenidos
- [ ] **Aprobar todos los contenidos** (importante!)
- [ ] Probar acceso con credenciales del cliente
- [ ] Verificar que solo ve sus contenidos
- [ ] Probar reproducción de todos los tipos
- [ ] Probar descargas
- [ ] Verificar en diferentes navegadores
- [ ] Probar en tablet/móvil
- [ ] Personalizar header con logo del cliente (opcional)

---

**🎯 Acceso Rápido**: http://localhost:3000/cliente  
**👤 Usuario Demo**: cliente@demo.com / cliente123
