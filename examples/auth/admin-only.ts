/**
 * EJEMPLO 2: Solo Administradores
 * 
 * Esta ruta solo permite acceso a usuarios con rol ADMIN.
 * Ideal para: gestión de usuarios, configuración del sistema, estadísticas globales
 * 
 * Caso de uso: Dashboard de administración, gestión de usuarios
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole, ApiResponse, validate, paginationSchema } from '@/lib'
import { UserModel, ClientModel, CampaignModel, ContentModel } from '@/models'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ SOLO ADMINS pueden acceder
  const payload = await requireRole(req, res, UserRole.ADMIN)
  if (!payload) return
  
  try {
    if (req.method === 'GET') {
      // Obtener estadísticas globales del sistema
      const [
        totalUsers,
        totalClients,
        totalCampaigns,
        totalContents
      ] = await Promise.all([
        UserModel.count({}),
        ClientModel.count({}),
        CampaignModel.count({}),
        ContentModel.count({})
      ])
      
      // Estadísticas por rol
      const [adminCount, editorCount, clientCount] = await Promise.all([
        UserModel.count({ rol: UserRole.ADMIN }),
        UserModel.count({ rol: UserRole.EDITOR }),
        UserModel.count({ rol: UserRole.CLIENT })
      ])
      
      return ApiResponse.success(res, {
        overview: {
          totalUsers,
          totalClients,
          totalCampaigns,
          totalContents
        },
        usersByRole: {
          admins: adminCount,
          editors: editorCount,
          clients: clientCount
        },
        timestamp: new Date()
      })
    }
    
    if (req.method === 'POST') {
      // Ejemplo: Crear usuario con cualquier rol (solo admins pueden hacer esto)
      const { email, password, nombre, rol } = req.body
      
      // Verificar si el email ya existe
      const existing = await UserModel.findByEmail(email)
      if (existing) {
        return ApiResponse.error(res, 'El email ya está registrado', 409)
      }
      
      // Crear usuario
      const user = await UserModel.create({
        email,
        password,
        nombre,
        rol: rol || UserRole.CLIENT
      })
      
      const { password: _, ...userWithoutPassword } = user
      return ApiResponse.success(res, userWithoutPassword, 201)
    }
    
    return ApiResponse.error(res, 'Método no permitido', 405)
    
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return ApiResponse.serverError(res)
  }
}
