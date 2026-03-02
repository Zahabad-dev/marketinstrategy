/**
 * EJEMPLO 4: Control de Propiedad de Recursos
 * 
 * Esta ruta verifica que el usuario solo pueda acceder/modificar recursos que le pertenecen.
 * ADMIN puede acceder a todo, CLIENT solo a sus propios recursos.
 * 
 * Caso de uso: Gestión de clientes, un CLIENT solo ve/edita sus propios clientes
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  requireAuth, 
  ApiResponse, 
  canModifyResource,
  canDeleteResource,
  validate,
  updateClientSchema 
} from '@/lib'
import { ClientModel } from '@/models'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  // ✅ Requiere autenticación
  const payload = await requireAuth(req, res)
  if (!payload) return
  
  try {
    // Obtener el cliente
    const client = await ClientModel.findById(id as string)
    
    if (!client) {
      return ApiResponse.notFound(res, 'Cliente no encontrado')
    }
    
    if (req.method === 'GET') {
      // ✅ Verificar si puede VER este cliente
      // ADMIN y EDITOR: pueden ver todos
      // CLIENT: solo puede ver si es el propietario (usuarioId coincide)
      if (payload.rol === UserRole.CLIENT && client.usuarioId !== payload.userId) {
        return ApiResponse.forbidden(res, 'No tienes acceso a este cliente')
      }
      
      return ApiResponse.success(res, client)
    }
    
    if (req.method === 'PUT') {
      // ✅ Verificar si puede MODIFICAR este cliente
      if (!canModifyResource(payload.rol, payload.userId, client.usuarioId ?? '')) {
        return ApiResponse.forbidden(res, 'No puedes modificar este cliente')
      }
      
      const data = validate(updateClientSchema, req.body)
      const updated = await ClientModel.update(id as string, data)
      
      return ApiResponse.success(res, updated)
    }
    
    if (req.method === 'DELETE') {
      // ✅ Verificar si puede ELIMINAR este cliente
      // Normalmente solo ADMIN puede eliminar, o el propietario si es CLIENT
      if (!canDeleteResource(payload.rol, payload.userId, client.usuarioId ?? '')) {
        return ApiResponse.forbidden(res, 'No puedes eliminar este cliente')
      }
      
      await ClientModel.delete(id as string)
      
      return ApiResponse.success(res, { 
        message: 'Cliente eliminado exitosamente',
        id 
      })
    }
    
    return ApiResponse.error(res, 'Método no permitido', 405)
    
  } catch (error) {
    console.error('Client resource error:', error)
    return ApiResponse.serverError(res)
  }
}

/**
 * FLUJO DE VERIFICACIÓN DE PROPIEDAD:
 * 
 * 1. Obtener recurso de la base de datos
 * 2. Verificar que existe (404 si no)
 * 3. Extraer el campo de "propietario" (usuarioId, clienteId, etc.)
 * 4. Usar helpers de permisos para verificar acceso:
 *    - canModifyResource(userRole, userId, resourceOwnerId)
 *    - canDeleteResource(userRole, userId, resourceOwnerId)
 * 5. Si pasa verificación, procesar operación
 * 6. Si no pasa, retornar 403 Forbidden
 * 
 * LÓGICA DE PERMISOS:
 * 
 * canModifyResource:
 * - ADMIN: Siempre puede modificar
 * - EDITOR: Siempre puede modificar
 * - CLIENT: Solo si userId === resourceOwnerId
 * 
 * canDeleteResource:
 * - ADMIN: Siempre puede eliminar
 * - EDITOR: NO puede eliminar (solo crear/modificar)
 * - CLIENT: Solo si userId === resourceOwnerId
 */
