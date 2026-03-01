# Sistema de Upload y Enlaces Externos - Documentación Técnica

## Descripción General

El sistema de upload permite subir archivos multimedia (imágenes, videos, PDFs) y gestionar enlaces externos a plataformas populares (YouTube, Vimeo, TikTok, Google Drive, etc.). Incluye:

- ✅ **Subida de archivos** hasta 100MB
- ✅ **Detección automática** de plataformas de video y storage
- ✅ **Preview embeddable** para YouTube, Vimeo, TikTok, Google Drive
- ✅ **Validación de MIME types** y extensiones
- ✅ **Organización automática** por tipo/año/mes
- ✅ **Sistema extensible** para storage externo (S3, Cloudinary, etc.)

---

## 🎯 Formatos Soportados

### 📸 Imágenes (IMAGEN)
- **Formatos:** JPG, JPEG, PNG, GIF, WebP, SVG, BMP
- **MIME Types:** 
  ```
  image/jpeg
  image/jpg
  image/png
  image/gif
  image/webp
  image/svg+xml
  image/bmp
  ```
- **Tamaño máximo:** 100MB
- **Preview:** Imagen renderizada directamente en el calendario y vistas
- **Descarga:** Botón de descarga disponible en vista cliente

### 🎥 Videos (VIDEO_FILE)
- **Formatos:** MP4, MPEG, MOV, AVI, WMV, WebM, OGG, 3GP, FLV
- **MIME Types:**
  ```
  video/mp4
  video/mpeg
  video/quicktime
  video/x-msvideo
  video/x-ms-wmv
  video/webm
  video/ogg
  video/3gpp
  video/x-flv
  ```
- **Tamaño máximo:** 100MB
- **Preview:** Reproductor HTML5 con controles
- **Descarga:** Botón de descarga disponible en vista cliente

### 📄 Documentos PDF (PDF)
- **Formatos:** PDF
- **MIME Types:** `application/pdf`
- **Tamaño máximo:** 100MB
- **Preview:** Enlace para abrir en nueva pestaña
- **Descarga:** Botón de descarga directo

### 🔗 Enlaces Externos (VIDEO_LINK)
Soporta enlaces a múltiples plataformas con auto-detección:

#### ✅ Plataformas Embeddables
1. **YouTube**
   - URLs soportadas:
     - `https://youtube.com/watch?v=VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`
     - `https://youtube.com/embed/VIDEO_ID`
     - `https://youtube.com/shorts/VIDEO_ID`
   - Preview: iframe embeddable
   - Thumbnail: generado automáticamente

2. **Vimeo**
   - URLs soportadas:
     - `https://vimeo.com/VIDEO_ID`
     - `https://vimeo.com/video/VIDEO_ID`
     - `https://player.vimeo.com/video/VIDEO_ID`
   - Preview: iframe embeddable

3. **TikTok**
   - URLs soportadas:
     - `https://tiktok.com/@user/video/VIDEO_ID`
     - `https://tiktok.com/v/VIDEO_ID`
     - `https://vm.tiktok.com/SHORT_ID`
   - Preview: iframe embeddable

4. **Google Drive**
   - URLs soportadas:
     - `https://drive.google.com/file/d/FILE_ID/view`
     - `https://drive.google.com/open?id=FILE_ID`
     - `https://docs.google.com/.../d/FILE_ID/...`
   - Preview: iframe con `/preview` endpoint

#### ⚠ Plataformas de Enlace Directo (sin embed)
- **Dropbox:** `dropbox.com`
- **OneDrive:** `1drv.ms`, `onedrive.live.com`
- **Instagram:** `instagram.com`
- **Facebook:** `facebook.com`, `fb.watch`
- **Twitter/X:** `twitter.com`, `x.com`
- **Enlaces genéricos:** Cualquier otra URL

---

## 📂 Estructura de Archivos

Los archivos se organizan automáticamente:

```
public/uploads/
├── IMAGEN/
│   ├── 2024/
│   │   ├── 01/
│   │   │   └── 1706123456789-abc123.jpg
│   │   ├── 02/
│   │   └── 03/
│   └── 2025/
├── VIDEO_FILE/
│   ├── 2024/
│   │   ├── 01/
│   │   │   └── 1706123456789-xyz789.mp4
│   │   └── 02/
│   └── 2025/
└── PDF/
    ├── 2024/
    │   ├── 01/
    │   │   └── 1706123456789-doc456.pdf
    │   └── 02/
    └── 2025/
```

