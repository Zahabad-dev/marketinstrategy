import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { requireRole, paginationSchema, registerSchema, validate, ApiResponse } from '@/lib'
import { UserRole } from '@/types'
import { ZodError } from 'zod'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only ADMIN can manage users
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

    if (req.method === 'POST') {
      // Create new user (Admin only)
      const validatedData = validate(registerSchema, req.body)
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(validatedData.email as string)
      if (existingUser) {
        return ApiResponse.error(res, 'Ya existe un usuario con este email', 409)
      }

      // Create user with specified role or default to CLIENT
      const newUser = await UserModel.create({
        nombre: validatedData.nombre as string,
        email: validatedData.email as string,
        password: validatedData.password as string,
        rol: validatedData.rol || UserRole.CLIENT,
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser

      return ApiResponse.success(res, {
        ...userWithoutPassword,
        message: 'Usuario creado exitosamente'
      }, 201)
    }

    return ApiResponse.error(res, 'Method not allowed', 405)
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.error(res, 'Datos de validación inválidos', 400)
    }
    
    console.error('Users API error:', error)
    return ApiResponse.serverError(res, 'Error en la API de usuarios')
  }
}
