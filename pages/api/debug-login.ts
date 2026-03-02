import type { NextApiRequest, NextApiResponse } from 'next'
import { UserModel } from '@/models'
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib'
import { loginSchema, validate } from '@/lib'
import { ZodError } from 'zod'

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER FIXING
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const steps: Record<string, any> = {}

  try {
    steps.env = {
      JWT_SECRET: process.env.JWT_SECRET ? `set (${process.env.JWT_SECRET.length} chars)` : 'MISSING',
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ? `set (${process.env.REFRESH_TOKEN_SECRET.length} chars)` : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'MISSING',
    }

    const data = validate(loginSchema, req.body)
    steps.validation = 'ok'

    const user = await UserModel.findByEmail(data.email)
    steps.userFound = !!user
    if (!user) return res.status(200).json({ steps, error: 'user not found' })

    steps.hasPassword = !!user.password

    const isValid = await verifyPassword(data.password, user.password!)
    steps.passwordMatch = isValid
    if (!isValid) return res.status(200).json({ steps, error: 'wrong password' })

    const payload = { userId: user.id, email: user.email, rol: user.rol }

    let accessToken: string
    try {
      accessToken = generateAccessToken(payload)
      steps.accessToken = 'ok'
    } catch (e: any) {
      steps.accessToken = `FAILED: ${e.message}`
      return res.status(200).json({ steps })
    }

    try {
      generateRefreshToken(payload)
      steps.refreshToken = 'ok'
    } catch (e: any) {
      steps.refreshToken = `FAILED: ${e.message}`
      return res.status(200).json({ steps })
    }

    return res.status(200).json({ steps, result: 'LOGIN_OK' })
  } catch (e: any) {
    return res.status(200).json({ steps, caught: e.message, stack: e.stack?.split('\n').slice(0,5) })
  }
}
