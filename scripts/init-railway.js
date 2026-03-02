// Script para inicializar Railway Database
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'mysql://root:ypSkugjCaCdkjtDbUYDGdpFiVBxiGrvS@nozomi.proxy.rlwy.net:37955/railway';

async function initDatabase() {
  console.log('🚂 Conectando a Railway MySQL...');
  
  try {
    const connection = await mysql.createConnection({
      uri: DATABASE_URL,
      multipleStatements: true
    });
    console.log('✅ Conectado exitosamente!\n');

    console.log('📄 Leyendo railway-schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'database', 'railway-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📊 Ejecutando schema completo...\n');

    // Ejecutar todo el schema de una vez (multipleStatements)
    await connection.query({ sql: schema, multipleStatements: true });

    console.log('✅ Schema ejecutado correctamente!');

    console.log('\n🔍 Verificando tablas creadas...');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\n📋 Tablas en la base de datos:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✅ ${tableName}`);
    });

    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('\n📌 Siguiente paso:');
    console.log('   Ve a https://vercel.com/new y deploya tu proyecto');
    console.log('   Usa esta URL como DATABASE_URL en Vercel:\n');
    console.log(`   ${DATABASE_URL}\n`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
