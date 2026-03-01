# 🚀 Marketing Strategy SaaS

Sistema completo de gestión de calendarios de contenido para agencias de marketing y sus clientes.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Descripción

**Marketing Strategy** es un SaaS fullstack que permite a agencias de marketing gestionar calendarios de contenido para múltiples clientes. El sistema maneja tres roles principales:

- **ADMIN:** Crea clientes, campañas mensuales y aprueba contenidos
- **EDITOR:** Llena calendarios con contenidos multimedia (imágenes, videos, PDFs, links)
- **CLIENT:** Visualiza su calendario mensual en modo presentación ejecutiva

### Características Principales

✅ **Gestión Multi-Cliente** - Administra múltiples clientes desde una sola plataforma  
✅ **Calendario Interactivo** - FullCalendar con drag & drop y vista mensual  
✅ **Contenidos Multimedia** - Sube imágenes, videos, PDFs o agrega links externos  
✅ **Auto-Detección de Plataformas** - YouTube, Vimeo, TikTok, Google Drive con preview embeddable  
✅ **Workflow de Aprobación** - Sistema de estados (Pendiente → En Revisión → Aprobado → Publicado)  
✅ **Vista Cliente Premium** - Interfaz minimalista para presentación ejecutiva  
✅ **Roles y Permisos** - Control granular de acceso por rol  
✅ **Upload Seguro** - Hasta 100MB con validación de MIME types  
✅ **Serverless Ready** - Optimizado para Vercel deployment  

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety en todo el código
- **Tailwind CSS** - Utility-first CSS framework
- **FullCalendar 6** - Calendario interactivo profesional
- **Lucide Icons** - Iconos modernos y consistentes

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **JWT** - Autenticación con JSON Web Tokens
- **bcrypt** - Hash seguro de passwords
- **formidable** - Upload de archivos multipart

### Base de Datos
- **MySQL** - Compatible con PlanetScale, Railway, etc.
- **REST API** - CRUD completo para todas las entidades

### Storage
- **Local** - Public/uploads (desarrollo)
- **Vercel Blob** - Storage serverless (producción recomendado)
- **AWS S3** - Alternativa enterprise
- **Cloudinary** - Alternativa con transformaciones

---

## 📦 Instalación

### Pre-requisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MySQL >= 5.7 o PostgreSQL >= 12
```

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/marketingstrategy.git
cd marketingstrategy
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**Mínimo requerido:**
```env
DATABASE_URL="mysql://user:password@localhost:3306/marketingstrategy"
JWT_SECRET="tu-secret-key-segura-de-32-chars-minimo"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Crear Base de Datos

```bash
# Crear database
mysql -u root -p
CREATE DATABASE marketingstrategy;
exit;

# Importar schema
mysql -u root -p marketingstrategy < schema.sql
```

### 5. Crear Usuario Admin Inicial

```sql
-- Conectar a MySQL
mysql -u root -p marketingstrategy

-- Insertar admin (password: admin123)
INSERT INTO Usuario (id, nombre, email, passwordHash, rol, activo, createdAt, updatedAt)
VALUES (
  UUID(),
  'Admin Principal',
  'admin@tuempresa.com',
  '$2b$10$6ZJKvKq6sZX5h/YqGxN8/.YrXqZJYqQX7kKZVZbJhYqQX7kKZVZbJ',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

### 6. Iniciar Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment en Vercel

### Método Rápido

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Configuración Requerida

**En Vercel Dashboard → Settings → Environment Variables:**

```env
DATABASE_URL = mysql://user:pass@host:3306/db
JWT_SECRET = [generar secreto seguro]
JWT_EXPIRES_IN = 7d
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
MAX_UPLOAD_SIZE = 104857600
```

**Ver guía completa:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentación

### Guías de Usuario
- [DASHBOARD_DOCUMENTATION.md](DASHBOARD_DOCUMENTATION.md) - Guía completa del dashboard
- [CLIENTE_VIEW_DOCUMENTATION.md](CLIENTE_VIEW_DOCUMENTATION.md) - Guía de vista cliente
- [UPLOAD_SYSTEM_DOCUMENTATION.md](UPLOAD_SYSTEM_DOCUMENTATION.md) - Sistema de uploads

### Guías Técnicas
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Referencia de API endpoints
- [CALENDAR_DOCUMENTATION.md](CALENDAR_DOCUMENTATION.md) - Integración de FullCalendar
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment en producción

### Quick Starts
- [INSTALL_DASHBOARD.md](INSTALL_DASHBOARD.md) - Setup rápido del dashboard
- [INSTALL_CLIENTE_VIEW.md](INSTALL_CLIENTE_VIEW.md) - Setup rápido vista cliente
- [UPLOAD_QUICK_START.md](UPLOAD_QUICK_START.md) - Guía rápida de uploads

---

## 🏗️ Arquitectura

```
marketinstrategy/
├── app/
│   ├── dashboard/         # Dashboard principal (ADMIN/EDITOR)
│   ├── cliente/           # Vista ejecutiva cliente
│   ├── calendar/          # Calendario compartido
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout global con AuthProvider
├── components/
│   ├── ui/                # Componentes UI reutilizables
│   ├── Sidebar.tsx        # Navegación lateral
│   ├── AddClientModal.tsx # Modal crear clientes
│   ├── AddCampaignModal.tsx
│   ├── AddContentModal.tsx
│   ├── EditContentModal.tsx
│   └── ContentDetailModal.tsx
├── contexts/
│   └── AuthContext.tsx    # Contexto de autenticación
├── lib/
│   ├── upload.ts          # Utilidades de upload
│   ├── link-detector.ts   # Detector de plataformas
│   └── api.ts             # Helpers de API
├── pages/api/
│   ├── auth/              # Endpoints de autenticación
│   ├── clients/           # CRUD de clientes
│   ├── campaigns/         # CRUD de campañas
│   ├── contents/          # CRUD de contenidos
│   │   └── upload.ts      # Upload de archivos
│   └── users/             # CRUD de usuarios
├── public/
│   └── uploads/           # Archivos subidos (local)
├── types/
│   └── index.ts           # TypeScript types/interfaces
└── vercel.json            # Configuración de Vercel
```

---

## 🔐 Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Passwords hasheados con bcrypt (10 rounds)
- Refresh tokens en localStorage
- Rutas protegidas con middleware

### Autorización
- Control de acceso por rol (ADMIN/EDITOR/CLIENT)
- Validación en backend de permisos
- Clientes solo ven sus propias campañas

### Upload Seguro
- Validación de MIME types en backend
- Límite de tamaño (100MB por defecto)
- Nombres de archivo sanitizados
- Prevención de path traversal

### API Security
- CORS configurado
- Rate limiting (recomendado)
- Input validation
- SQL injection prevention

---

## 📊 Roadmap

### v1.0 (Actual) ✅
- [x] Sistema de autenticación
- [x] Dashboard con calendario
- [x] CRUD de clientes/campañas/contenidos
- [x] Upload de archivos
- [x] Vista cliente ejecutiva
- [x] Auto-detección de plataformas
- [x] Workflow de aprobación

### v1.1 (Próximo) 🔄
- [ ] Notificaciones por email
- [ ] Exportar calendario a PDF
- [ ] Comentarios en contenidos
- [ ] Historial de cambios
- [ ] Dashboard analytics

### v2.0 (Futuro) 🔮
- [ ] Multi-idioma
- [ ] Plantillas de campañas
- [ ] Integración con redes sociales
- [ ] Publicación automática
- [ ] Mobile app (React Native)

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd marketinstrategy
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env.local` basado en `.env.example`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=marketing_saas

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=30d
```

4. Crear base de datos:
```bash
# Conectarse a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE marketing_saas;
USE marketing_saas;

