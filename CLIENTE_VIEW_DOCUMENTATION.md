# Vista Cliente Ejecutiva - Documentación

## Descripción General

La **Vista Cliente Ejecutiva** (`/app/cliente`) es una interfaz minimalista y de presentación profesional diseñada exclusivamente para usuarios con rol CLIENT. Permite visualizar contenidos aprobados en un calendario mensual, con capacidad de reproducir videos, ver imágenes y descargar archivos, sin opciones de edición.

## Características Principales

### ✨ Diseño Ejecutivo
- **Interfaz limpia y minimalista**: Sin distracciones
- **Gradientes suaves**: Fondo degradado profesional
- **Tipografía clara**: Fuentes grandes y legibles
- **Sin opciones de edición**: Solo visualización
- **Responsive**: Se adapta a tablets y móviles

### 🎯 Funcionalidades

#### 1. Visualización de Calendario
- **Vista mensual**: Calendario FullCalendar sin opciones de edición
- **Color coding**: Cada tipo de contenido tiene su color distintivo
- **Emojis visuales**: Iconos intuitivos por tipo
- **Contador de contenidos**: Muestra cantidad de publicaciones del mes
- **Navegación simple**: Botones anteriores/siguiente y "Hoy"

#### 2. Filtrado Automático
- **Por cliente**: Solo muestra contenidos del cliente autenticado
- **Por estado**: Solo contenidos APROBADOS o PUBLICADOS
- **Por fecha**: Filtra automáticamente por mes/año seleccionado
- **Sin configuración manual**: Todo es automático

#### 3. Reproductor de Contenido
- **Imágenes**: Vista completa con opción de descarga
- **Videos YouTube/Vimeo**: Embed automático para reproducción
- **Videos locales**: Player HTML5 con controles
- **PDFs**: Botones para abrir en nueva pestaña o descargar
- **Enlaces externos**: Botón para abrir en navegador

#### 4. Sistema de Descarga
- **Imágenes**: Botón de descarga directa
- **Videos**: Botón de descarga directa
- **PDFs**: Botones separados para abrir y descargar
- **Sin restricciones**: El cliente puede descargar todo su contenido

### 🔒 Seguridad y Permisos

- **Solo rol CLIENT**: Usuarios ADMIN/EDITOR son redirigidos a `/dashboard`
- **Datos del cliente**: Obtiene automáticamente el cliente asociado al usuario
- **Campañas filtradas**: Solo ve campañas de su empresa
- **Contenidos filtrados**: Solo contenidos aprobados/publicados
- **Sin usuarios**: No se redirige a login si no hay sesión

## Estructura de la Vista

### Elementos de la Interfaz

```
┌─────────────────────────────────────────────┐
│  Header (Blanco)                            │
│  ┌──────────────────┬─────────────────────┐ │
│  │ Nombre Empresa   │  Cerrar Sesión      │ │
│  │ Vista Ejecutiva  │                     │ │
│  └──────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Navegación de Mes                          │
│  ┌───┬─────────────────┬───────┐            │
│  │ ← │ Marzo 2026      │ Hoy → │            │
│  │   │ 15 contenidos   │       │            │
│  └───┴─────────────────┴───────┘            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Calendario FullCalendar                    │
│  ┌─────────────────────────────────────┐   │
│  │  L   M   M   J   V   S   D          │   │
│  │  1   2   3   4   5   6   7          │   │
│  │ 🖼️  🎥  📄  🔗                        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Leyenda de Tipos                           │
│  🖼️ Imágenes  🔗 Enlaces  🎥 Videos  📄 PDFs │
└─────────────────────────────────────────────┘
```

### Modal de Visualización

```
┌─────────────────────────────────────────────┐
│  Título del Contenido          [Descargar] [X] │
│  Fecha: Lunes, 15 de marzo de 2026         │
├─────────────────────────────────────────────┤
│  Descripción (si existe)                    │
├─────────────────────────────────────────────┤
│                                             │
│  [CONTENIDO]                                │
│  - Imagen en HD                             │
│  - Video embebido                           │
│  - Player de video                          │
│  - Botones PDF                              │
│                                             │
└─────────────────────────────────────────────┘
```

