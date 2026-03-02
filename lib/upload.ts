import fs from 'fs'
import path from 'path'
import { IncomingForm, File as FormidableFile } from 'formidable'
import type { NextApiRequest } from 'next'

/**
 * Configuración de uploads
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/ogg',
    'video/3gpp',
    'video/x-flv'
  ],
  ALLOWED_PDF_TYPES: ['application/pdf'],
  UPLOAD_DIR: path.join(process.cwd(), 'public', 'uploads'),
  // Configuración para storage externo (futuro)
  USE_EXTERNAL_STORAGE: false,
  EXTERNAL_STORAGE_PROVIDER: null as 'S3' | 'CLOUDINARY' | 'AZURE' | null,
  EXTERNAL_STORAGE_CONFIG: {},
}

/**
 * Tipos de contenido permitidos
 */
export type UploadType = 'IMAGEN' | 'VIDEO_FILE' | 'PDF'

/**
 * Resultado de un upload
 */
export interface UploadResult {
  filename: string
  originalName: string
  path: string
  publicUrl: string
  size: number
  mimeType: string
}

/**
 * Asegurar que el directorio de uploads existe
 */
export function ensureUploadDirExists(subdir?: string): string {
  const targetDir = subdir 
    ? path.join(UPLOAD_CONFIG.UPLOAD_DIR, subdir)
    : UPLOAD_CONFIG.UPLOAD_DIR

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  return targetDir
}

/**
 * Obtener tipos MIME permitidos según el tipo de contenido
 */
export function getAllowedMimeTypes(type: UploadType): string[] {
  switch (type) {
    case 'IMAGEN':
      return UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES
    case 'VIDEO_FILE':
      return UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES
    case 'PDF':
      return UPLOAD_CONFIG.ALLOWED_PDF_TYPES
    default:
      return []
  }
}

/**
 * Validar tipo de archivo
 */
export function isValidFileType(mimeType: string, type: UploadType): boolean {
  const allowedTypes = getAllowedMimeTypes(type)
  return allowedTypes.includes(mimeType)
}

/**
 * Generar nombre de archivo único
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const ext = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, ext)
  const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  
  return `${safeName}_${timestamp}_${random}${ext}`
}

/**
 * Obtener subdirectorio organizado por tipo y fecha
 */
export function getUploadSubdir(type: UploadType): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  return path.join(type.toLowerCase(), `${year}`, month)
}

/**
 * Parse multipart/form-data request usando formidable
 */
export async function parseMultipartForm(
  req: NextApiRequest,
  uploadType: UploadType
): Promise<{
  fields: Record<string, string>
  files: Record<string, FormidableFile | FormidableFile[]>
}> {
  // Configurar subdirectorio
  const subdir = getUploadSubdir(uploadType)
  const uploadDir = ensureUploadDirExists(subdir)

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    multiples: false,
    filename: (_name, _ext, part) => {
      return generateUniqueFilename(part.originalFilename || 'file')
    },
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      // Convert fields to simple object
      const flatFields: Record<string, string> = {}
      Object.keys(fields).forEach((key) => {
        const value = fields[key]
        flatFields[key] = Array.isArray(value) ? value[0] : (value || '')
      })

      // Convert files to proper type
      const flatFiles: Record<string, FormidableFile | FormidableFile[]> = {}
      Object.keys(files).forEach((key) => {
        const file = files[key]
        if (file) {
          flatFiles[key] = file
        }
      })

      resolve({ fields: flatFields, files: flatFiles })
    })
  })
}

/**
 * Procesar archivo subido
 */
export async function processUploadedFile(
  file: FormidableFile,
  uploadType: UploadType
): Promise<UploadResult> {
  // Validar tipo de archivo
  const mimeType = file.mimetype || ''
  if (!isValidFileType(mimeType, uploadType)) {
    // Eliminar archivo inválido
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath)
    }
    throw new Error(`Tipo de archivo no permitido: ${mimeType}`)
  }

  // Obtener información del archivo
  const originalName = file.originalFilename || 'unknown'
  const filename = path.basename(file.filepath)
  const subdir = getUploadSubdir(uploadType)
  
  // Calcular URL pública
  const publicUrl = `/uploads/${subdir}/${filename}`.replace(/\\/g, '/')

  return {
    filename,
    originalName,
    path: file.filepath,
    publicUrl,
    size: file.size,
    mimeType,
  }
}

/**
 * Eliminar archivo
 */
export function deleteFile(filePath: string): boolean {
  try {
    // Si es una URL pública, convertir a ruta del sistema
    let targetPath = filePath
    if (filePath.startsWith('/uploads/')) {
      targetPath = path.join(process.cwd(), 'public', filePath)
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Formato de archivo válido para Next.js API config
 */
export const apiConfig = {
  api: {
    bodyParser: false,
  },
}
