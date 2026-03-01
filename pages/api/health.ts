import type { NextApiRequest, NextApiResponse } from 'next'
import { successResponse, errorResponse } from '@/lib/api-response'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test database connection
    const { testConnection } = await import('@/lib/db')
    const isConnected = await testConnection()

    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: 'API is healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      })
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    })
  }
}
