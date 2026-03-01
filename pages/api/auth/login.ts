import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { 
  loginSchema, 
  validate,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken
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
    const data = validate(loginSchema, req.body)
    
    // Find user by email
    const user = await UserModel.findByEmail(data.email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password!)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }
    
    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      rol: user.rol,
    }
    
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user
    
    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    })
  }
}