### Nomenclatura de Archivos
Formato: `TIMESTAMP-RANDOM.extension`

Ejemplo: `1706123456789-a3b7c2d9.jpg`

---

## 🛠 Arquitectura del Sistema

### 1. Biblioteca de Utilidades (`lib/upload.ts`)

#### Configuración Principal
```typescript
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', ...],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', ...],
  ALLOWED_PDF_TYPES: ['application/pdf'],
  UPLOAD_DIR: path.join(process.cwd(), 'public', 'uploads'),
  
  // Configuración para storage externo (futuro)
  USE_EXTERNAL_STORAGE: false,
  EXTERNAL_STORAGE_PROVIDER: null, // 'S3' | 'CLOUDINARY' | 'AZURE'
  EXTERNAL_STORAGE_CONFIG: {},
}
```

#### Funciones Principales

**`getAllowedMimeTypes(type: UploadType): string[]`**
- Retorna array de MIME types permitidos para un tipo de contenido
- Ejemplo: `getAllowedMimeTypes('IMAGEN')` → `['image/jpeg', 'image/png', ...]`

**`parseMultipartForm(req, uploadType): Promise<FormFile>`**
- Parsea formularios multipart/form-data con formidable
- Valida MIME type y tamaño
- Retorna objeto con información del archivo

**`processUploadedFile(file, uploadType): Promise<UploadResult>`**
- Procesa archivo validado
- Genera nombre único
- Mueve a directorio final
- Retorna URL pública y metadata

**`generateUniqueFilename(originalName): string`**
- Genera nombre único: `timestamp-random.ext`
- Previene colisiones de nombres

**`getUploadSubdir(type): string`**
- Genera ruta relativa: `tipo/YYYY/MM/`
- Organiza archivos automáticamente

### 2. Detector de Enlaces (`lib/link-detector.ts`)

#### Tipos de Link
```typescript
type LinkType = 
  | 'YOUTUBE' 
  | 'VIMEO' 
  | 'TIKTOK' 
  | 'GOOGLE_DRIVE' 
  | 'DROPBOX'
  | 'ONEDRIVE'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'GENERIC'
```

#### Funciones de Detección

**`detectLinkType(url: string): LinkType`**
- Detecta plataforma a partir de la URL
- Retorna tipo de link identificado

**`getLinkMetadata(url: string): LinkMetadata`**
- Analiza URL completa
- Extrae IDs de video/archivo
- Genera URLs de embed si aplica
- Retorna objeto con metadata completa

**`extractYouTubeId(url: string): string | null`**
- Extrae ID de video de YouTube
- Soporta múltiples formatos de URL

**`extractVimeoId(url: string): string | null`**
- Extrae ID de video de Vimeo

**`extractTikTokId(url: string): string | null`**
- Extrae ID de video de TikTok

**`extractGoogleDriveId(url: string): string | null`**
- Extrae ID de archivo de Google Drive

**`getYouTubeThumbnail(videoId: string, quality?: string): string`**
- Genera URL de thumbnail de YouTube
- Calidades: 'default', 'hq', 'mq', 'sd', 'maxres'

**`isValidUrl(url: string): boolean`**
- Valida formato de URL

**`normalizeUrl(url: string): string`**
- Añade `https://` si falta protocolo

**`isVideoLink(url: string): boolean`**
- Verifica si es link de plataforma de video

**`isStorageLink(url: string): boolean`**
- Verifica si es link de servicio de almacenamiento

---

## 🔌 API Endpoints

### POST `/api/contents/upload`

Endpoint para subir archivos multimedia.

#### Autenticación
- **Requerida:** Sí
- **Roles permitidos:** ADMIN, EDITOR
- **Header:** `Authorization: Bearer {token}`

#### Request
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file` (File): Archivo a subir
  - `tipo` (string): Tipo de contenido ('IMAGEN', 'VIDEO_FILE', 'PDF')

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "filename": "1706123456789-abc123.jpg",
    "originalName": "foto.jpg",
    "publicUrl": "/uploads/IMAGEN/2024/01/1706123456789-abc123.jpg",
    "size": 245678,
    "mimeType": "image/jpeg"
  }
}
```

