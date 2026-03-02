import type { NextApiRequest, NextApiResponse } from 'next'
import { CampaignModel } from '@/models'
import { extractTokenFromHeader, verifyAccessToken } from '@/lib'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = extractTokenFromHeader(req.headers.authorization as string)
    if (!token) {
      return res.status(401).json({ success: false, error: 'No autorizado' })
    }
    
    const payload = verifyAccessToken(token)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Token inválido' })
    }
    
    // Get year and month from query
    const anio = parseInt(req.query.año as string) || new Date().getFullYear()
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1
    
    // Get campaigns for this month/year
    const campaigns = await CampaignModel.getByYearMonth(anio, mes)
    
    return res.status(200).json({
      success: true,
      data: {
        anio,
        mes,
        campaigns
      }
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return res.status(500).json({ success: false, error: 'Error en la API' })
  }
}
