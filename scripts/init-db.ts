/**
 * Database initialization script
 * Run this to create all tables
 */

import { db, initializeDatabase } from '@/lib/db'

async function main() {
  console.log('🚀 Inicializando base de datos...\n')

  try {
    // Test connection
    await db.execute('SELECT 1')
    console.log('✅ Conexión a la base de datos exitosa')

    // Create tables
    await initializeDatabase()
    console.log('✅ Tablas creadas correctamente')

    // Close connection
    await db.close()
    console.log('\n✅ Inicialización completada')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error)
    process.exit(1)
  }
}

main()
