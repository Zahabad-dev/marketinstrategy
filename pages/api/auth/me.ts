import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { extractTokenFromHeader, verifyAccessToken } from '@/lib'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract and verify token
    const token = extractTokenFromHeader(req.headers.authorization as string)
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      })
    }
    
    const payload = verifyAccessToken(token)
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }
    
    // Get user
    const user = await UserModel.findById(payload.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }
    
    // Remove password
    const { password, ...userWithoutPassword } = user
    
    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    })
  }
}
