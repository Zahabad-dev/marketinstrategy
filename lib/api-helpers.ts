import type { NextApiRequest, NextApiResponse } from 'next'
import { extractTokenFromHeader, verifyAccessToken } from './auth'
import { JWTPayload } from '@/types'

/**
 * Extract and verify JWT from request
 * Returns payload or sends error response
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<JWTPayload | null> {
  const token = extractTokenFromHeader(req.headers.authorization as string)
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'No autorizado - Token no proporcionado'
    })
    return null
  }
  
  const payload = verifyAccessToken(token)
  
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    })
    return null
  }
  
  return payload
}

/**
 * Require specific role for access
 */
export async function requireRole(
  req: NextApiRequest,
  res: NextApiResponse,
  requiredRole: string | string[]
): Promise<JWTPayload | null> {
  const payload = await requireAuth(req, res)
  
  if (!payload) {
    return null
  }
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(payload.rol)) {
    res.status(403).json({
      success: false,
      error: 'Permisos insuficientes'
    })
    return null
  }
  
  return payload
}

/**
 * API Response helpers
 */
export const ApiResponse = {
  success: (res: NextApiResponse, data: any, status = 200) => {
    return res.status(status).json({
      success: true,
      data
    })
  },
  
  error: (res: NextApiResponse, message: string, status = 400) => {
    return res.status(status).json({
      success: false,
      error: message
    })
  },
  
  unauthorized: (res: NextApiResponse, message = 'No autorizado') => {
    return res.status(401).json({
      success: false,
      error: message
    })
  },
  
  forbidden: (res: NextApiResponse, message = 'Acceso denegado') => {
    return res.status(403).json({
      success: false,
      error: message
    })
  },
  
  notFound: (res: NextApiResponse, message = 'Recurso no encontrado') => {
    return res.status(404).json({
      success: false,
      error: message
    })
  },
  
  serverError: (res: NextApiResponse, message = 'Error interno del servidor') => {
    return res.status(500).json({
      success: false,
      error: message
    })
  }
}
