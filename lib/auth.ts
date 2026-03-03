import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { JWTPayload } from '@/types'

const SALT_ROUNDS = 10

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET!.trim()
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d').trim()
  // @ts-expect-error - jwt.sign types are overly strict, expiresIn accepts string like '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const secret = process.env.REFRESH_TOKEN_SECRET!.trim()
  const expiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN || '30d').trim()
  // @ts-expect-error - jwt.sign types are overly strict, expiresIn accepts string like '30d'
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Verify and decode JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!.trim()) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Verify and decode JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!.trim()) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    return null
  }
}
