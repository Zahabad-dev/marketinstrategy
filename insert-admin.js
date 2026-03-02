const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection('mysql://root:ypSkugjCaCdkjtDbUYDGdpFiVBxiGrvS@nozomi.proxy.rlwy.net:37955/railway');
  
  try {
    const sql = `INSERT INTO users (id, nombre, email, password, rol, created_at, updated_at) 
    VALUES ('af678068-c73f-4b29-bfcb-d775a7425469', 'Admin Principal', 'admin@marketinstrategy.com', '$2a$10$.wrqmIEucLGAkxK/GFxgb.EbdmwSMyDP2iY7UuYS.TT6cu9Mpv6RK', 'ADMIN', NOW(), NOW())`;
    
    await connection.execute(sql);
    console.log('✅ Usuario admin creado exitosamente');
    console.log('\n📧 Email: admin@marketinstrategy.com');
    console.log('🔑 Password: admin123\n');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Usuario admin ya existe');
      console.log('\n📧 Email: admin@marketinstrategy.com');
      console.log('🔑 Password: admin123\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

createAdmin();
