import type { NextApiRequest, NextApiResponse } from 'next'
import { CampaignModel } from '@/models'
import { 
  requireAuth,
  updateCampaignSchema,
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
      const campaign = await CampaignModel.findById(id as string)
      if (!campaign) {
        return ApiResponse.notFound(res, 'Campaña no encontrada')
      }
      
      return ApiResponse.success(res, campaign)
    }

    if (req.method === 'PUT') {
      const campaign = await CampaignModel.findById(id as string)
      if (!campaign) {
        return ApiResponse.notFound(res, 'Campaña no encontrada')
      }
      
      // Only admins and editors can modify campaigns
      if (!isEditorOrAdmin(payload.rol)) {
        return ApiResponse.forbidden(res)
      }
      
      const data = validate(updateCampaignSchema, req.body)
      const updated = await CampaignModel.update(id as string, data)
      
      return ApiResponse.success(res, updated)
    }

    if (req.method === 'DELETE') {
      const campaign = await CampaignModel.findById(id as string)
      if (!campaign) {
        return ApiResponse.notFound(res, 'Campaña no encontrada')
      }
      
      // Only admins and editors can delete campaigns
      if (!isEditorOrAdmin(payload.rol)) {
        return ApiResponse.forbidden(res)
      }
      
      await CampaignModel.delete(id as string)
      return ApiResponse.success(res, { message: 'Campaña eliminada' })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
    }
    
    console.error('Campaign API error:', error)
    return ApiResponse.serverError(res)
  }
}
