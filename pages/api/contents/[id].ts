import type { NextApiRequest, NextApiResponse } from 'next'
import { ContentModel } from '@/models'
import { 
  requireAuth,
  updateContentSchema,
  validate,
  isEditorOrAdmin,
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
      const content = await ContentModel.findById(id as string)
      if (!content) {
        return ApiResponse.notFound(res, 'Contenido no encontrado')
      }
      
      return ApiResponse.success(res, content)
    }

    if (req.method === 'PUT') {
      const content = await ContentModel.findById(id as string)
      if (!content) {
        return ApiResponse.notFound(res, 'Contenido no encontrado')
      }
      
      // Only admins and editors can modify content
      if (!isEditorOrAdmin(payload.rol)) {
        return ApiResponse.forbidden(res)
      }
      
      const data = validate(updateContentSchema, req.body)
      const updated = await ContentModel.update(id as string, data)
      
      return ApiResponse.success(res, updated)
    }

    if (req.method === 'DELETE') {
      const content = await ContentModel.findById(id as string)
      if (!content) {
        return ApiResponse.notFound(res, 'Contenido no encontrado')
      }
      
      // Only admins and editors can delete content
      if (!isEditorOrAdmin(payload.rol)) {
        return ApiResponse.forbidden(res)
      }
      
      await ContentModel.delete(id as string)
      return ApiResponse.success(res, { message: 'Contenido eliminado' })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
    }
    
    console.error('Content API error:', error)
    return ApiResponse.serverError(res)
  }
}
