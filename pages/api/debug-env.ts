import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dbUrl = process.env.DATABASE_URL || '';
  const jwtSecret = process.env.JWT_SECRET || '';
  
  return res.json({
    success: true,
    data: {
      DATABASE_URL_length: dbUrl.length,
      DATABASE_URL_hasNewlines: /[\r\n]/.test(dbUrl),
      DATABASE_URL_preview: dbUrl.substring(0, 50) + '...',
      JWT_SECRET_length: jwtSecret.length,
      JWT_SECRET_hasNewlines: /[\r\n]/.test(jwtSecret),
      allEnvVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE,
      }
    }
  })
}
