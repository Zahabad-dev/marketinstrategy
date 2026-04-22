/**
 * =====================================================
 * SETUP COMPLETO DE PRODUCCIÓN - MarketInStrategy
 * =====================================================
 * Uso: node setup-production.js [DATABASE_URL]
 *
 * Si no se pasa DATABASE_URL como argumento, usa la que
 * está configurada en el script (línea DATABASE_URL_DEFAULT).
 * =====================================================
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─── CONFIGURACIÓN ────────────────────────────────────
const DATABASE_URL_DEFAULT = process.env.DATABASE_URL ||
  'mysql://root:ypSkugjCaCdkjtDbUYDGdpFiVBxiGrvS@nozomi.proxy.rlwy.net:37955/railway';

const DATABASE_URL = process.argv[2] || DATABASE_URL_DEFAULT;

const ADMIN_EMAIL    = 'admin@marketinstrategy.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NOMBRE   = 'Admin Principal';
// ──────────────────────────────────────────────────────

const SCHEMA_SQL = [
  // users
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'EDITOR', 'CLIENT') DEFAULT 'CLIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // clients
  `CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto VARCHAR(200) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    mes INT NOT NULL,
    año INT NOT NULL,
    objetivo_general TEXT NOT NULL,
    estado ENUM('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA') DEFAULT 'PLANIFICADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_mes_año (mes, año),
    INDEX idx_estado (estado)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // contenidos_calendarizados
  `CREATE TABLE IF NOT EXISTS contenidos_calendarizados (
    id VARCHAR(36) PRIMARY KEY,
    campaña_id VARCHAR(36) NOT NULL,
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function run() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   MarketInStrategy — Setup de Producción     ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`🔗 Conectando a: ${DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}\n`);

  let conn;
  try {
    conn = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Conexión exitosa a la base de datos\n');
  } catch (err) {
    console.error('❌ No se pudo conectar:', err.message);
    console.error('\n📌 Verifica que el servicio MySQL esté activo en Railway:');
    console.error('   https://railway.app → tu proyecto → servicio MySQL → Start\n');
    process.exit(1);
  }

  // 1. Crear tablas
  console.log('📦 Creando/verificando tablas...');
  for (const sql of SCHEMA_SQL) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\S+)/)[1];
    try {
      await conn.execute(sql);
      console.log(`   ✅ ${tableName}`);
    } catch (err) {
      console.error(`   ❌ ${tableName}: ${err.message}`);
    }
  }

  // 2. Crear usuario admin
  console.log('\n👤 Configurando usuario administrador...');
  const [existing] = await conn.execute(
    'SELECT id, email FROM users WHERE email = ?', [ADMIN_EMAIL]
  );

  if (existing.length > 0) {
    console.log(`   ⚠️  Ya existe: ${ADMIN_EMAIL}`);
    console.log('   💡 Actualizando contraseña...');
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await conn.execute(
      'UPDATE users SET password = ?, rol = ?, updated_at = NOW() WHERE email = ?',
      [hash, 'ADMIN', ADMIN_EMAIL]
    );
    console.log('   ✅ Contraseña actualizada');
  } else {
    const id   = crypto.randomUUID();
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await conn.execute(
      `INSERT INTO users (id, nombre, email, password, rol, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'ADMIN', NOW(), NOW())`,
      [id, ADMIN_NOMBRE, ADMIN_EMAIL, hash]
    );
    console.log('   ✅ Administrador creado');
  }

  // 3. Resumen
  const [userCount]    = await conn.execute('SELECT COUNT(*) as n FROM users');
  const [clientCount]  = await conn.execute('SELECT COUNT(*) as n FROM clients');
  const [campaignCount]= await conn.execute('SELECT COUNT(*) as n FROM campaigns');

  await conn.end();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║            ✅ SETUP COMPLETADO               ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Usuarios:  ${String(userCount[0].n).padEnd(34)}║`);
  console.log(`║  Clientes:  ${String(clientCount[0].n).padEnd(34)}║`);
  console.log(`║  Campañas:  ${String(campaignCount[0].n).padEnd(34)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  CREDENCIALES DE ACCESO                      ║');
  console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(35)}║`);
  console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(35)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n🚀 Siguiente paso: vercel --prod --yes\n');
}

run();
