import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyRefreshToken, generateAccessToken } from '@/lib'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      })
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido o expirado'
      })
    }
    
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      rol: payload.rol,
    })
    
    return res.status(200).json({
      success: true,
      data: { accessToken }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al refrescar token'
    })
  }
}
