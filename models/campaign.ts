import { Campaign, CampaignCreateInput, CampaignUpdateInput, CampaignStatus } from '@/types'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { RowDataPacket } from 'mysql2'

export class CampaignModel {
  /**
   * Find campaign by ID
   */
  static async findById(id: string): Promise<Campaign | null> {
    const query = 'SELECT * FROM campaigns WHERE id = ?'
    const [rows] = await db.execute(query, [id])
    const campaigns = rows as Campaign[]
    return campaigns[0] || null
  }

  /**
   * Find campaigns by client ID
   */
  static async findByClienteId(clienteId: string): Promise<Campaign[]> {
    const query = 'SELECT * FROM campaigns WHERE cliente_id = ? ORDER BY anio DESC, mes DESC'
    const [rows] = await db.execute(query, [clienteId])
    return rows as Campaign[]
  }

  /**
   * Find campaign by client, month and year
   */
  static async findByClienteMesAnio(clienteId: string, mes: number, anio: number): Promise<Campaign | null> {
    const query = 'SELECT * FROM campaigns WHERE cliente_id = ? AND mes = ? AND anio = ?'
    const [rows] = await db.execute(query, [clienteId, mes, anio])
    const campaigns = rows as Campaign[]
    return campaigns[0] || null
  }

  /**
   * Create a new campaign
   */
  static async create(data: CampaignCreateInput): Promise<Campaign> {
    const id = uuidv4()
    
    const query = `
      INSERT INTO campaigns (id, cliente_id, mes, anio, objetivo_general, estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    await db.execute(query, [
      id,
      data.clienteId,
      data.mes,
      data.anio,
      data.objetivoGeneral,
      data.estado || CampaignStatus.PLANIFICADA,
    ])

    return this.findById(id) as Promise<Campaign>
  }

  /**
   * Update campaign
   */
  static async update(id: string, data: CampaignUpdateInput): Promise<Campaign | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.mes !== undefined) {
      updates.push('mes = ?')
      values.push(data.mes)
    }
    if (data.anio !== undefined) {
      updates.push('anio = ?')
      values.push(data.anio)
    }
    if (data.objetivoGeneral !== undefined) {
      updates.push('objetivo_general = ?')
      values.push(data.objetivoGeneral)
    }
    if (data.estado !== undefined) {
      updates.push('estado = ?')
      values.push(data.estado)
    }

    if (updates.length === 0) {
      return this.findById(id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const query = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`
    await db.execute(query, values)

    return this.findById(id)
  }

  /**
   * Delete campaign
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM campaigns WHERE id = ?'
    const [result] = await db.execute(query, [id])
    return (result as any).affectedRows > 0
  }

  /**
   * List campaigns with filters
   */
  static async list(
    filters?: { clienteId?: string; estado?: CampaignStatus; anio?: number; mes?: number }, 
    pagination?: { page: number; perPage: number }
  ): Promise<Campaign[]> {
    let query = 'SELECT * FROM campaigns WHERE 1=1'
    const values: any[] = []

    if (filters?.clienteId) {
      query += ' AND cliente_id = ?'
      values.push(filters.clienteId)
    }

    if (filters?.estado) {
      query += ' AND estado = ?'
      values.push(filters.estado)
    }

    if (filters?.anio) {
      query += ' AND anio = ?'
      values.push(filters.anio)
    }

    if (filters?.mes) {
      query += ' AND mes = ?'
      values.push(filters.mes)
    }

    query += ' ORDER BY anio DESC, mes DESC'

    if (pagination?.perPage) {
      const offset = ((pagination.page || 1) - 1) * pagination.perPage
      query += ` LIMIT ${parseInt(String(pagination.perPage))} OFFSET ${parseInt(String(offset))}`
    }

    const [rows] = await db.execute(query, values)
    return rows as Campaign[]
  }

  /**
   * Count campaigns
   */
  static async count(filters?: { clienteId?: string; estado?: CampaignStatus; anio?: number }): Promise<number> {
    let query = 'SELECT COUNT(*) as total FROM campaigns WHERE 1=1'
    const values: any[] = []

    if (filters?.clienteId) {
      query += ' AND cliente_id = ?'
      values.push(filters.clienteId)
    }

    if (filters?.estado) {
      query += ' AND estado = ?'
      values.push(filters.estado)
    }

    if (filters?.anio) {
      query += ' AND anio = ?'
      values.push(filters.anio)
    }

    const [rows] = await db.execute(query, values) as RowDataPacket[][]
    return rows[0].total
  }

  /**
   * Get campaigns by year and month range (for calendar view)
   */
  static async getByYearMonth(anio: number, mes: number): Promise<Campaign[]> {
    const query = `
      SELECT * FROM campaigns 
      WHERE anio = ? AND mes = ?
      ORDER BY cliente_id
    `
    
    const [rows] = await db.execute(query, [anio, mes])
    return rows as Campaign[]
  }
}