#### Response Error (400/413/500)
```json
{
  "success": false,
  "error": "Archivo demasiado grande. Máximo 100MB"
}
```

#### Validaciones
1. Usuario autenticado y con rol ADMIN o EDITOR
2. Tipo de contenido válido ('IMAGEN', 'VIDEO_FILE', 'PDF')
3. MIME type permitido para el tipo
4. Tamaño menor o igual a 100MB
5. Archivo presente en el request

---

## 🎨 Componentes de UI

### 1. AddContentModal

Modal para agregar contenidos con preview de links.

#### Características
- Selector visual de tipo de contenido (4 botones)
- **Auto-detección de plataforma** al ingresar URL
- **Preview de thumbnail** para videos de YouTube
- **Indicador visual** de plataforma detectada
- Validación en tiempo real
- Filtrado de campañas por cliente

#### Preview de Links
```tsx
{linkPreview && (
  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
    <div className="flex items-center gap-2 text-sm">
      {linkPreview.isEmbeddable ? (
        <span className="text-green-700 font-semibold">
          ✓ {linkPreview.platform} detectado - Video embeddable
        </span>
      ) : (
        <span className="text-amber-700 font-semibold">
          ⚠ {linkPreview.platform} - Enlace directo
        </span>
      )}
    </div>
    {linkPreview.thumbnail && (
      <img src={linkPreview.thumbnail} alt="Preview" className="mt-2 rounded shadow-sm w-full max-w-xs" />
    )}
  </div>
)}
```

### 2. ContentDetailModal

Modal de detalle con preview inteligente de contenidos.

#### Render de Preview
```typescript
const renderPreview = () => {
  switch (content.tipo) {
    case 'IMAGEN':
      return <img src={content.archivoLocal} alt={content.titulo} className="w-full max-h-96 object-contain" />
    
    case 'VIDEO_FILE':
      return <video src={content.archivoLocal} controls className="w-full max-h-96" />
    
    case 'PDF':
      return <a href={content.archivoLocal} target="_blank">Abrir PDF</a>
    
    case 'VIDEO_LINK':
      const linkData = getLinkMetadata(content.urlReferencia)
      
      if (linkData.isEmbeddable && linkData.embedUrl) {
        return (
          <iframe 
            src={linkData.embedUrl}
            className="w-full aspect-video"
            allowFullScreen 
          />
        )
      }
      
      return <a href={content.urlReferencia} target="_blank">Ver en {linkData.platform}</a>
  }
}
```

### 3. ContentViewerModal (Vista Cliente)

Modal de visualización para clientes con diseño ejecutivo.

#### Características
- Preview automático según tipo de contenido
- Botones de descarga para archivos
- Diseño minimalista y profesional
- Soporte completo para todas las plataformas

---

## 🔄 Flujo de Trabajo

### Subir Archivo (IMAGEN/VIDEO_FILE/PDF)

1. **Usuario selecciona tipo de contenido**
   - Click en botón de tipo (IMAGEN/VIDEO_FILE/PDF)
   
2. **Usuario llena formulario**
   - Cliente, Campaña, Fecha, Título, Descripción
   
3. **Usuario selecciona archivo**
   - Input file muestra nombre del archivo seleccionado
   
4. **Usuario envía formulario**
   - Click en "Crear Contenido"
   
5. **Sistema sube archivo**
   - POST a `/api/contents/upload`
   - Validación de MIME type y tamaño
   - Generación de nombre único
   - Movimiento a directorio final
   
6. **Sistema crea registro de contenido**
   - POST a `/api/contents` con `archivoLocal` URL
   - Estado inicial: PENDIENTE
   
7. **Actualización de UI**
   - Recarga calendario
   - Cierra modal
   - Muestra evento en calendario

### Agregar Enlace Externo (VIDEO_LINK)

1. **Usuario selecciona tipo VIDEO_LINK**
   
2. **Usuario ingresa URL**
   - Sistema detecta plataforma automáticamente
   - Muestra preview con indicador de plataforma
   - Si es YouTube, muestra thumbnail
   
