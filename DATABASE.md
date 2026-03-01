# Configuración de Base de Datos

## 📋 Esquema de Base de Datos

El sistema utiliza MySQL (o PostgreSQL compatible) con 4 tablas principales:

### 1. **users** - Usuarios del sistema
```sql
- id: VARCHAR(36) PRIMARY KEY
- nombre: VARCHAR(200)
- email: VARCHAR(255) UNIQUE
- password: VARCHAR(255) - (hasheado con bcrypt)
- rol: ENUM('ADMIN', 'EDITOR', 'CLIENT')
- created_at, updated_at: TIMESTAMP
```

**Roles:**
- `ADMIN`: Acceso total al sistema
- `EDITOR`: Puede gestionar clientes, campañas y contenidos
- `CLIENT`: Solo puede ver sus propios clientes y campañas

### 2. **clients** - Empresas cliente
```sql
- id: VARCHAR(36) PRIMARY KEY
- nombre_empresa: VARCHAR(200)
- contacto: VARCHAR(200)
- usuario_id: VARCHAR(36) FK -> users.id
- created_at, updated_at: TIMESTAMP
```

### 3. **campaigns** - Campañas mensuales
```sql
- id: VARCHAR(36) PRIMARY KEY
- cliente_id: VARCHAR(36) FK -> clients.id
- mes: INT (1-12)
- año: INT
- objetivo_general: TEXT
- estado: ENUM('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')
- created_at, updated_at: TIMESTAMP
```

### 4. **contenidos_calendarizados** - Contenido de campañas
```sql
- id: VARCHAR(36) PRIMARY KEY
- campaña_id: VARCHAR(36) FK -> campaigns.id
- fecha: DATE
- titulo: VARCHAR(300)
- descripcion: TEXT
- tipo: ENUM('VIDEO_LINK', 'VIDEO_FILE', 'IMAGEN', 'PDF')
- url_referencia: VARCHAR(500)
- archivo_local: VARCHAR(500)
- estado: ENUM('PENDIENTE', 'EN_REVISION', 'APROBADO', 'PUBLICADO', 'RECHAZADO')
- created_at, updated_at: TIMESTAMP
```

## 🔧 Configuración

### 1. Variables de Entorno

Crear archivo `.env.local`:

```env
# Database - MySQL
DATABASE_URL=mysql://root:password@localhost:3306/marketing_saas
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=marketing_saas

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=30d

# App
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Crear Base de Datos MySQL

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE marketing_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verificar
SHOW DATABASES;
USE marketing_saas;
```

### 3. Ejecutar Migraciones

```bash
# Instalar dependencias
npm install

# Inicializar tablas
npm run db:init

# Poblar con datos de ejemplo (opcional)
npm run db:seed
```

## 📊 Datos de Ejemplo

Después de ejecutar `npm run db:seed`, tendrás:

**Usuarios:**
- Admin: `admin@marketing.com` / `admin123`
- Editor: `editor@marketing.com` / `editor123`
- Cliente: `cliente@empresa.com` / `cliente123`

**Clientes:**
- TechCorp Solutions
- Fashion Boutique

**Campañas:**
- TechCorp - Marzo 2026 (Lanzamiento producto SaaS)
- Fashion Boutique - Marzo 2026 (Colección primavera)

**Contenidos:**
- Videos, infografías, catálogos PDF

## 🔐 Relaciones y Cascadas

```
users
  ↓ (ON DELETE CASCADE)
clients
  ↓ (ON DELETE CASCADE)
campaigns
  ↓ (ON DELETE CASCADE)
contenidos_calendarizados
```

Al eliminar un usuario, se eliminan todos sus clientes, campañas y contenidos relacionados.

## 🚀 Conexión desde Code

### Ejemplo de uso en API Route:

```typescript
import { UserModel } from '@/models'

// Crear usuario
const user = await UserModel.create({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'secure123',
  rol: UserRole.CLIENT
})

// Buscar por email
const found = await UserModel.findByEmail('juan@example.com')

// Listar con paginación
const users = await UserModel.list(
  { rol: UserRole.CLIENT, search: 'juan' },
  { page: 1, perPage: 20 }
)

// Contar
const total = await UserModel.count({ rol: UserRole.CLIENT })
```

## 🗄️ Migraciones

Para cambios en el schema:

1. Modificar `models/schema.ts`
2. Ejecutar: `npm run db:init`

⚠️ **Advertencia:** `db:init` creará las tablas si no existen pero no modificará tablas existentes. Para cambios en producción, usa migraciones manuales.

## 🔍 Consultas Útiles

```sql
-- Ver todas las campañas de un cliente
SELECT * FROM campaigns WHERE cliente_id = 'uuid-del-cliente';

-- Contenidos pendientes de una campaña
SELECT * FROM contenidos_calendarizados 
WHERE campaña_id = 'uuid-campaña' AND estado = 'PENDIENTE';

-- Campañas de marzo 2026
SELECT * FROM campaigns WHERE mes = 3 AND año = 2026;

-- Estadísticas por estado
SELECT estado, COUNT(*) as total 
FROM campaigns 
GROUP BY estado;
```

## 📦 Backup y Restore

```bash
# Backup
mysqldump -u root -p marketing_saas > backup.sql

# Restore
mysql -u root -p marketing_saas < backup.sql
```

## 🔧 Troubleshooting

### Error de conexión
- Verificar que MySQL esté corriendo
- Revisar credenciales en `.env.local`
- Verificar que la base de datos exista

### Error de permisos
```sql
GRANT ALL PRIVILEGES ON marketing_saas.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Pool de conexiones agotado
Aumentar `DB_POOL_MAX` en `.env.local`

## 🌐 PostgreSQL (Alternativa)

Para usar PostgreSQL en lugar de MySQL:

1. Cambiar `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_saas
```

2. Modificar ENUMs en `models/schema.ts` a formato PostgreSQL si es necesario

3. Instalar: `npm install pg`
