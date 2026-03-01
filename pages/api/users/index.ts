import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { requireRole, paginationSchema, validate, ApiResponse } from '@/lib'
import { UserRole } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only ADMIN can list users
    const payload = await requireRole(req, res, UserRole.ADMIN)
    if (!payload) return

    if (req.method === 'GET') {
      // List users with pagination
      const validatedPagination = validate(paginationSchema, req.query)
      const pagination = {
        page: validatedPagination.page ?? 1,
        perPage: validatedPagination.perPage ?? 20,
      }
      
      const filters = {
        rol: req.query.rol as UserRole | undefined,
        search: req.query.search as string | undefined,
      }
      
      const [users, total] = await Promise.all([
        UserModel.list(filters, pagination),
        UserModel.count(filters)
      ])
      
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user)
      
      return ApiResponse.success(res, {
        data: usersWithoutPasswords,
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(total / pagination.perPage)
      })
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    console.error('Users API error:', error)
    return ApiResponse.serverError(res, 'Error en la API de usuarios')
  }
}
