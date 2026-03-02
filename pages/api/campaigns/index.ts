import type { NextApiRequest, NextApiResponse } from 'next'
import { CampaignModel, ClientModel } from '@/models'
import { 
  requireAuth,
  createCampaignSchema,
  paginationSchema,
  validate,
  ApiResponse
} from '@/lib'
import { ZodError } from 'zod'
import { CampaignStatus } from '@/types'

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
      
      const filters: any = {
        clienteId: req.query.clienteId as string | undefined,
        estado: req.query.estado as CampaignStatus | undefined,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        anio: req.query.año ? parseInt(req.query.año as string) : undefined,
      }

      // CLIENT role: restrict to their own campaigns
      if (payload.rol === 'CLIENT') {
        const clientProfiles = await ClientModel.findByUsuarioId(payload.userId)
        if (clientProfiles.length === 0) {
          return ApiResponse.success(res, { data: [], total: 0, page: 1, perPage: pagination.perPage, totalPages: 0 })
        }
        filters.clienteId = clientProfiles[0].id
      }
      
      const [campaigns, total] = await Promise.all([
        CampaignModel.list(filters, pagination),
        CampaignModel.count(filters)
      ])
      
      return ApiResponse.success(res, {
        data: campaigns,
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(total / pagination.perPage)
      })
    }

    if (req.method === 'POST') {
      const data = validate(createCampaignSchema, req.body)
      
      const campaign = await CampaignModel.create(data)
      return ApiResponse.success(res, campaign, 201)
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
    
    console.error('Campaigns API error:', error)
    return ApiResponse.serverError(res)
  }
}
