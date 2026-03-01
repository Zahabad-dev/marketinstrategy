import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole, parseMultipartForm, processUploadedFile, ApiResponse, UploadType } from '@/lib'
import { UserRole } from '@/types'

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * POST /api/contents/upload
 * Upload files for content (images, videos, PDFs)
 * 
 * Only ADMIN and EDITOR roles can upload files
 * 
 * Request: multipart/form-data
 * - file: File to upload
 * - type: 'IMAGEN' | 'VIDEO_FILE' | 'PDF'
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     filename: string,
 *     originalName: string,
 *     publicUrl: string,
 *     size: number,
 *     mimeType: string
 *   }
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return ApiResponse.error(res, 'Method not allowed', 405)
  }

  try {
    // Only ADMIN and EDITOR can upload files
    const payload = await requireRole(req, res, [UserRole.ADMIN, UserRole.EDITOR])
    if (!payload) return

    // Parse the multipart form
    // Get upload type from query parameter or default to IMAGEN
    const uploadType = (req.query.type as UploadType) || 'IMAGEN'

    // Validate upload type
    const validTypes: UploadType[] = ['IMAGEN', 'VIDEO_FILE', 'PDF']
    if (!validTypes.includes(uploadType)) {
      return ApiResponse.error(res, `Tipo de upload inválido. Use: ${validTypes.join(', ')}`, 400)
    }

    const { fields, files } = await parseMultipartForm(req, uploadType)

    // Get the uploaded file
    const uploadedFile = files.file
    if (!uploadedFile) {
      return ApiResponse.error(res, 'No se proporcionó ningún archivo', 400)
    }

    // Handle single file (formidable might return array)
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile

    // Process the file
    const result = await processUploadedFile(file, uploadType)

    return ApiResponse.success(res, {
      filename: result.filename,
      originalName: result.originalName,
      publicUrl: result.publicUrl,
      size: result.size,
      mimeType: result.mimeType,
    }, 201)
  } catch (error) {
    console.error('Upload error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo'
    return ApiResponse.error(res, errorMessage, 400)
  }
}
