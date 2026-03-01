/**
 * EJEMPLO 3: Control por Roles (Múltiples Roles)
 * 
 * Esta ruta permite acceso a ADMIN y EDITOR, pero NO a CLIENT.
 * Los clientes solo pueden visualizar, no crear/modificar contenido.
 * 
 * Caso de uso: Gestión de contenidos del calendario
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  requireRole, 
  requireAuth,
  ApiResponse, 
  validate, 
  createContentSchema,
  paginationSchema 
} from '@/lib'
import { ContentModel } from '@/models'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // ✅ Cualquier usuario autenticado puede VER contenidos
      const payload = await requireAuth(req, res)
      if (!payload) return
      
      const validatedPagination = validate(paginationSchema, req.query)
      const pagination = {
        page: validatedPagination.page ?? 1,
        perPage: validatedPagination.perPage ?? 20,
      }
      
      const filters = {
        campañaId: req.query.campañaId as string | undefined,
        tipo: req.query.tipo as any, // Will be validated by ContentModel
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
      // ✅ Solo ADMIN y EDITOR pueden CREAR contenidos
      const payload = await requireRole(req, res, [UserRole.ADMIN, UserRole.EDITOR])
      if (!payload) return
      
      // Validar datos
      const data = validate(createContentSchema, req.body)
      
      // Crear contenido
      const content = await ContentModel.create(data)
      
      return ApiResponse.success(res, content, 201)
    }
    
    return ApiResponse.error(res, 'Método no permitido', 405)
    
  } catch (error) {
    console.error('Content management error:', error)
    return ApiResponse.serverError(res)
  }
}

/**
 * EXPLICACIÓN DE ROLES:
 * 
 * ADMIN:
 * - Puede crear, editar, eliminar contenidos
 * - Puede ver todos los contenidos de todas las campañas
 * - Puede gestionar todos los recursos del sistema
 * 
 * EDITOR:
 * - Puede crear, editar contenidos
 * - Puede ver todos los contenidos
 * - NO puede eliminar contenidos (solo ADMIN)
 * - Enfocado en la gestión de contenidos del calendario
 * 
 * CLIENT:
 * - Solo puede VER contenidos de SUS campañas
 * - NO puede crear, editar o eliminar contenidos
 * - Rol de visualización únicamente
 */
