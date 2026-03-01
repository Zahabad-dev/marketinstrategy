import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { requireAuth, updateUserSchema, validate, isAdmin, ApiResponse } from '@/lib'
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
      // Get single user
      const user = await UserModel.findById(id as string)
      if (!user) {
        return ApiResponse.notFound(res, 'Usuario no encontrado')
      }
      
      const { password, ...userWithoutPassword } = user
      return ApiResponse.success(res, userWithoutPassword)
    }

    if (req.method === 'PUT') {
      // Update user - only admins or own profile
      if (!isAdmin(payload.rol) && payload.userId !== id) {
        return ApiResponse.forbidden(res)
      }
      
      const data = validate(updateUserSchema, req.body)
      const user = await UserModel.update(id as string, data)
      
      if (!user) {
        return ApiResponse.notFound(res, 'Usuario no encontrado')
      }
      
      const { password, ...userWithoutPassword } = user
      return ApiResponse.success(res, userWithoutPassword)
    }

    if (req.method === 'DELETE') {
      // Delete user - only admins
      if (!isAdmin(payload.rol)) {
        return ApiResponse.forbidden(res)
      }
      
      const success = await UserModel.delete(id as string)
      if (!success) {
        return ApiResponse.notFound(res, 'Usuario no encontrado')
      }
      
      return ApiResponse.success(res, { message: 'Usuario eliminado' })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
    }
    
    console.error('User API error:', error)
    return ApiResponse.serverError(res)
  }
}
