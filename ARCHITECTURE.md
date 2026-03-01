# 🏗️ Arquitectura del Sistema - MarketInStrategy

## Visión General

MarketInStrategy es un sistema SaaS diseñado para agencias de marketing que permite la gestión integral de clientes y la calendarización de campañas mensuales.

## Stack Tecnológico

### Backend
- **Framework:** Flask 3.0
- **Base de Datos:** MySQL 8.0
- **ORM:** SQLAlchemy
- **Autenticación:** JWT (Flask-JWT-Extended)
- **Migraciones:** Flask-Migrate
- **Validación:** Marshmallow

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Estilos:** Tailwind CSS 3
- **Routing:** React Router v6
- **Estado:** Zustand
- **HTTP Client:** Axios
- **Formularios:** React Hook Form
- **Notificaciones:** React Hot Toast
- **Iconos:** Lucide React

### DevOps
- **Containerización:** Docker & Docker Compose
- **Servidor Web:** Gunicorn (producción)
- **Proxy Reverso:** Nginx (recomendado para producción)

## Arquitectura de Carpetas

```
marketinstrategy/
├── backend/                    # API Backend
│   ├── app/
│   │   ├── __init__.py        # Factory de aplicación
│   │   ├── config.py          # Configuraciones
│   │   ├── extensions.py      # Extensiones Flask
│   │   ├── models/            # Modelos de BD
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   └── campaign.py
│   │   ├── routes/            # Endpoints API
│   │   │   ├── auth.py
│   │   │   ├── clients.py
│   │   │   ├── campaigns.py
│   │   │   └── dashboard.py
│   │   ├── services/          # Lógica de negocio
│   │   └── utils/             # Utilidades
│   ├── migrations/            # Migraciones Alembic
│   ├── tests/                 # Tests unitarios
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.py
│
├── frontend/                   # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   └── Layout/
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Campaigns.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/          # Servicios API
│   │   │   └── api.js
│   │   ├── store/             # State management
│   │   │   └── authStore.js
│   │   ├── utils/             # Utilidades
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Modelo de Datos

### User (Usuario)
```
- id: Integer (PK)
- email: String (Unique)
- password_hash: String
- first_name: String
- last_name: String
- role: String (admin, manager, user)
- is_active: Boolean
- created_at: DateTime
```

### Client (Cliente)
```
- id: Integer (PK)
- name: String
- email: String (Unique)
- phone: String
- company: String
- industry: String
- website: String
- address: Text
- status: String (active, inactive, prospect)
- notes: Text
- created_at: DateTime
- updated_at: DateTime
```

### Campaign (Campaña)
```
- id: Integer (PK)
- client_id: Integer (FK → Client)
- name: String
- description: Text
- campaign_type: String
- start_date: Date
- end_date: Date
- budget: Decimal
- currency: String
- status: String (planned, active, paused, completed, cancelled)
- priority: String (low, medium, high)
- goals: Text
- metrics: JSON
- created_by: Integer (FK → User)
- created_at: DateTime
- updated_at: DateTime
```

## Flujo de Autenticación

1. Usuario envía credenciales a `/api/auth/login`
2. Backend valida y genera Access Token + Refresh Token
3. Frontend almacena tokens en localStorage
4. Todas las peticiones subsecuentes incluyen Access Token en header
5. Si Access Token expira, se usa Refresh Token automáticamente
6. Si Refresh Token expira, usuario debe iniciar sesión nuevamente

## Endpoints API Principales

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Usuario actual
- `PUT /api/auth/me` - Actualizar perfil

### Clientes
- `GET /api/clients` - Listar (con paginación y búsqueda)
- `POST /api/clients` - Crear
- `GET /api/clients/:id` - Obtener
- `PUT /api/clients/:id` - Actualizar
- `DELETE /api/clients/:id` - Eliminar

### Campañas
- `GET /api/campaigns` - Listar (con filtros)
- `POST /api/campaigns` - Crear
- `GET /api/campaigns/:id` - Obtener
- `PUT /api/campaigns/:id` - Actualizar
- `DELETE /api/campaigns/:id` - Eliminar
- `GET /api/campaigns/calendar` - Vista calendario

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/recent-activity` - Actividad reciente

## Características de Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación stateless
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Protección de rutas
- ✅ Control de acceso basado en roles

## Escalabilidad

### Backend
- Application Factory Pattern para múltiples instancias
- Blueprints para modularidad
- Database pooling con SQLAlchemy
- Preparado para Gunicorn + Workers

### Frontend
- Code splitting automático con Vite
- Lazy loading de componentes
- State management eficiente con Zustand
- Build optimizado para producción

### Base de Datos
- Índices en campos de búsqueda frecuente
- Relaciones optimizadas
- Paginación implementada
- Preparado para réplicas de lectura

## Próximas Mejoras Sugeridas

1. **Backend**
   - [ ] Rate limiting
   - [ ] Logging estructurado
   - [ ] Tests de integración
   - [ ] Webhooks para eventos
   - [ ] Export de reportes (PDF/Excel)

2. **Frontend**
   - [ ] PWA support
   - [ ] Modo oscuro
   - [ ] Drag & drop en calendario
   - [ ] Charts y gráficas
   - [ ] Notificaciones push

3. **Infraestructura**
   - [ ] CI/CD pipeline
   - [ ] Monitoring y alertas
   - [ ] Backups automáticos
   - [ ] CDN para assets
   - [ ] SSL/TLS

## Despliegue

### Desarrollo
```bash
docker-compose up
```

### Producción (Recomendado)
- Backend: Gunicorn + Nginx
- Frontend: Build estático en CDN
- BD: MySQL managed (RDS, etc.)
- Variables de entorno seguras
- HTTPS obligatorio
