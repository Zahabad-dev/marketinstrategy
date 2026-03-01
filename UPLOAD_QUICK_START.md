# 🚀 Sistema de Upload - Guía Rápida

## Formatos Soportados

### 📸 Imágenes
- **Formatos:** JPG, JPEG, PNG, GIF, WebP, SVG, BMP
- **Tamaño máximo:** 100MB
- **Preview:** ✓ Imagen completa renderizada

### 🎥 Videos (Archivos)
- **Formatos:** MP4, MPEG, MOV, AVI, WMV, WebM, OGG, 3GP, FLV
- **Tamaño máximo:** 100MB
- **Preview:** ✓ Reproductor HTML5

### 📄 PDFs
- **Formatos:** PDF
- **Tamaño máximo:** 100MB
- **Preview:** ✓ Enlace para abrir

### 🔗 Enlaces Externos

#### Plataformas con Preview Embeddable ✅
- **YouTube** - `youtube.com`, `youtu.be`
- **Vimeo** - `vimeo.com`
- **TikTok** - `tiktok.com`
- **Google Drive** - `drive.google.com`, `docs.google.com`

#### Plataformas de Enlace Directo ⚠
- Dropbox
- OneDrive
- Instagram
- Facebook
- Twitter/X
- Otros enlaces genéricos

---

## 📋 Cómo Usar

### 1. Subir Archivo (Imagen/Video/PDF)

1. **Ir al Dashboard** (`/dashboard`)
2. **Click en una fecha** del calendario
3. **Seleccionar tipo de contenido:**
   - Click en botón "IMAGEN" 🖼️
   - O "VIDEO" 🎥
   - O "PDF" 📄
4. **Llenar formulario:**
   - Cliente
   - Campaña
   - Fecha (pre-llenada)
   - Título*
   - Descripción (opcional)
5. **Seleccionar archivo** desde tu computadora
6. **Click "Crear Contenido"**

✅ **Resultado:**
- Archivo se sube automáticamente
- Evento aparece en el calendario con color distintivo
- Click en evento muestra preview

### 2. Agregar Enlace Externo

1. **Ir al Dashboard**
2. **Click en una fecha**
3. **Seleccionar "VIDEO LINK"** 🔗
4. **Ingresar URL** en el campo:
   - Ejemplo: `https://youtube.com/watch?v=dQw4w9WgXcQ`
5. **Verificar detección automática:**
   - ✅ Verde = Plataforma embeddable (YouTube, Vimeo, TikTok, Drive)
   - ⚠ Ámbar = Enlace directo (otros)
   - Si es YouTube, verás el thumbnail
6. **Llenar resto del formulario**
7. **Click "Crear Contenido"**

✅ **Resultado:**
- Enlace guardado sin subir archivo
- Evento aparece con color púrpura
- Click muestra preview embeddable (si aplica)

---

## 🎨 Colores del Calendario

- 🔗 **VIDEO LINK** = Púrpura
- 🎥 **VIDEO FILE** = Azul
- 🖼️ **IMAGEN** = Verde
- 📄 **PDF** = Rojo

---

## 👀 Vista Cliente

Los clientes (rol CLIENT) pueden:

- ✅ Ver contenidos **APROBADOS** o **PUBLICADOS**
- ✅ Ver previews de todos los formatos
- ✅ Descargar imágenes y videos
- ✅ Abrir PDFs
- ✅ Reproducir videos embeddables
- ❌ No pueden editar ni aprobar

Acceso: `/cliente`

---

## ⚙️ Permisos por Rol

### ADMIN
- ✅ Subir archivos
- ✅ Agregar enlaces
- ✅ Aprobar/Rechazar contenidos
- ✅ Editar cualquier contenido
- ✅ Ver todos los contenidos

### EDITOR  
- ✅ Subir archivos
- ✅ Agregar enlaces
- ✅ Editar sus contenidos
- ⚠️ No puede aprobar/rechazar
- ⚠️ Solo ve sus campañas asignadas

### CLIENT
- ✅ Ver contenidos aprobados de sus campañas
- ✅ Descargar archivos
- ❌ No puede subir
- ❌ No puede editar

---

## 📂 Organización de Archivos

Los archivos se guardan automáticamente en:

```
public/uploads/
├── IMAGEN/2024/01/archivo.jpg
├── IMAGEN/2024/02/otro.png
├── VIDEO_FILE/2024/01/video.mp4
└── PDF/2024/01/documento.pdf
```

Estructura: `tipo/año/mes/nombre-único.ext`

---

## 🔍 Ejemplos de URLs Soportadas

### YouTube ✅
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

### Vimeo ✅
- `https://vimeo.com/123456789`

### TikTok ✅
- `https://tiktok.com/@usuario/video/123456`
- `https://vm.tiktok.com/ABC123`

### Google Drive ✅
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`

### Otros ⚠
- Cualquier URL válida (se muestra como enlace directo)

---

## ❓ Problemas Comunes

### "Archivo demasiado grande"
**Solución:** Comprimir archivo o usar enlace externo (YouTube, Drive, etc.)

### "Tipo de archivo no soportado"
**Solución:** Convertir a formato permitido (JPG, PNG, MP4, PDF)

### Preview de YouTube no funciona
**Solución:** Verificar que URL sea formato `https://youtube.com/watch?v=ID`

### Enlace de Google Drive no se ve
**Solución:** 
1. Verificar que el archivo sea público
2. Click derecho → Compartir → Obtener enlace → "Cualquier persona con el enlace"

---

## 💡 Tips Útiles

### Para Mejores Resultados

1. **Imágenes:** Usar JPG o PNG
2. **Videos archivos:** Usar MP4 para mejor compatibilidad
3. **Videos externos:** Preferir YouTube/Vimeo para videos largos (ahorra espacio)
4. **PDFs:** Asegurarse que no excedan 100MB
5. **Enlaces:** Copiar URL completa desde la barra del navegador

### Optimización

- 📸 Comprimir imágenes con TinyPNG antes de subir
- 🎥 Subir videos largos a YouTube en lugar de archivo
- 📄 Comprimir PDFs con herramientas online
- 🔗 Usar Google Drive para archivos grandes

---

## 📞 Soporte

Si tienes problemas:

1. Verificar que el archivo cumple requisitos (formato, tamaño)
2. Intentar con otro navegador
3. Limpiar caché del navegador
4. Verificar permisos de tu rol
5. Contactar al administrador del sistema

---

## 📚 Más Información

Para documentación técnica completa, ver:
- `UPLOAD_SYSTEM_DOCUMENTATION.md` - Documentación técnica detallada
- `API_DOCUMENTATION.md` - Endpoints de la API
- `DASHBOARD_DOCUMENTATION.md` - Guía del dashboard

---

**¡Listo para subir contenido!** 🚀

Cualquier archivo multimedia que necesites, el sistema lo maneja automáticamente. Solo selecciona el tipo, elige el archivo o pega la URL, y listo.
