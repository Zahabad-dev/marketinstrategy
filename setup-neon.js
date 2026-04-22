/**
 * =====================================================
 * SETUP NEON POSTGRESQL - MarketInStrategy
 * =====================================================
 * Crea tablas + usuario admin en tu base Neon.
 *
 * Uso:
 *   node setup-neon.js "postgresql://user:pass@host/db?sslmode=require"
 *
 * O con variable de entorno:
 *   $env:DATABASE_URL="postgresql://..."; node setup-neon.js
 * =====================================================
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ Falta DATABASE_URL\n');
  console.error('Uso: node setup-neon.js "postgresql://user:pass@host/db?sslmode=require"\n');
  process.exit(1);
}

const ADMIN_EMAIL    = 'admin@marketinstrategy.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NOMBRE   = 'Admin Principal';

const SCHEMAS = [
  // users
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(10) NOT NULL DEFAULT 'CLIENT' CHECK (rol IN ('ADMIN', 'EDITOR', 'CLIENT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_rol   ON users(rol)`,

  // clients
  `CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto VARCHAR(200) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_clients_usuario_id ON clients(usuario_id)`,

  // campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    objetivo_general TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADA' CHECK (estado IN ('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_cliente_id ON campaigns(cliente_id)`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_mes_anio   ON campaigns(mes, anio)`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_estado     ON campaigns(estado)`,

  // contenidos_calendarizados
  `CREATE TABLE IF NOT EXISTS contenidos_calendarizados (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_contenidos_campana_id ON contenidos_calendarizados(campana_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contenidos_fecha      ON contenidos_calendarizados(fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_contenidos_estado     ON contenidos_calendarizados(estado)`,
  `CREATE INDEX IF NOT EXISTS idx_contenidos_tipo       ON contenidos_calendarizados(tipo)`,
];

async function run() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   MarketInStrategy — Setup Neon PostgreSQL   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Conectado a PostgreSQL\n');
  } catch (err) {
    console.error('❌ No se pudo conectar:', err.message);
    process.exit(1);
  }

  // Crear tablas
  console.log('📦 Creando tablas...');
  for (const sql of SCHEMAS) {
    const label = sql.match(/(CREATE (?:TABLE|INDEX)[^(]+)/)?.[1]?.trim() ?? sql.slice(0, 50);
    try {
      await pool.query(sql);
      console.log(`   ✅ ${label}`);
    } catch (err) {
      console.error(`   ❌ ${label}: ${err.message}`);
    }
  }

  // Admin
  console.log('\n👤 Configurando administrador...');
  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]
  );

  if (existing.length > 0) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      "UPDATE users SET password = $1, rol = 'ADMIN', updated_at = NOW() WHERE email = $2",
      [hash, ADMIN_EMAIL]
    );
    console.log('   ✅ Admin actualizado (contraseña reseteada)');
  } else {
    const id   = crypto.randomUUID();
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (id, nombre, email, password, rol) VALUES ($1, $2, $3, $4, 'ADMIN')`,
      [id, ADMIN_NOMBRE, ADMIN_EMAIL, hash]
    );
    console.log('   ✅ Admin creado');
  }

  // Resumen
  const { rows: [u] } = await pool.query('SELECT COUNT(*) as n FROM users');
  const { rows: [c] } = await pool.query('SELECT COUNT(*) as n FROM clients');
  const { rows: [ca] }= await pool.query('SELECT COUNT(*) as n FROM campaigns');
  await pool.end();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║            ✅ SETUP COMPLETADO               ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Usuarios:  ${String(u.n).padEnd(34)}║`);
  console.log(`║  Clientes:  ${String(c.n).padEnd(34)}║`);
  console.log(`║  Campañas:  ${String(ca.n).padEnd(34)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  CREDENCIALES DE ACCESO                      ║');
  console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(35)}║`);
  console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(35)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  SIGUIENTE PASO:                             ║');
  console.log('║  Actualiza DATABASE_URL en Vercel:           ║');
  console.log('║    vercel env rm DATABASE_URL production     ║');
  console.log('║    vercel env add DATABASE_URL production    ║');
  console.log('║    vercel --prod --yes                       ║');
  console.log('╚══════════════════════════════════════════════╝\n');
}

run();