## Colores por Tipo de Contenido

| Tipo | Color | Emoji | Hex |
|------|-------|-------|-----|
| IMAGEN | Verde | 🖼️ | #10B981 |
| VIDEO_LINK | Morado | 🔗 | #8B5CF6 |
| VIDEO_FILE | Azul | 🎥 | #3B82F6 |
| PDF | Rojo | 📄 | #EF4444 |

## Flujo de Usuario

### 1. Acceso Inicial
```
Usuario CLIENT → Login (/login)
                 ↓
          Autenticación exitosa
                 ↓
          Redirección a /cliente
                 ↓
          Fetch de datos del cliente
                 ↓
          Carga de campañas
                 ↓
          Carga de contenidos del mes actual
                 ↓
          Vista ejecutiva mostrada
```

### 2. Navegación de Calendario
```
Usuario en /cliente
    ↓
Click en "←" (mes anterior)
    ↓
currentMonth -= 1
    ↓
fetchContents() automático
    ↓
Calendario actualizado con contenidos del nuevo mes
```

### 3. Visualización de Contenido
```
Usuario ve evento en calendario
    ↓
Click en evento
    ↓
Modal abre con contenido
    ↓
Tipo de contenido determina visualización:
    ├─ IMAGEN → <img> con botón descargar
    ├─ VIDEO_LINK → <iframe> YouTube/Vimeo o link
    ├─ VIDEO_FILE → <video> con controles + descargar
    └─ PDF → Botones "Abrir" y "Descargar"
```

## API Endpoints Utilizados

### GET /api/clients
- **Uso**: Obtener el registro de cliente del usuario autenticado
- **Filtro**: `usuarioId === user.id`
- **Respuesta**: Información del cliente

### GET /api/campaigns
- **Uso**: Obtener campañas del cliente
- **Filtro**: `clienteId === client.id`
- **Respuesta**: Lista de campañas

### GET /api/contents
- **Uso**: Obtener contenidos de las campañas
- **Filtros aplicados**:
  - `campañaId in [clientCampaignIds]`
  - `fecha.month === currentMonth`
  - `fecha.year === currentYear`
  - `estado in ['APROBADO', 'PUBLICADO']`
- **Respuesta**: Contenidos filtrados

## Código Principal

### Componente Principal
**Archivo**: `app/cliente/page.tsx`

**Estados principales**:
```tsx
const [client, setClient] = useState<Client | null>(null)
const [contents, setContents] = useState<ContenidoCalendarizado[]>([])
const [campaigns, setCampaigns] = useState<Campaign[]>([])
const [selectedContent, setSelectedContent] = useState<ContenidoCalendarizado | null>(null)
const [isViewerOpen, setIsViewerOpen] = useState(false)
const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
```

**Funciones clave**:
```tsx
fetchClientData()    // Obtiene cliente y campañas
fetchContents()      // Filtra contenidos por mes/año/cliente
handleEventClick()   // Abre modal de visualización
handlePrevMonth()    // Navega al mes anterior
handleNextMonth()    // Navega al mes siguiente
handleToday()        // Vuelve al mes actual
```

### Componente Modal
**Componente**: `ContentViewerModal`

**Funciones**:
```tsx
renderContent()        // Renderiza contenido según tipo
getDownloadButton()    // Muestra botón descarga si aplica
extractYouTubeId()     // Extrae ID de URL YouTube
extractVimeoId()       // Extrae ID de URL Vimeo
```

## Personalización

### Cambiar Colores de Tipos
En `app/cliente/page.tsx`, línea ~10:
```tsx
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6',  // Cambiar morado
  VIDEO_FILE: '#3B82F6',  // Cambiar azul
  IMAGEN: '#10B981',      // Cambiar verde
  PDF: '#EF4444',         // Cambiar rojo
}
```

### Modificar Header
En `app/cliente/page.tsx`, línea ~210:
```tsx
<h1 className="text-3xl font-bold text-gray-900">
  {client.nombreEmpresa}  {/* Cambiar texto */}
</h1>
<p className="text-gray-600 mt-1">
  Vista Ejecutiva - Calendario de Contenidos
</p>
```

