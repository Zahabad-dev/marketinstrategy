import { User, UserCreateInput, UserUpdateInput, UserRole } from '@/types'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { RowDataPacket } from 'mysql2'

export class UserModel {
  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ?'
    const [rows] = await db.execute(query, [id])
    const users = rows as User[]
    return users[0] || null
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ?'
    const [rows] = await db.execute(query, [email])
    const users = rows as User[]
    return users[0] || null
  }

  /**
   * Create a new user
   */
  static async create(data: UserCreateInput): Promise<User> {
    const id = uuidv4()
    const hashedPassword = await hashPassword(data.password!)
    
    // Asegurar que rol sea CLIENT si no se especifica
    const rol = data.rol !== undefined && data.rol !== null ? data.rol : UserRole.CLIENT
    
    const query = `
      INSERT INTO users (id, nombre, email, password, rol)
      VALUES (?, ?, ?, ?, ?)
    `
    
    await db.execute(query, [
      id,
      data.nombre,
      data.email,
      hashedPassword,
      rol,
    ])

    return this.findById(id) as Promise<User>
  }

  /**
   * Update user
   */
  static async update(id: string, data: UserUpdateInput): Promise<User | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.nombre !== undefined) {
      updates.push('nombre = ?')
      values.push(data.nombre)
    }
    if (data.rol !== undefined) {
      updates.push('rol = ?')
      values.push(data.rol)
    }

    if (updates.length === 0) {
      return this.findById(id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    await db.execute(query, values)

    return this.findById(id)
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = ?'
    const [result] = await db.execute(query, [id])
    return (result as any).affectedRows > 0
  }

  /**
   * List users with filters
   */
  static async list(filters?: { rol?: UserRole; search?: string }, pagination?: { page: number; perPage: number }): Promise<User[]> {
    let query = 'SELECT id, nombre, email, rol, created_at, updated_at FROM users WHERE 1=1'
    const values: any[] = []

    if (filters?.rol) {
      query += ' AND rol = ?'
      values.push(filters.rol)
    }

    if (filters?.search) {
      query += ' AND (nombre LIKE ? OR email LIKE ?)'
      const searchTerm = `%${filters.search}%`
      values.push(searchTerm, searchTerm)
    }

    query += ' ORDER BY created_at DESC'

    if (pagination?.perPage) {
      const offset = ((pagination.page || 1) - 1) * pagination.perPage
      query += ' LIMIT ? OFFSET ?'
      values.push(pagination.perPage, offset)
    }

    const [rows] = await db.execute(query, values)
    return rows as User[]
  }

  /**
   * Count users
   */
  static async count(filters?: { rol?: UserRole; search?: string }): Promise<number> {
    let query = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
    const values: any[] = []

    if (filters?.rol) {
      query += ' AND rol = ?'
      values.push(filters.rol)
    }

    if (filters?.search) {
      query += ' AND (nombre LIKE ? OR email LIKE ?)'
      const searchTerm = `%${filters.search}%`
      values.push(searchTerm, searchTerm)
    }

    const [rows] = await db.execute(query, values) as RowDataPacket[][]
    return rows[0].total
  }
}
