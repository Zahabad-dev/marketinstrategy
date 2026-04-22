/**
 * Database Schema Definitions — PostgreSQL
 */

export const UserSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(10) NOT NULL DEFAULT 'CLIENT' CHECK (rol IN ('ADMIN', 'EDITOR', 'CLIENT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
`

export const ClientSchema = `
  CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto VARCHAR(200) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_clients_usuario_id ON clients(usuario_id);
`

export const CampaignSchema = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    objetivo_general TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADA' CHECK (estado IN ('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_campaigns_cliente_id ON campaigns(cliente_id);
  CREATE INDEX IF NOT EXISTS idx_campaigns_mes_anio ON campaigns(mes, anio);
  CREATE INDEX IF NOT EXISTS idx_campaigns_estado ON campaigns(estado);
`

export const ContentSchema = `
  CREATE TABLE IF NOT EXISTS contenidos_calendarizados (
    id VARCHAR(36) PRIMARY KEY,
    campana_id VARCHAR(36) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('VIDEO_LINK', 'VIDEO_FILE', 'IMAGEN', 'PDF')),
    url_referencia VARCHAR(500),
    archivo_local VARCHAR(500),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'PUBLICADO', 'RECHAZADO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_contenidos_campana_id ON contenidos_calendarizados(campana_id);
  CREATE INDEX IF NOT EXISTS idx_contenidos_fecha ON contenidos_calendarizados(fecha);
  CREATE INDEX IF NOT EXISTS idx_contenidos_estado ON contenidos_calendarizados(estado);
  CREATE INDEX IF NOT EXISTS idx_contenidos_tipo ON contenidos_calendarizados(tipo);
`

export const AllSchemas = [
  UserSchema,
  ClientSchema,
  CampaignSchema,
  ContentSchema,
]

