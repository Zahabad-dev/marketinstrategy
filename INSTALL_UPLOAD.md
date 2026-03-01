# 🚀 Instalación de Dependencias para Endpoints API

## 📦 Instalar Nueva Dependencia

El sistema de upload de archivos requiere la librería `formidable`. Ya está configurada en `package.json`, solo necesitas instalar:

```bash
npm install
```

Esto instalará:
- `formidable@^3.5.1` - Parser de multipart/form-data para uploads
- `@types/formidable@^3.4.5` - Tipos TypeScript para formidable

## ✅ Verificar Instalación

Después de instalar, verifica que no haya errores de TypeScript:

```bash
npm run type-check
```

## 📂 Estructura de Archivos Subidos

Los archivos se guardan en:
```
public/
  uploads/
    imagen/
      2026/
        03/
          imagen_1234567890_abc123.jpg
    video_file/
      2026/
        03/
          video_1234567890_xyz789.mp4
    pdf/
      2026/
        03/
          documento_1234567890_def456.pdf
```

## 🧪 Probar Upload de Archivos

### 1. Iniciar servidor
```bash
npm run dev
```

### 2. Login y obtener token
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketing.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

echo $TOKEN
```

### 3. Subir una imagen
```bash
curl -X POST "http://localhost:3000/api/contents/upload?type=IMAGEN" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./test-image.jpg"
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "filename": "test-image_1709308800_abc123.jpg",
    "originalName": "test-image.jpg",
    "publicUrl": "/uploads/imagen/2026/03/test-image_1709308800_abc123.jpg",
    "size": 245680,
    "mimeType": "image/jpeg"
  }
}
```

### 4. Subir un PDF
```bash
curl -X POST "http://localhost:3000/api/contents/upload?type=PDF" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./documento.pdf"
```

### 5. Usar el archivo en un contenido
```bash
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campañaId": "uuid-de-campaña",
    "fecha": "2026-03-20",
    "titulo": "Banner Facebook",
    "descripcion": "Imagen promocional",
    "tipo": "IMAGEN",
    "archivoLocal": "/uploads/imagen/2026/03/test-image_1709308800_abc123.jpg",
    "estado": "PENDIENTE"
  }'
```

## 🔧 Configuración de Límites

En `lib/upload.ts` puedes ajustar:

```typescript
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB (ajustable)
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_PDF_TYPES: ['application/pdf'],
}
```

## 📝 Tipos de Contenido

### VIDEO_LINK
No requiere upload, solo guardar URL:
```json
{
  "tipo": "VIDEO_LINK",
  "urlReferencia": "https://youtube.com/watch?v=abc123"
}
```

### VIDEO_FILE
Requiere subir archivo primero:
```bash
# 1. Upload
curl -X POST "http://localhost:3000/api/contents/upload?type=VIDEO_FILE" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./video.mp4"

# 2. Crear contenido con el archivo
{
  "tipo": "VIDEO_FILE",
  "archivoLocal": "/uploads/video_file/2026/03/video_xxx.mp4"
}
```

### IMAGEN
Requiere subir archivo:
```bash
# Upload imagen
curl -X POST "http://localhost:3000/api/contents/upload?type=IMAGEN" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./imagen.jpg"
```

### PDF
Requiere subir archivo:
```bash
# Upload PDF
curl -X POST "http://localhost:3000/api/contents/upload?type=PDF" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./documento.pdf"
```

## 🛡️ Seguridad

### Validaciones Implementadas:
- ✅ Solo usuarios autenticados (ADMIN/EDITOR)
- ✅ Validación de tipo MIME
- ✅ Límite de tamaño de archivo (50MB)
- ✅ Nombres de archivo únicos (previene sobrescritura)
- ✅ Estructura organizada por tipo y fecha

### Extensiones Permitidas:
- **Imágenes**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .mov, .avi
- **PDFs**: .pdf

## 🐛 Troubleshooting

### Error: "Cannot find module 'formidable'"
```bash
# Solución: Instalar dependencias
npm install
```

### Error: "Tipo de archivo no permitido"
Verifica que el tipo MIME del archivo esté en la lista permitida.

```javascript
// Verificar tipo MIME del archivo
const file = event.target.files[0]
console.log(file.type) // Debe ser image/jpeg, video/mp4, etc.
```

### Error: "File too large"
Ajusta `MAX_FILE_SIZE` en `lib/upload.ts` o reduce el tamaño del archivo.

### Archivos no se guardan
Verifica permisos de escritura en `public/uploads/`:
```bash
# Linux/Mac
chmod -R 755 public/uploads

# Windows (PowerShell con permisos)
icacls public\uploads /grant Users:F /T
```

## 📚 Documentación Completa

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para documentación completa de todos los endpoints.

## 🎯 Siguiente Paso

1. Ejecuta `npm install`
2. Inicia el servidor: `npm run dev`
3. Prueba el endpoint de upload con los ejemplos de cURL
4. Revisa la documentación completa en API_DOCUMENTATION.md
