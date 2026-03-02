import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientModel } from '@/models'
import { 
  requireAuth,
  updateClientSchema,
  validate,
  canModifyResource,
  canDeleteResource,
  ApiResponse
} from '@/lib'
import { ZodError } from 'zod'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const payload = await requireAuth(req, res)
    if (!payload) return
    
    const { id } = req.query

    if (req.method === 'GET') {
      const client = await ClientModel.findById(id as string)
      if (!client) {
        return ApiResponse.notFound(res, 'Cliente no encontrado')
      }
      
      return ApiResponse.success(res, client)
    }

    if (req.method === 'PUT') {
      const client = await ClientModel.findById(id as string)
      if (!client) {
        return ApiResponse.notFound(res, 'Cliente no encontrado')
      }
      
      if (!canModifyResource(payload.rol, payload.userId, client.usuarioId ?? '')) {
        return ApiResponse.forbidden(res)
      }
      
      const data = validate(updateClientSchema, req.body)
      const updated = await ClientModel.update(id as string, data)
      
      return ApiResponse.success(res, updated)
    }

    if (req.method === 'DELETE') {
      const client = await ClientModel.findById(id as string)
      if (!client) {
        return ApiResponse.notFound(res, 'Cliente no encontrado')
      }
      
      if (!canDeleteResource(payload.rol, payload.userId, client.usuarioId ?? '')) {
        return ApiResponse.forbidden(res)
      }
      
      await ClientModel.delete(id as string)
      return ApiResponse.success(res, { message: 'Cliente eliminado' })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
    }
    
    console.error('Client API error:', error)
    return ApiResponse.serverError(res)
  }
}
