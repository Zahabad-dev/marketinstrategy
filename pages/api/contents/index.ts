import type { NextApiRequest, NextApiResponse } from 'next'
import { ContentModel } from '@/models'
import { 
  requireAuth,
  createContentSchema,
  paginationSchema,
  validate,
  ApiResponse
} from '@/lib'
import { ZodError } from 'zod'
import { ContentType, ContentStatus } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const payload = await requireAuth(req, res)
    if (!payload) return

    if (req.method === 'GET') {
      const validatedPagination = validate(paginationSchema, req.query)
      const pagination = {
        page: validatedPagination.page ?? 1,
        perPage: validatedPagination.perPage ?? 20,
      }
      
      const filters = {
        campañaId: req.query.campañaId as string | undefined,
        estado: req.query.estado as ContentStatus | undefined,
        tipo: req.query.tipo as ContentType | undefined,
      }
      
      const [contents, total] = await Promise.all([
        ContentModel.list(filters, pagination),
        ContentModel.count(filters)
      ])
      
      return ApiResponse.success(res, {
        data: contents,
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(total / pagination.perPage)
      })
    }

    if (req.method === 'POST') {
      const data = validate(createContentSchema, req.body)
      
      const content = await ContentModel.create(data)
      return ApiResponse.success(res, content, 201)
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Contents API error:', error)
    return ApiResponse.serverError(res)
  }
}
