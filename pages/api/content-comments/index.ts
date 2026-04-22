import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, ApiResponse } from '@/lib'
import { getPool } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await requireAuth(req, res)
    if (!payload) return

    const pool = getPool()

    if (req.method === 'GET') {
      const { contentId } = req.query
      if (!contentId) return res.status(400).json({ success: false, error: 'contentId requerido' })

      const result = await pool.query(
        `SELECT * FROM content_comments WHERE content_id = $1 ORDER BY created_at ASC`,
        [contentId]
      )
      return ApiResponse.success(res, result.rows)
    }

    if (req.method === 'POST') {
      // Only ADMIN or EDITOR can post
      if (payload.rol === 'CLIENT') {
        return res.status(403).json({ success: false, error: 'Solo admins y editores pueden escribir mensajes' })
      }

      const { contentId, message, linkUrl } = req.body
      if (!contentId || !message?.trim()) {
        return res.status(400).json({ success: false, error: 'contentId y message son requeridos' })
      }

      // Fetch user name
      const userRes = await pool.query('SELECT nombre, rol FROM users WHERE id = $1', [payload.userId])
      const user = userRes.rows[0]
      if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' })

      const result = await pool.query(
        `INSERT INTO content_comments (content_id, user_id, user_nombre, user_rol, message, link_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [contentId, payload.userId, user.nombre, user.rol, message.trim(), linkUrl?.trim() || null]
      )
      return ApiResponse.success(res, result.rows[0], 201)
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    console.error('content-comments API error:', error)
    return ApiResponse.serverError(res)
  }
}
