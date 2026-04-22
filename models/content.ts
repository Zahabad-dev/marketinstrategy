import { ContenidoCalendarizado, ContenidoCalendarizadoCreateInput, ContenidoCalendarizadoUpdateInput, ContentType, ContentStatus } from '@/types'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'


export class ContentModel {
  /**
   * Find content by ID
   */
  static async findById(id: string): Promise<ContenidoCalendarizado | null> {
    const query = 'SELECT * FROM contenidos_calendarizados WHERE id = ?'
    const [rows] = await db.execute(query, [id])
    const contents = rows as ContenidoCalendarizado[]
    return contents[0] || null
  }

  /**
   * Find contents by campaign ID
   */
  static async findByCampanaId(campanaId: string): Promise<ContenidoCalendarizado[]> {
    const query = 'SELECT * FROM contenidos_calendarizados WHERE campana_id = ? ORDER BY fecha ASC'
    const [rows] = await db.execute(query, [campanaId])
    return rows as ContenidoCalendarizado[]
  }

  /**
   * Create a new content
   */
  static async create(data: ContenidoCalendarizadoCreateInput): Promise<ContenidoCalendarizado> {
    const id = uuidv4()
    
    // Convert fecha to Date if it's a string
    const fecha = typeof data.fecha === 'string' ? new Date(data.fecha) : data.fecha
    
    const query = `
      INSERT INTO contenidos_calendarizados 
      (id, campana_id, fecha, titulo, descripcion, tipo, url_referencia, archivo_local, estado, copy, copy_v2, guion, guion_v2)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    await db.execute(query, [
      id,
      data.campanaId,
      fecha,
      data.titulo,
      data.descripcion || null,
      data.tipo,
      data.urlReferencia || null,
      data.archivoLocal || null,
      data.estado || ContentStatus.PENDIENTE,
      data.copy || null,
      data.copyV2 || null,
      data.guion || null,
      data.guionV2 || null,
    ])

    return this.findById(id) as Promise<ContenidoCalendarizado>
  }

  /**
   * Update content
   */
  static async update(id: string, data: ContenidoCalendarizadoUpdateInput): Promise<ContenidoCalendarizado | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.fecha !== undefined) {
      updates.push('fecha = ?')
      const fecha = typeof data.fecha === 'string' ? new Date(data.fecha) : data.fecha
      values.push(fecha)
    }
    if (data.titulo !== undefined) {
      updates.push('titulo = ?')
      values.push(data.titulo)
    }
    if (data.descripcion !== undefined) {
      updates.push('descripcion = ?')
      values.push(data.descripcion)
    }
    if (data.tipo !== undefined) {
      updates.push('tipo = ?')
      values.push(data.tipo)
    }
    if (data.urlReferencia !== undefined) {
      updates.push('url_referencia = ?')
      values.push(data.urlReferencia)
    }
    if (data.archivoLocal !== undefined) {
      updates.push('archivo_local = ?')
      values.push(data.archivoLocal)
    }
    if (data.estado !== undefined) {
      updates.push('estado = ?')
      values.push(data.estado)
    }
    if (data.copy !== undefined) {
      updates.push('copy = ?')
      values.push(data.copy)
    }
    if (data.copyV2 !== undefined) {
      updates.push('copy_v2 = ?')
      values.push(data.copyV2)
    }
    if (data.guion !== undefined) {
      updates.push('guion = ?')
      values.push(data.guion)
    }
    if (data.guionV2 !== undefined) {
      updates.push('guion_v2 = ?')
      values.push(data.guionV2)
    }

    if (updates.length === 0) {
      return this.findById(id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const query = `UPDATE contenidos_calendarizados SET ${updates.join(', ')} WHERE id = ?`
    await db.execute(query, values)

    return this.findById(id)
  }

  /**
   * Delete content
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM contenidos_calendarizados WHERE id = ?'
    const [result] = await db.execute(query, [id])
    return (result as any).affectedRows > 0 || (result as any).rowCount > 0
  }

  /**
   * List contents with filters
   */
  static async list(
    filters?: { campanaId?: string; tipo?: ContentType; estado?: ContentStatus; fechaInicio?: Date; fechaFin?: Date }, 
    pagination?: { page: number; perPage: number }
  ): Promise<ContenidoCalendarizado[]> {
    let query = 'SELECT * FROM contenidos_calendarizados WHERE 1=1'
    const values: any[] = []

    if (filters?.campanaId) {
      query += ' AND campana_id = ?'
      values.push(filters.campanaId)
    }

    if (filters?.tipo) {
      query += ' AND tipo = ?'
      values.push(filters.tipo)
    }

    if (filters?.estado) {
      query += ' AND estado = ?'
      values.push(filters.estado)
    }

    if (filters?.fechaInicio) {
      query += ' AND fecha >= ?'
      values.push(filters.fechaInicio)
    }

    if (filters?.fechaFin) {
      query += ' AND fecha <= ?'
      values.push(filters.fechaFin)
    }

    query += ' ORDER BY fecha ASC'

    if (pagination?.perPage) {
      const offset = ((pagination.page || 1) - 1) * pagination.perPage
      query += ` LIMIT ${parseInt(String(pagination.perPage))} OFFSET ${parseInt(String(offset))}`
    }

    const [rows] = await db.execute(query, values)
    return rows as ContenidoCalendarizado[]
  }

  /**
   * Count contents
   */
  static async count(filters?: { campanaId?: string; tipo?: ContentType; estado?: ContentStatus }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM contenidos_calendarizados WHERE 1=1'
    const values: any[] = []

    if (filters?.campanaId) {
      query += ' AND campana_id = ?'
      values.push(filters.campanaId)
    }

    if (filters?.tipo) {
      query += ' AND tipo = ?'
      values.push(filters.tipo)
    }

    if (filters?.estado) {
      query += ' AND estado = ?'
      values.push(filters.estado)
    }

    const [rows] = await db.execute(query, values)
    return parseInt(rows[0].count ?? rows[0].total ?? 0)
  }

  /**
   * Get contents by date range (for calendar view)
   */
  static async getByDateRange(startDate: Date, endDate: Date): Promise<ContenidoCalendarizado[]> {
    const query = `
      SELECT * FROM contenidos_calendarizados 
      WHERE fecha BETWEEN ? AND ?
      ORDER BY fecha ASC
    `
    
    const [rows] = await db.execute(query, [startDate, endDate])
    return rows as ContenidoCalendarizado[]
  }
}