### Cambiar Fondo Degradado
En `app/cliente/page.tsx`, línea ~195:
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  {/* Cambiar colores: from-blue-50 to-purple-100, etc. */}
</div>
```

### Ocultar Leyenda de Tipos
Comentar líneas ~285-310 en `app/cliente/page.tsx`:
```tsx
{/* Legend */}
{/* <div className="mt-6 bg-white rounded-xl..."> ... </div> */}
```

## Instalación

### 1. Verificar Dependencias
Las dependencias de FullCalendar ya deberían estar instaladas:
```bash
npm list @fullcalendar/react
```

Si no están:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

### 2. Verificar Autenticación
Asegurar que `contexts/AuthContext.tsx` existe y está importado en `app/layout.tsx`.

### 3. Verificar Datos de Prueba
Debe haber:
- 1 usuario CLIENT en la base de datos
- 1 registro en tabla `clientes` vinculado a ese usuario
- Al menos 1 campaña para ese cliente
- Contenidos con estado APROBADO o PUBLICADO

## Testing

### Checklist de Pruebas

#### Acceso
- [ ] Usuario CLIENT puede acceder a `/cliente`
- [ ] Usuario ADMIN es redirigido a `/dashboard`
- [ ] Usuario EDITOR es redirigido a `/dashboard`
- [ ] Usuario sin sesión es redirigido a `/login`

#### Visualización
- [ ] Header muestra nombre de empresa del cliente
- [ ] Navegación de mes funciona (anterior/siguiente)
- [ ] Botón "Hoy" regresa al mes actual
- [ ] Contador de contenidos es correcto
- [ ] Solo muestra contenidos APROBADOS o PUBLICADOS

#### Calendario
- [ ] Eventos se muestran en fechas correctas
- [ ] Colores corresponden a tipos
- [ ] Emojis aparecen correctamente
- [ ] Click en evento abre modal
- [ ] No permite edición (readonly)

#### Modal de Visualización
- [ ] Título del contenido se muestra
- [ ] Fecha formateada en español
- [ ] Descripción aparece si existe
- [ ] **Imagen**: Se muestra en alta calidad
- [ ] **Imagen**: Botón descarga funciona
- [ ] **Video YouTube**: Embed funciona
- [ ] **Video Vimeo**: Embed funciona
- [ ] **Video Local**: Player funciona
- [ ] **Video Local**: Botón descarga funciona
- [ ] **PDF**: Botón "Abrir PDF" funciona
- [ ] **PDF**: Botón "Descargar" funciona
- [ ] Botón cerrar (X) funciona

#### Seguridad
- [ ] Solo ve contenidos de SUS campañas
- [ ] No ve contenidos de otros clientes
- [ ] No ve contenidos PENDIENTES o RECHAZADOS
- [ ] No puede editar nada

## Casos de Uso

### Caso 1: Cliente Revisa Contenido del Mes
**Escenario**: Cliente quiere ver qué contenidos hay programados para marzo 2026.

**Pasos**:
1. Login en `/login`
2. Automáticamente redirigido a `/cliente`
3. Ve calendario de marzo 2026
4. Observa 15 contenidos en diferentes fechas
5. Click en evento del día 15
6. Modal abre mostrando un video de YouTube
7. Reproduce el video en el modal
8. Cierra modal
9. Revisa otros contenidos

### Caso 2: Cliente Descarga Imagen
**Escenario**: Cliente necesita descargar una imagen publicada.

**Pasos**:
1. En `/cliente`, navega al mes correcto
2. Click en evento con emoji 🖼️
3. Modal muestra imagen en alta calidad
4. Click en botón "Descargar"
5. Imagen se descarga a su computadora
6. Cierra modal

### Caso 3: Cliente Abre PDF
**Escenario**: Cliente quiere revisar un documento PDF.

**Pasos**:
1. En calendario, click en evento con emoji 📄
2. Modal muestra icono de PDF y botones
3. Click en "Abrir PDF"
4. PDF se abre en nueva pestaña del navegador
5. Cliente revisa el documento
6. Regresa a `/cliente`

### Caso 4: Cliente Navega Entre Meses
**Escenario**: Cliente quiere comparar contenidos de febrero y marzo.

**Pasos**:
1. En `/cliente`, está en marzo 2026
2. Click en botón "←" (mes anterior)
3. Calendario cambia a febrero 2026
4. Ve contenidos de febrero
5. Click en botón "→" (mes siguiente)
6. Regresa a marzo 2026
7. Click en "Hoy" para ir al mes actual

## Resolución de Problemas

### Problema: "Acceso No Disponible"
**Causa**: No hay registro de cliente para el usuario.

**Solución**:
1. Verificar que existe registro en tabla `clientes`
2. Verificar que `usuarioId` coincide con el ID del usuario
3. Crear cliente si no existe:
   ```sql
   INSERT INTO clientes (id, nombreEmpresa, contacto, usuarioId, createdAt, updatedAt)
   VALUES ('uuid', 'Empresa ABC', 'Juan Pérez', 'userId', NOW(), NOW())
   ```

### Problema: Calendario Vacío
**Verificar**:
1. Hay campañas para el cliente
2. Las campañas tienen contenidos
3. Los contenidos tienen estado APROBADO o PUBLICADO
4. Los contenidos están en el mes/año seleccionado
5. Revisar Console del navegador para errores

**Debug**:
```javascript
// En Console del navegador
localStorage.getItem('accessToken')
// Verificar que el token es válido
```

### Problema: No Muestra Videos de YouTube
**Verificar**:
1. URL es válida de YouTube
2. URL contiene 'youtube.com' o 'youtu.be'
3. ID del video se extrae correctamente
4. No hay errores de CORS (YouTube debería permitir embeds)

**URLs válidas**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### Problema: Descarga No Funciona
**Verificar**:
1. `archivoLocal` tiene valor válido
2. Archivo existe en `public/uploads/`
3. Permisos de lectura en directorio
4. Navegador no bloquea descargas

**Alternativa**:
El usuario puede hacer click derecho → "Guardar imagen como" en imágenes.

### Problema: Redirige a Dashboard
**Causa**: Usuario no tiene rol CLIENT.

**Verificar**:
```sql
SELECT id, email, rol FROM users WHERE email = 'cliente@empresa.com'
```

Debe tener `rol = 'CLIENT'`.

## Mejoras Futuras Sugeridas

1. **Búsqueda**: Campo para buscar contenidos por título
2. **Filtro por Tipo**: Mostrar solo imágenes, solo videos, etc.
3. **Vista Lista**: Opción de ver contenidos en lista además de calendario
4. **Favoritos**: Marcar contenidos como favoritos
5. **Compartir**: Botón para compartir enlace del contenido
6. **Comentarios**: Sistema de feedback del cliente
7. **Estadísticas**: Gráficos de contenidos por tipo/mes
8. **Exportar**: Descargar todos los archivos del mes en ZIP
9. **Notificaciones**: Alertas de nuevos contenidos aprobados
10. **Vista Anual**: Calendario de todo el año

## Ventajas de la Vista Ejecutiva

✅ **Simplicidad**: Sin opciones que confundan al cliente  
✅ **Profesionalismo**: Diseño limpio y ejecutivo  
✅ **Enfoque**: Solo lo importante - visualizar contenido  
✅ **Seguridad**: Solo ve contenidos aprobados de su empresa  
✅ **Autonomía**: Puede descargar y compartir sin ayuda  
✅ **Mobile-Friendly**: Funciona en tablets y móviles  
✅ **Performance**: Carga rápida, sin overhead  
✅ **Intuitivo**: No necesita capacitación para usar  

## Conclusión

La Vista Cliente Ejecutiva proporciona una experiencia premium y profesional para clientes, permitiéndoles visualizar, reproducir y descargar contenidos aprobados de forma simple y elegante, sin las complejidades del sistema de gestión completo.

Ideal para presentaciones ejecutivas, reuniones con clientes y acceso rápido a material de marketing aprobado.
