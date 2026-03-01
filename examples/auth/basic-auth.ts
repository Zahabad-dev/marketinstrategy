/**
 * EJEMPLO 1: Autenticación Básica
 * 
 * Esta ruta solo requiere que el usuario esté autenticado.
 * Cualquier rol puede acceder (ADMIN, EDITOR, CLIENT).
 * 
 * Caso de uso: Obtener perfil del usuario actual, configuraciones personales
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth, ApiResponse } from '@/lib'
import { UserModel } from '@/models'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ PASO 1: Verificar autenticación
  // requireAuth retorna null y envía respuesta de error si no está autenticado
  const payload = await requireAuth(req, res)
  if (!payload) return
  
  // ✅ PASO 2: Usuario autenticado - procesar request
  try {
    if (req.method === 'GET') {
      // Obtener información completa del usuario
      const user = await UserModel.findById(payload.userId)
      
      if (!user) {
        return ApiResponse.notFound(res, 'Usuario no encontrado')
      }
      
      // Remover password de la respuesta
      const { password, ...userWithoutPassword } = user
      
      return ApiResponse.success(res, {
        user: userWithoutPassword,
        // Información adicional del token
        tokenInfo: {
          issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
          expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        }
      })
    }
    
    if (req.method === 'PUT') {
      // Actualizar perfil propio
      const { nombre } = req.body
      
      const updated = await UserModel.update(payload.userId, { nombre })
      
      if (!updated) {
        return ApiResponse.notFound(res, 'Usuario no encontrado')
      }
      
      const { password, ...userWithoutPassword } = updated
      return ApiResponse.success(res, userWithoutPassword)
    }
    
    return ApiResponse.error(res, 'Método no permitido', 405)
    
  } catch (error) {
    console.error('Profile error:', error)
    return ApiResponse.serverError(res)
  }
}
