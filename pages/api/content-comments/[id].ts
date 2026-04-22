import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, ApiResponse } from '@/lib'
import { getPool } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await requireAuth(req, res)
    if (!payload) return

    const { id } = req.query
    const pool = getPool()

    if (req.method === 'DELETE') {
      // Only ADMIN can delete, or the author
      const commentRes = await pool.query('SELECT * FROM content_comments WHERE id = $1', [id])
      const comment = commentRes.rows[0]
      if (!comment) return res.status(404).json({ success: false, error: 'Comentario no encontrado' })

      if (payload.rol !== 'ADMIN' && comment.user_id !== payload.userId) {
        return res.status(403).json({ success: false, error: 'Sin permiso para eliminar este mensaje' })
      }

      await pool.query('DELETE FROM content_comments WHERE id = $1', [id])
      return ApiResponse.success(res, { message: 'Mensaje eliminado' })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    console.error('content-comments/[id] API error:', error)
    return ApiResponse.serverError(res)
  }
}
