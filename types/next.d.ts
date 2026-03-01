import { NextRequest } from 'next/server'
import { JWTPayload } from './index'

declare module 'next/server' {
  interface NextRequest {
    user?: JWTPayload
  }
}