# Ejecutar el schema
# (Ver contenido del schema en: models/schema.ts)
```
5. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
marketinstrategy/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout raíz
│   ├── page.tsx             # Dashboard
│   ├── login/               # Página de login
│   ├── clients/             # Gestión de clientes
│   ├── campaigns/           # Gestión de campañas
│   └── calendar/            # Calendario
├── pages/api/               # API Routes serverless
│   ├── auth/                # Autenticación
│   ├── users/               # Usuarios
│   ├── clients/             # Clientes
│   ├── campaigns/           # Campañas
│   └── contents/            # Contenidos
├── components/              # Componentes React
│   └── ui/                  # Componentes UI básicos
├── lib/                     # Utilidades
│   ├── db.ts               # Conexión MySQL
│   ├── auth.ts             # JWT & bcrypt
│   ├── validations.ts      # Schemas Zod
│   ├── permissions.ts      # Control de acceso
│   └── api-response.ts     # Helpers de respuesta
├── models/                  # Modelos de datos
│   ├── schema.ts           # Schema SQL
│   ├── user.ts
│   ├── client.ts
│   ├── campaign.ts
│   └── content.ts
├── types/                   # TypeScript types
│   └── index.ts
└── middleware.ts           # Next.js middleware
```

## 🔐 Roles y Permisos

- **ADMIN (nivel 3)**: Acceso total
- **EDITOR (nivel 2)**: Puede gestionar todos los recursos
- **CLIENTE (nivel 1)**: Solo puede ver recursos asignados

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/[id]` - Obtener usuario
- `PUT /api/users/[id]` - Actualizar usuario
- `DELETE /api/users/[id]` - Eliminar usuario

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/[id]` - Obtener cliente
- `PUT /api/clients/[id]` - Actualizar cliente
- `DELETE /api/clients/[id]` - Eliminar cliente

### Campañas
- `GET /api/campaigns` - Listar campañas
- `POST /api/campaigns` - Crear campaña
- `GET /api/campaigns/[id]` - Obtener campaña
- `PUT /api/campaigns/[id]` - Actualizar campaña
- `DELETE /api/campaigns/[id]` - Eliminar campaña
- `GET /api/campaigns/calendar` - Vista calendario

### Contenidos
- `GET /api/contents` - Listar contenidos
- `POST /api/contents` - Crear contenido
- `GET /api/contents/[id]` - Obtener contenido
- `PUT /api/contents/[id]` - Actualizar contenido
- `DELETE /api/contents/[id]` - Eliminar contenido

## 🚀 Despliegue en Vercel

1. Push a GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Importar en Vercel:
- Conectar repositorio de GitHub
- Configurar variables de entorno
- Deploy

3. Configurar MySQL:
Usar un servicio gestionado como:
- **PlanetScale** (recomendado)
- **Railway**
- **AWS RDS**
- **DigitalOcean**

## 📝 Scripts Disponibles

```bash
npm run dev          # Modo desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run lint         # Linter
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Refresh tokens para sesiones largas
- Middleware de autenticación en rutas protegidas
- Validación de datos con Zod
- Sistema de permisos jerárquico

## 📄 Licencia

MIT
## 🌐 Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

## 📝 Características Principales

- ✅ Gestión de clientes
- ✅ Calendarización de campañas mensuales
- ✅ Dashboard de métricas
- ✅ Autenticación y autorización
- ✅ API RESTful
- ✅ Interfaz responsive

## 🛠️ Desarrollo

Ver documentación específica en cada carpeta:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
