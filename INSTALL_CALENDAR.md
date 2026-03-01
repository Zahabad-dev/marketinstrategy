# 🚀 Instalación Rápida - Calendario Marketing Planner

## 📦 Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará automáticamente todas las nuevas dependencias agregadas al `package.json`:

- `@fullcalendar/core@^6.1.10`
- `@fullcalendar/daygrid@^6.1.10`
- `@fullcalendar/interaction@^6.1.10`
- `@fullcalendar/react@^6.1.10`
- `formidable@^3.5.1` (para uploads)
- `@types/formidable@^3.4.5`

## 🔍 Paso 2: Verificar Compilación

```bash
npm run type-check
```

Esto verificará que no haya errores de TypeScript.

## 🎯 Paso 3: Iniciar Servidor

```bash
npm run dev
```

## 🧪 Paso 4: Probar el Calendario

### Opción A: Navegador

1. Abre `http://localhost:3000`
2. Inicia sesión con:
   - **Email**: `admin@marketing.com`
   - **Password**: `admin123`
3. Navega a `http://localhost:3000/calendar`

### Opción B: cURL

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketing.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Verificar que el token funciona
echo $TOKEN

# 3. Obtener contenidos (debería mostrar eventos del calendario)
curl http://localhost:3000/api/contents?perPage=20 \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Ahora abre el navegador en /calendar 
```

## ✅ Verificación de Funcionalidades

Una vez en el calendario (`/calendar`), verifica:

### 1. Vista del Calendario ✅
- [ ] Se muestra el calendario mensual de FullCalendar
- [ ] Los eventos (contenidos) aparecen en sus fechas correspondientes
- [ ] Cada tipo de contenido tiene su color:
  - 🟢 Verde = Imágenes
  - 🟣 Morado = Video Links
  - 🔵 Azul = Video Files
  - 🔴 Rojo = PDFs

### 2. Navegación ✅
- [ ] Botones "Anterior/Siguiente" cambian de mes
- [ ] Botón "Hoy" regresa al mes actual
- [ ] Toggle entre vista "Mes" y "Semana"

### 3. Filtros ✅
- [ ] Botón "Filtros" muestra/oculta panel de filtros
- [ ] Filtro de "Cliente" lista todos los clientes
- [ ] Filtro de "Campaña" se actualiza según el cliente seleccionado
- [ ] Al seleccionar filtros, el calendario muestra solo contenidos filtrados
- [ ] Botón "Limpiar filtros" resetea los filtros
- [ ] Badge de contador muestra número de filtros activos

### 4. Modal de Detalles ✅
- [ ] Click en cualquier evento abre modal
- [ ] Modal muestra:
  - Título del contenido
  - Icono y etiqueta del tipo
  - Fecha formateada en español
  - Estado con colores (Pendiente, En Revisión, Aprobado, etc.)
  - Descripción completa
  - Preview según tipo:
    - **Imagen**: Vista previa de la imagen
    - **Video Link (YouTube)**: Reproductor embebido
    - **Video Link (Vimeo)**: Reproductor embebido
    - **Video Link (otro)**: Enlace para abrir
    - **Video File**: Reproductor HTML5
    - **PDF**: Enlace para abrir en nueva pestaña
  - Metadata (fechas de creación/actualización)

### 5. Estadísticas ✅
- [ ] Panel de resumen al final muestra:
  - Total de contenidos
  - Número de imágenes
  - Número de videos
  - Número de PDFs

## 🐛 Troubleshooting

### Error: "Cannot find module '@fullcalendar/react'"

**Causa**: Las dependencias no están instaladas.

**Solución**:
```bash
npm install
```

### Error: Calendario vacío (sin eventos)

**Causa**: No hay contenidos en la base de datos.

**Solución**:
```bash
# 1. Inicializar base de datos
npm run db:init

# 2. Poblar con datos de ejemplo
npm run db:seed

# 3. Crear contenidos de prueba
curl -X POST http://localhost:3000/api/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campañaId": "uuid-de-campaña",
    "fecha": "2026-03-15",
    "titulo": "Post de prueba",
    "descripcion": "Contenido de prueba para el calendario",
    "tipo": "IMAGEN",
    "archivoLocal": "/uploads/test.jpg",
    "estado": "PENDIENTE"
  }'
```

### Error: Modal no muestra preview de video YouTube

**Causa**: URL del video no está en formato correcto.

**Solución**: Usa uno de estos formatos:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

### Error 401 Unauthorized

**Causa**: Token JWT expirado o inválido.

**Solución**:
1. Logout y vuelve a login
2. Verifica que `JWT_SECRET` en `.env.local` esté configurado
3. Borra localStorage y cookies

### CSS del calendario se ve mal

**Causa**: Estilos de FullCalendar no cargaron.

**Solución**: Verifica que [app/globals.css](./app/globals.css) tenga los imports:
```css
@import '@fullcalendar/core/main.css';
@import '@fullcalendar/daygrid/main.css';
```

## 📚 Documentación Completa

Para más detalles, consulta:

- 📅 [CALENDAR_DOCUMENTATION.md](./CALENDAR_DOCUMENTATION.md) - Documentación completa del calendario
- 📡 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentación de todos los endpoints
- 🔐 [AUTHENTICATION.md](./AUTHENTICATION.md) - Sistema de autenticación
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - Guía de inicio rápido

## 🎯 Siguiente Paso

Una vez que todo funcione correctamente:

1. **Crear contenidos de prueba** con diferentes tipos (IMAGEN, VIDEO_LINK, PDF)
2. **Subir archivos** usando el endpoint `/api/contents/upload`
3. **Asignar contenidos a campañas** para verlos organizados en el calendario
4. **Probar filtros** seleccionando diferentes clientes y campañas

## 💡 Tips de Uso

1. **Organización por colores**: Usa los colores para identificar rápidamente el tipo de contenido
2. **Vista semanal**: Útil para ver detalles de una semana específica con muchos contenidos
3. **"+X más" link**: Si hay más de 3 eventos en un día, click en "+X más" para ver todos
4. **Filtros**: Combina cliente + campaña para enfocarte en un proyecto específico
5. **Modal**: Usa el modal para revisar contenidos antes de aprobarlos o publicarlos

---

**¿Listo? ¡Ejecuta `npm install` y comienza!** 🚀
