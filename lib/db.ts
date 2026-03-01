import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

/**
 * Get or create MySQL connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  
  return pool
}

/**
 * Database connection object
 */
export const db = {
  async execute(query: string, params?: any[]) {
    const pool = getPool()
    return await pool.execute(query, params)
  },
  
  async query(query: string, params?: any[]) {
    const pool = getPool()
    return await pool.query(query, params)
  },
  
  async getConnection() {
    const pool = getPool()
    return await pool.getConnection()
  },
  
  async transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
    const connection = await this.getConnection()
    
    try {
      await connection.beginTransaction()
      const result = await callback(connection)
      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },
  
  async close() {
    if (pool) {
      await pool.end()
      pool = null
    }
  }
}

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  const { AllSchemas } = await import('@/models/schema')
  
  for (const schema of AllSchemas) {
    await db.execute(schema)
  }
  
  console.log('✅ Database tables initialized')
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await db.execute('SELECT 1')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
