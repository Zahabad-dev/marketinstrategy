const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const id = crypto.randomUUID();
const hash = bcrypt.hashSync('admin123', 10);

const sql = `INSERT INTO users (id, nombre, email, password, rol, created_at, updated_at) 
VALUES ('${id}', 'Admin Principal', 'admin@marketinstrategy.com', '${hash}', 'ADMIN', NOW(), NOW());`;

console.log('\n=== COPIA Y EJECUTA ESTE SQL EN RAILWAY ===\n');
console.log(sql);
console.log('\n=== CREDENCIALES DE LOGIN ===');
console.log('Email: admin@marketinstrategy.com');
console.log('Password: admin123');
console.log('\n');