3. **Validación visual**
   - ✓ Verde: Plataforma embeddable (YouTube, Vimeo, TikTok, Drive)
   - ⚠ Ámbar: Plataforma de enlace directo
   
4. **Usuario completa formulario**
   - Título, descripción, etc.
   
5. **Sistema crea registro**
   - POST a `/api/contents` con `urlReferencia`
   - No se sube archivo
   
6. **Render en calendario**
   - Evento con color púrpura (VIDEO_LINK)
   - Preview embeddable en modal de detalle

---

## 🎨 Código de Colores

Cada tipo de contenido tiene un color distintivo:

- **VIDEO_LINK:** `#8B5CF6` (Púrpura) 🔗
- **VIDEO_FILE:** `#3B82F6` (Azul) 🎥
- **IMAGEN:** `#10B981` (Verde) 🖼️
- **PDF:** `#EF4444` (Rojo) 📄

---

## 🔐 Permisos y Seguridad

### Permisos por Rol

#### ADMIN
- ✅ Subir archivos
- ✅ Agregar enlaces
- ✅ Ver todos los contenidos
- ✅ Editar todos los contenidos
- ✅ Aprobar/Rechazar contenidos
- ✅ Eliminar contenidos

#### EDITOR
- ✅ Subir archivos
- ✅ Agregar enlaces
- ✅ Ver contenidos de sus campañas asignadas
- ✅ Editar sus propios contenidos
- ❌ No puede aprobar/rechazar
- ❌ No puede eliminar

#### CLIENT
- ✅ Ver contenidos APROBADOS o PUBLICADOS de sus campañas
- ✅ Descargar archivos
- ❌ No puede subir
- ❌ No puede editar
- ❌ No puede aprobar/rechazar

### Validaciones de Seguridad

1. **Autenticación**
   - Token JWT en header `Authorization`
   - Verificación de expiración
   
2. **Autorización**
   - Endpoint `/api/contents/upload` requiere ADMIN o EDITOR
   - Validación de rol en middleware
   
3. **Validación de Archivos**
   - MIME type verificado en backend (no confiar en frontend)
   - Tamaño limitado a 100MB
   - Extensión validada
   
4. **Sanitización**
   - Nombres de archivo sanitizados
   - Prevención de path traversal
   - Generación de nombres únicos
   
5. **Almacenamiento**
   - Archivos fuera de src/app (en public/uploads)
   - Permisos de escritura limitados
   - No ejecución de archivos subidos

---

## 🚀 Configuración para Storage Externo

El sistema está diseñado para migrar fácilmente a servicios externos.

### Configuración de AWS S3 (Ejemplo)

```typescript
// lib/upload.ts
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  USE_EXTERNAL_STORAGE: true,
  EXTERNAL_STORAGE_PROVIDER: 'S3',
  EXTERNAL_STORAGE_CONFIG: {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
  },
}
```

### Configuración de Cloudinary (Ejemplo)

```typescript
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  USE_EXTERNAL_STORAGE: true,
  EXTERNAL_STORAGE_PROVIDER: 'CLOUDINARY',
  EXTERNAL_STORAGE_CONFIG: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: 'marketinstrategy',
  },
}
```

### Implementación de Adaptador

