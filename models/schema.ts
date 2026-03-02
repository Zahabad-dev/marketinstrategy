/**
 * Database Schema Definitions
 * MySQL/PostgreSQL compatible schemas
 */

export const UserSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'EDITOR', 'CLIENT') DEFAULT 'CLIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

export const ClientSchema = `
  CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto VARCHAR(200) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

export const CampaignSchema = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    objetivo_general TEXT NOT NULL,
    estado ENUM('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA') DEFAULT 'PLANIFICADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_mes_anio (mes, anio),
    INDEX idx_estado (estado)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

export const ContentSchema = `
  CREATE TABLE IF NOT EXISTS contenidos_calendarizados (
    id VARCHAR(36) PRIMARY KEY,
    campana_id VARCHAR(36) NOT NULL,
    fecha DATE NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    tipo ENUM('VIDEO_LINK', 'VIDEO_FILE', 'IMAGEN', 'PDF') NOT NULL,
    url_referencia VARCHAR(500),
    archivo_local VARCHAR(500),
    estado ENUM('PENDIENTE', 'EN_REVISION', 'APROBADO', 'PUBLICADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaña_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaña_id (campaña_id),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

export const AllSchemas = [
  UserSchema,
  ClientSchema,
  CampaignSchema,
  ContentSchema,
]

