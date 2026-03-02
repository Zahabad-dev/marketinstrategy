const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection('mysql://marketuser:marketpass@localhost:3306/marketing_saas');
  await c.execute(`CREATE TABLE IF NOT EXISTS contenidos_calendarizados (
    id VARCHAR(36) PRIMARY KEY,
    campana_id VARCHAR(36) NOT NULL,
    fecha DATE NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    tipo ENUM('VIDEO_LINK','VIDEO_FILE','IMAGEN','PDF') NOT NULL,
    url_referencia VARCHAR(500),
    archivo_local VARCHAR(500),
    estado ENUM('PENDIENTE','EN_REVISION','APROBADO','PUBLICADO','RECHAZADO') DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campana_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campana_id (campana_id),
    INDEX idx_fecha (fecha)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [rows] = await c.query("SHOW TABLES LIKE 'contenidos_calendarizados'");
  console.log('Table exists:', rows.length > 0 ? 'YES' : 'NO');
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1) });