```typescript
// lib/storage-adapters/s3-adapter.ts
import AWS from 'aws-sdk'

export async function uploadToS3(file: File, config: any): Promise<string> {
  const s3 = new AWS.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  })

  const params = {
    Bucket: config.bucket,
    Key: `${Date.now()}-${file.name}`,
    Body: file.stream,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }

  const result = await s3.upload(params).promise()
  return result.Location
}
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Subir imagen JPG

**Frontend (AddContentModal):**
```tsx
const handleSubmit = async () => {
  // 1. Subir archivo
  const formData = new FormData()
  formData.append('file', file) // File object de input
  formData.append('tipo', 'IMAGEN')

  const uploadRes = await fetch('/api/contents/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const { data } = await uploadRes.json()
  const archivoLocal = data.publicUrl
  // /uploads/IMAGEN/2024/01/1706123456789-abc123.jpg

  // 2. Crear contenido
  await fetch('/api/contents', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      campañaId: 'uuid-campaña',
      fecha: '2024-01-15',
      titulo: 'Post Instagram',
      descripcion: 'Imagen promocional',
      tipo: 'IMAGEN',
      archivoLocal, // URL del archivo subido
      estado: 'PENDIENTE',
    }),
  })
}
```

### Ejemplo 2: Agregar video de YouTube

**Frontend:**
```tsx
const handleSubmit = async () => {
  // Detectar metadata del link
  const linkData = getLinkMetadata('https://youtube.com/watch?v=dQw4w9WgXcQ')
  
  // linkData = {
  //   type: 'YOUTUBE',
  //   platform: 'YouTube',
  //   videoId: 'dQw4w9WgXcQ',
  //   embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  //   thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  //   isEmbeddable: true,
  // }

  // Crear contenido (sin subir archivo)
  await fetch('/api/contents', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      campañaId: 'uuid-campaña',
      fecha: '2024-01-15',
      titulo: 'Video tutorial',
      descripcion: 'Tutorial de producto',
      tipo: 'VIDEO_LINK',
      urlReferencia: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      estado: 'PENDIENTE',
    }),
  })
}
```

### Ejemplo 3: Preview de TikTok

**Componente de Preview:**
```tsx
const renderPreview = () => {
  const linkData = getLinkMetadata(content.urlReferencia)
  // URL: https://tiktok.com/@user/video/1234567890

  // linkData = {
  //   type: 'TIKTOK',
  //   platform: 'TikTok',
  //   videoId: '1234567890',
  //   embedUrl: 'https://www.tiktok.com/embed/v2/1234567890',
  //   isEmbeddable: true,
  // }

  if (linkData.isEmbeddable && linkData.embedUrl) {
    return (
      <div className="aspect-video">
        <iframe 
          src={linkData.embedUrl}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    )
  }
}
```

---

## 🧪 Testing

### Test Manual: Subida de Archivo

1. Login como ADMIN o EDITOR
2. Ir a Dashboard
3. Click en fecha del calendario
4. Modal "Agregar Contenido" se abre
5. Seleccionar "IMAGEN"
6. Seleccionar archivo JPG desde tu computadora
7. Llenar formulario (campaña, título, descripción)
8. Click "Crear Contenido"
9. Verificar:
   - ✓ Archivo aparece en `/public/uploads/IMAGEN/YYYY/MM/`
   - ✓ Evento aparece en el calendario con color verde
   - ✓ Click en evento muestra preview de la imagen
   - ✓ Botón de descarga funciona en vista cliente

### Test Manual: Enlace de YouTube

1. Login como ADMIN o EDITOR
2. Ir a Dashboard
3. Click en fecha
4. Seleccionar "VIDEO LINK"
5. Ingresar URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
6. Verificar:
   - ✓ Preview muestra "✓ YouTube detectado - Video embeddable"
   - ✓ Aparece thumbnail del video
7. Llenar formulario
8. Click "Crear Contenido"
9. Verificar:
   - ✓ Evento aparece con color púrpura
   - ✓ Click en evento muestra iframe de YouTube embeddable
   - ✓ Video se puede reproducir en el modal

### Test Manual: Google Drive

1. Subir un archivo a Google Drive
2. Obtener link compartido: `https://drive.google.com/file/d/FILE_ID/view`
3. Agregar como VIDEO_LINK en dashboard
4. Verificar preview muestra iframe de Google Drive

---

## 🐛 Troubleshooting

### Error: "Archivo demasiado grande"
- **Causa:** Archivo excede 100MB
- **Solución:** 
  - Comprimir archivo
  - O aumentar `MAX_FILE_SIZE` en `lib/upload.ts`

### Error: "Tipo MIME no permitido"
- **Causa:** Archivo con extensión no soportada
- **Solución:**
  - Convertir archivo a formato soportado
  - O agregar MIME type a `ALLOWED_*_TYPES` en `lib/upload.ts`

### Error: "No se puede subir archivo"
- **Causa:** Permisos de escritura en `/public/uploads`
- **Solución:**
  ```bash
  chmod -R 755 public/uploads
  ```

### Preview de YouTube no funciona
- **Causa:** URL inválida o ID no extraído
- **Solución:**
  - Verificar formato de URL
  - Verificar regex en `extractYouTubeId()`
  - Intentar con URL formato `https://youtube.com/watch?v=ID`

