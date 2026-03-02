const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createAdmin() {
  console.log('\n🔧 Creando usuario administrador...\n');

  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'marketuser',
      password: 'marketpass',
      database: 'marketing_saas'
    });

    console.log('✅ Conectado a la base de datos');

    // Generar ID y hash de contraseña
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash('admin123', 10);

    // Verificar si ya existe un admin
    const [existingAdmins] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR rol = ?',
      ['admin@marketinstrategy.com', 'ADMIN']
    );

    if (existingAdmins.length > 0) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log('   Email:', existingAdmins[0].email);
      console.log('   Rol:', existingAdmins[0].rol);
      console.log('\n💡 Si olvidaste la contraseña, elimina el usuario de la BD y ejecuta este script nuevamente.');
      await connection.end();
      return;
    }

    // Insertar admin
    await connection.execute(
      `INSERT INTO users (id, nombre, email, password, rol, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, 'Admin Principal', 'admin@marketinstrategy.com', hash, 'ADMIN']
    );

    console.log('\n✅ Usuario administrador creado exitosamente!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@marketinstrategy.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Rol:      ADMIN');
    console.log('═══════════════════════════════════════\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
