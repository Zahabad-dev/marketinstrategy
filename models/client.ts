import { Client, ClientCreateInput, ClientUpdateInput } from '@/types'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'


export class ClientModel {
  /**
   * Find client by ID
   */
  static async findById(id: string): Promise<Client | null> {
    const query = 'SELECT * FROM clients WHERE id = ?'
    const [rows] = await db.execute(query, [id])
    const clients = rows as Client[]
    return clients[0] || null
  }

  /**
   * Find clients by user ID
   */
  static async findByUsuarioId(usuarioId: string): Promise<Client[]> {
    const query = 'SELECT * FROM clients WHERE usuario_id = ? ORDER BY created_at DESC'
    const [rows] = await db.execute(query, [usuarioId])
    return rows as Client[]
  }

  /**
   * Create a new client
   */
  static async create(data: ClientCreateInput): Promise<Client> {
    const id = uuidv4()
    
    const query = `
      INSERT INTO clients (id, nombre_empresa, contacto, usuario_id)
      VALUES (?, ?, ?, ?)
    `
    
    await db.execute(query, [
      id,
      data.nombreEmpresa,
      data.contacto,
      data.usuarioId || null,
    ])

    return this.findById(id) as Promise<Client>
  }

  /**
   * Update client
   */
  static async update(id: string, data: ClientUpdateInput): Promise<Client | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.nombreEmpresa !== undefined) {
      updates.push('nombre_empresa = ?')
      values.push(data.nombreEmpresa)
    }
    if (data.contacto !== undefined) {
      updates.push('contacto = ?')
      values.push(data.contacto)
    }

    if (updates.length === 0) {
      return this.findById(id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`
    await db.execute(query, values)

    return this.findById(id)
  }

  /**
   * Delete client
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM clients WHERE id = ?'
    const [result] = await db.execute(query, [id])
    return (result as any).affectedRows > 0 || (result as any).rowCount > 0
  }

  /**
   * List clients with filters
   */
  static async list(
    filters?: { usuarioId?: string; search?: string }, 
    pagination?: { page: number; perPage: number }
  ): Promise<Client[]> {
    let query = 'SELECT clients.*, users.email as usuario_email, users.nombre as usuario_nombre FROM clients LEFT JOIN users ON clients.usuario_id = users.id WHERE 1=1'
    const values: any[] = []

    if (filters?.usuarioId) {
      query += ' AND usuario_id = ?'
      values.push(filters.usuarioId)
    }

    if (filters?.search) {
      query += ' AND (nombre_empresa LIKE ? OR contacto LIKE ?)'
      const searchTerm = `%${filters.search}%`
      values.push(searchTerm, searchTerm)
    }

    query += ' ORDER BY created_at DESC'

    if (pagination?.perPage) {
      const offset = ((pagination.page || 1) - 1) * pagination.perPage
      query += ` LIMIT ${parseInt(String(pagination.perPage))} OFFSET ${parseInt(String(offset))}`
    }

    const [rows] = await db.execute(query, values)
    return rows as Client[]
  }

  /**
   * Count clients
   */
  static async count(filters?: { usuarioId?: string; search?: string }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM clients WHERE 1=1'
    const values: any[] = []

    if (filters?.usuarioId) {
      query += ' AND usuario_id = ?'
      values.push(filters.usuarioId)
    }

    if (filters?.search) {
      query += ' AND (nombre_empresa LIKE ? OR contacto LIKE ?)'
      const searchTerm = `%${filters.search}%`
      values.push(searchTerm, searchTerm)
    }

    const [rows] = await db.execute(query, values)
    return parseInt(rows[0].count ?? rows[0].total ?? 0)
  }
}
