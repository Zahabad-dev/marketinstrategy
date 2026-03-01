# 📅 Calendario de Contenidos - Marketing Planner

Calendario visual interactivo para gestionar contenidos de campañas de marketing por fecha, con soporte para filtros, visualización de diferentes tipos de contenido y modal de detalles.

## 🎯 Características

### ✨ Funcionalidades Principales

- **📆 Vista de Calendario Mensual/Semanal**: Navegación fácil entre diferentes vistas
- **🎨 Codificación por Colores**: Cada tipo de contenido tiene su color distintivo
  - 🖼️ **Imágenes**: Verde (#10B981)
  - 📹 **Video Link**: Morado (#8B5CF6)
  - 🎬 **Video File**: Azul (#3B82F6)
  - 📄 **PDF**: Rojo (#EF4444)
- **🔍 Filtros Avanzados**: Por cliente y campaña
- **📱 Responsive**: Se adapta a dispositivos móviles y desktop
- **🖱️ Click para Detalles**: Modal con vista previa de contenido
- **📊 Estadísticas**: Resumen de contenidos por tipo

### 🎭 Modal de Detalles

Al hacer clic en un evento del calendario, se abre un modal con:

- **Título y tipo** de contenido con icono distintivo
- **Fecha** formateada en español
- **Estado** del contenido (Pendiente, En Revisión, Aprobado, Publicado, Rechazado)
- **Descripción** completa
- **Preview del contenido**:
  - **Imágenes**: Vista previa de la imagen
  - **Videos (YouTube/Vimeo)**: Reproductor embebido
  - **Videos (archivo)**: Reproductor HTML5
  - **PDFs**: Enlace para abrir en nueva pestaña
- **Metadata**: Fechas de creación y actualización

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará automáticamente:
- `@fullcalendar/core@^6.1.10`
- `@fullcalendar/daygrid@^6.1.10`
- `@fullcalendar/interaction@^6.1.10`
- `@fullcalendar/react@^6.1.10`

### 2. Configurar Base de Datos

Asegúrate de tener la estructura de base de datos con:
- Tabla `contenidos_calendarizados`
- Tabla `campaigns`
- Tabla `clients`

Ejecuta las migraciones si es necesario:
```bash
npm run db:init
npm run db:seed
```

### 3. Iniciar Servidor

```bash
npm run dev
```

Accede a: `http://localhost:3000/calendar`

## 📂 Estructura de Archivos

```
app/
└── calendar/
    └── page.tsx          # Componente principal del calendario

components/
└── ContentDetailModal.tsx # Modal de detalles de contenido

app/
└── globals.css           # Estilos globales + FullCalendar custom styles
```

## 🎨 Personalización

### Cambiar Colores por Tipo de Contenido

En [app/calendar/page.tsx](../app/calendar/page.tsx#L12-L17):

```typescript
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6', // Morado
  VIDEO_FILE: '#3B82F6', // Azul
  IMAGEN: '#10B981',     // Verde
  PDF: '#EF4444',        // Rojo
}
```

### Modificar Estilos del Calendario

En [app/globals.css](../app/globals.css), sección "FullCalendar Custom Styles":

```css
/* Cambiar color del día actual */
.fc .fc-daygrid-day.fc-day-today {
  background-color: #eff6ff; /* Azul claro */
}

/* Personalizar eventos */
.fc .fc-event {
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  /* ... más estilos */
}
```

## 🔌 API Endpoints Utilizados

### GET /api/clients
Obtiene la lista de clientes para el filtro.

**Query Parameters:**
- `perPage=100` - Límite de resultados

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid...",
        "nombreEmpresa": "Empresa XYZ"
      }
    ]
  }
}
```

### GET /api/campaigns
Obtiene la lista de campañas para el filtro.

**Query Parameters:**
- `perPage=100` - Límite de resultados

**Response:**
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
        "objetivoGeneral": "Campaña marzo"
      }
    ]
  }
}
```

### GET /api/contents
Obtiene los contenidos calendarizados.

**Query Parameters:**
- `perPage=1000` - Límite de resultados
- `campañaId` (opcional) - Filtrar por campaña específica

**Response:**
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
        "descripcion": "Contenido promocional",
        "tipo": "IMAGEN",
        "urlReferencia": null,
        "archivoLocal": "/uploads/imagen/2026/03/post.jpg",
        "estado": "APROBADO",
        "createdAt": "2026-03-01T00:00:00.000Z",
        "updatedAt": "2026-03-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🧪 Testing

### 1. Probar Visualización Básica

```bash
# Login y guardar token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketing.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Listar contenidos
curl http://localhost:3000/api/contents?perPage=10 \
  -H "Authorization: Bearer $TOKEN"
```

Luego accede a `/calendar` en tu navegador y verifica que los contenidos aparezcan en el calendario.

### 2. Probar Filtros

1. Accede a `/calendar`
2. Haz clic en "Filtros"
3. Selecciona un cliente
4. Selecciona una campaña (se filtran automáticamente por cliente)
5. Verifica que solo se muestren contenidos de esa campaña

### 3. Probar Modal de Detalles

1. Haz clic en cualquier evento del calendario
2. Verifica que se abra el modal con:
   - Título correcto
   - Fecha formateada
   - Estado con color correspondiente
   - Preview según el tipo:
     - **IMAGEN**: Debe mostrar la imagen
     - **VIDEO_LINK**: Debe mostrar reproductor de YouTube/Vimeo o link
     - **VIDEO_FILE**: Debe mostrar reproductor HTML5
     - **PDF**: Debe mostrar enlace para abrir

### 4. Probar Navegación

- **Vista Mes/Semana**: Alterna entre vistas usando botones del header
- **Navegación por meses**: Usa botones "Anterior/Siguiente"
- **Hoy**: Botón "Hoy" para volver a la fecha actual
- **Responsive**: Prueba en diferentes tamaños de pantalla

## 📱 Uso en Producción

### Estados de Contenido

El calendario muestra todos los estados de contenido:

- 🟡 **PENDIENTE**: Contenido creado, esperando revisión
- 🟠 **EN_REVISION**: En proceso de aprobación
- 🟢 **APROBADO**: Aprobado, listo para publicar
- 🔵 **PUBLICADO**: Ya fue publicado
- 🔴 **RECHAZADO**: Rechazado, necesita cambios

### Workflow Típico

1. **Ver calendario del mes**: Identifica fechas programadas
2. **Filtrar por cliente**: Enfócate en un cliente específico
3. **Filtrar por campaña**: Ve solo contenidos de una campaña
4. **Hacer clic en evento**: Ver detalles completos y preview
5. **Revisar estadísticas**: Panel de resumen al final

## 🔧 Troubleshooting

### Error: "Cannot find module '@fullcalendar/react'"

**Solución:**
```bash
npm install
```

### El calendario no muestra eventos

**Posibles causas:**
1. No hay contenidos en la base de datos
2. Los contenidos no tienen fecha válida
3. Token JWT expirado o inválido

**Verificar:**
```bash
# Verificar que hay contenidos
curl http://localhost:3000/api/contents \
  -H "Authorization: Bearer $TOKEN"

# Verificar formato de fecha
# Debe ser: "2026-03-15" (YYYY-MM-DD)
```

### Los videos de YouTube no se reproducen

**Solución:**
Asegúrate de que la URL del video esté en uno de estos formatos:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### Modal no muestra preview de imágenes

**Verificar:**
1. El campo `archivoLocal` tiene la ruta correcta
2. La imagen existe en `public/uploads/`
3. La ruta es accesible: `/uploads/imagen/2026/03/imagen.jpg`

### Filtros no funcionan

**Solución:**
1. Verifica que haya datos en clientes y campañas
2. Revisa la consola del navegador para errores
3. Asegúrate de que las relaciones `clienteId` y `campañaId` son correctas

## 🎓 Recursos Adicionales

- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Guide](./AUTHENTICATION.md)

## 🐛 Reportar Problemas

Si encuentras algún bug:

1. Revisa la consola del navegador
2. Verifica los logs del servidor
3. Confirma que todos los endpoints API funcionan correctamente
4. Asegúrate de tener los permisos necesarios

---

**Última actualización:** Marzo 2026
