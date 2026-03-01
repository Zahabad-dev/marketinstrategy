import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientModel } from '@/models'
import { 
  requireAuth,
  createClientSchema,
  paginationSchema,
  validate,
  getAccessibleClientFilter,
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

    if (req.method === 'GET') {
      // List clients with pagination and filters
      const validatedPagination = validate(paginationSchema, req.query)
      const pagination = {
        page: validatedPagination.page ?? 1,
        perPage: validatedPagination.perPage ?? 20,
      }
      
      const filters = {
        search: req.query.search as string | undefined,
        ...getAccessibleClientFilter(payload.rol, payload.userId)
      }
      
      const [clients, total] = await Promise.all([
        ClientModel.list(filters, pagination),
        ClientModel.count(filters)
      ])
      
      return ApiResponse.success(res, {
        data: clients,
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(total / pagination.perPage)
      })
    }

    if (req.method === 'POST') {
      // Create client
      const data = validate(createClientSchema, req.body)
      
      const client = await ClientModel.create(data)
      return ApiResponse.success(res, client, 201)
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
    
    console.error('Clients API error:', error)
    return ApiResponse.serverError(res)
  }
}
