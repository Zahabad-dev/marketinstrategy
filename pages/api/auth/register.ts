import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { 
  registerSchema, 
  validate,
  errorResponse,
  successResponse,
  validationErrorResponse,
  conflictResponse  
} from '@/lib'
import { ZodError } from 'zod'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate request body
    const validatedData = validate(registerSchema, req.body)
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(validatedData.email as string)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      })
    }
    
    // Create user
    const user = await UserModel.create(validatedData as any)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: 'Usuario registrado exitosamente'
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Register error:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    })
  }
}
