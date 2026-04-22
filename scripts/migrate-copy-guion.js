/**
 * Migration: Add copy and guion columns to contenidos_calendarizados
 * Usage: node scripts/migrate-copy-guion.js
 * Requires DATABASE_URL in environment or .env.local
 */

try { require('dotenv').config({ path: '.env.local' }); } catch (_) {}
const { Pool } = require('pg');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Falta DATABASE_URL');
  console.error('Uso: node scripts/migrate-copy-guion.js "postgresql://..."');
  process.exit(1);
}

async function run() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('🔗 Conectando a la base de datos...');

  try {
    await pool.query(`
      ALTER TABLE contenidos_calendarizados
        ADD COLUMN IF NOT EXISTS copy TEXT,
        ADD COLUMN IF NOT EXISTS copy_v2 TEXT,
        ADD COLUMN IF NOT EXISTS guion TEXT,
        ADD COLUMN IF NOT EXISTS guion_v2 TEXT;
    `);
    console.log('✅ Columnas copy, copy_v2, guion, guion_v2 agregadas correctamente.');
  } catch (err) {
    console.error('❌ Error en la migración:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
