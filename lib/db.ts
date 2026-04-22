import { Pool } from 'pg'

let pool: Pool | null = null

/**
 * Get or create PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

/**
 * Convert MySQL-style ? placeholders to PostgreSQL $1, $2, ...
 */
function toPostgresQuery(query: string): string {
  let i = 0
  return query.replace(/\?/g, () => `$${++i}`)
}

const SELECT_RE = /^\s*(SELECT|WITH|SHOW|EXPLAIN)/i

/**
 * Database connection object (mysql2-compatible interface)
 */
export const db = {
  async execute(query: string, params?: any[]): Promise<[any[], any]> {
    const pgPool = getPool()
    const pgQuery = toPostgresQuery(query)
    const result = await pgPool.query(pgQuery, params)
    if (SELECT_RE.test(query)) {
      return [result.rows, result.fields ?? []]
    }
    return [{ affectedRows: result.rowCount ?? 0 } as any, []]
  },

  async query(query: string, params?: any[]): Promise<[any[], any]> {
    return this.execute(query, params)
  },

  async transaction(callback: (client: any) => Promise<any>) {
    const pgPool = getPool()
    const client = await pgPool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
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