### Enlaces de TikTok no embeddan
- **Causa:** Algunos videos de TikTok tienen restricciones de embed
- **Solución:**
  - Sistema automáticamente fallback a enlace directo
  - Usuario puede click para abrir en TikTok

---

## 📈 Métricas y Monitoreo

### Tamaño de Uploads

Consultar tamaño total de uploads:
```bash
du -sh public/uploads
```

### Archivos por Tipo
```bash
find public/uploads/IMAGEN -type f | wc -l
find public/uploads/VIDEO_FILE -type f | wc -l  
find public/uploads/PDF -type f | wc -l
```

### Logs de Uploads
Implementar logging en `processUploadedFile()`:
```typescript
console.log(`[UPLOAD] User ${userId} uploaded ${filename} (${size} bytes) to ${publicUrl}`)
```

---

## 🔮 Roadmap Futuro

### Funcionalidades Planeadas

- [ ] **Compresión automática** de imágenes con Sharp
- [ ] **Thumbnails** generados automáticamente para videos
- [ ] **Preview de PDFs** con PDF.js embeddable
- [ ] **Instagram embed** con oEmbed API
- [ ] **Drag & drop** para subir archivos
- [ ] **Progreso de upload** con barra de progreso
- [ ] **Multi-upload** (subir varios archivos a la vez)
- [ ] **Validación de URLs** con fetch para verificar accesibilidad
- [ ] **Cache de metadata** de links externos
- [ ] **CDN integration** para archivos estáticos
- [ ] **Watermark automático** en imágenes
- [ ] **Conversión de video** a formatos optimizados (MP4 H.264)

---

## 📚 Referencias

### Documentación Externa

- [Formidable](https://github.com/node-formidable/formidable) - Parser de multipart/form-data
- [FullCalendar](https://fullcalendar.io/) - Librería de calendario
- [YouTube Embed API](https://developers.google.com/youtube/iframe_api_reference)
- [Vimeo Embed](https://developer.vimeo.com/player/sdk/embed)
- [TikTok Embed](https://developers.tiktok.com/doc/embed-videos)
- [Google Drive Preview](https://support.google.com/drive/answer/2881970)

### Archivos del Proyecto

- `lib/upload.ts` - Utilidades de upload
- `lib/link-detector.ts` - Detector de plataformas
- `pages/api/contents/upload.ts` - API endpoint de upload
- `components/AddContentModal.tsx` - Modal de creación con preview
- `components/ContentDetailModal.tsx` - Modal de detalle con preview
- `app/cliente/page.tsx` - Vista ejecutiva del cliente

---

## 💡 Tips y Best Practices

### Para Desarrolladores

1. **Validar en el backend:** Nunca confiar solo en validación de frontend
2. **Sanitizar nombres:** Siempre generar nombres únicos y seguros
3. **Limitar tamaños:** Prevenir uploads masivos que llenen el disco
4. **Usar streams:** Para archivos grandes, usar streams en lugar de cargar todo en memoria
5. **Logs detallados:** Registrar todos los uploads para auditoría
6. **Backup regular:** Hacer copias de seguridad de `/public/uploads`

### Para Usuarios

1. **Optimizar imágenes:** Comprimir imágenes antes de subir para mejor rendimiento
2. **Usar MP4 para videos:** Formato con mejor compatibilidad
3. **Links públicos:** Asegurarse que enlaces de Drive/Dropbox sean públicos
4. **Títulos descriptivos:** Facilita búsqueda y organización
5. **YouTube vs archivo:** Preferir YouTube para videos largos para ahorrar espacio

---

## 🎓 Conclusión

El sistema de upload está diseñado para ser:

- ✅ **Intuitivo:** UI clara con feedback visual
- ✅ **Robusto:** Validaciones en múltiples capas
- ✅ **Extensible:** Fácil agregar nuevas plataformas o storage providers
- ✅ **Seguro:** Autenticación, autorización y sanitización
- ✅ **Eficiente:** Organización automática y nomenclatura consistente

Con soporte para múltiples formatos de archivo y plataformas de video/storage, cubre las necesidades de un calendario de contenidos multimedia profesional.

---

**Última actualización:** 2024
**Versión:** 2.0
**Autor:** Marketing Strategy Team
