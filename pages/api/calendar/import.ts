import type { NextApiRequest, NextApiResponse } from 'next'
import * as XLSX from 'xlsx'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { CampaignModel, ContentModel } from '@/models'
import { extractTokenFromHeader, verifyAccessToken } from '@/lib'
import { ContentType, ContentStatus, CampaignStatus } from '@/types'

export const config = {
  api: {
    bodyParser: false,
  },
}

const VALID_TIPOS = Object.values(ContentType) as string[]
const VALID_ESTADOS = Object.values(ContentStatus) as string[]

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = extractTokenFromHeader(req.headers.authorization as string)
    if (!token) return res.status(401).json({ success: false, error: 'No autorizado' })

    const payload = verifyAccessToken(token)
    if (!payload) return res.status(401).json({ success: false, error: 'Token inválido' })

    // Parse multipart form
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 }) // 10MB max
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const clienteId = Array.isArray(fields.clienteId) ? fields.clienteId[0] : fields.clienteId
    if (!clienteId || typeof clienteId !== 'string') {
      return res.status(400).json({ success: false, error: 'Se requiere clienteId en el form data' })
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No se proporcionó ningún archivo Excel' })
    }

    // Read and parse the Excel file
    const fileBuffer = fs.readFileSync(uploadedFile.filepath)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: 'El archivo Excel está vacío o no tiene filas de datos' })
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Group rows by month/year to minimize campaign lookups
    const campaignCache = new Map<string, string>() // key: `mes-anio` → campaignId

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Excel row number (header is row 1)

      const titulo = String(row['Título'] || row['Titulo'] || '').trim()
      if (!titulo) {
        results.errors.push(`Fila ${rowNum}: 'Título' es obligatorio`)
        continue
      }

      // Resolve fecha
      let fecha: Date
      const rawFecha = row['Fecha']
      if (rawFecha instanceof Date) {
        fecha = rawFecha
      } else if (typeof rawFecha === 'string' && rawFecha.trim()) {
        fecha = new Date(rawFecha.trim() + 'T12:00:00')
      } else if (typeof rawFecha === 'number') {
        // Excel serial date
        fecha = XLSX.SSF.parse_date_code(rawFecha) as any
        fecha = new Date(rawFecha)
      } else {
        results.errors.push(`Fila ${rowNum}: 'Fecha' inválida o vacía`)
        continue
      }

      if (isNaN(fecha.getTime())) {
        results.errors.push(`Fila ${rowNum}: 'Fecha' no tiene un formato válido (use YYYY-MM-DD)`)
        continue
      }

      // Resolve tipo
      const tipoRaw = String(row['Tipo'] || '').trim().toUpperCase()
      if (!VALID_TIPOS.includes(tipoRaw)) {
        results.errors.push(`Fila ${rowNum}: 'Tipo' inválido "${tipoRaw}". Use: ${VALID_TIPOS.join(', ')}`)
        continue
      }
      const tipo = tipoRaw as ContentType

      // Resolve estado (optional, default PENDIENTE)
      const estadoRaw = String(row['Estado'] || '').trim().toUpperCase()
      const estado: ContentStatus = VALID_ESTADOS.includes(estadoRaw)
        ? (estadoRaw as ContentStatus)
        : ContentStatus.PENDIENTE

      // Resolve campaign month/year
      const mes = parseInt(String(row['Campaña Mes'] || row['Campaña_Mes'] || ''  ))
      const anio = parseInt(String(row['Campaña Año'] || row['Campaña_Año'] || ''))

      if (!mes || mes < 1 || mes > 12) {
        results.errors.push(`Fila ${rowNum}: 'Campaña Mes' inválido (debe ser 1-12)`)
        continue
      }
      if (!anio || anio < 2020) {
        results.errors.push(`Fila ${rowNum}: 'Campaña Año' inválido`)
        continue
      }

      // Find or create campaign for this client/month/year
      const campKey = `${clienteId}-${mes}-${anio}`
      let campanaId = campaignCache.get(campKey)

      if (!campanaId) {
        let campaign = await CampaignModel.findByClienteMesAnio(clienteId, mes, anio)
        if (!campaign) {
          const objetivo = String(row['Objetivo Campaña'] || row['Objetivo_Campaña'] || 'Importado desde Excel').trim()
          campaign = await CampaignModel.create({
            clienteId,
            mes,
            anio,
            objetivoGeneral: objetivo || 'Importado desde Excel',
            estado: CampaignStatus.PLANIFICADA,
          })
        }
        campanaId = campaign.id
        campaignCache.set(campKey, campanaId)
      }

      // Check for duplicate title in this campaign (case-insensitive, trimmed)
      const existingContents = await ContentModel.findByCampanaId(campanaId)
      const normalizedNew = normalizeTitle(titulo)
      const isDuplicate = existingContents.some(
        (c) => normalizeTitle(c.titulo) === normalizedNew
      )

      if (isDuplicate) {
        results.skipped++
        continue
      }

      // Create the content
      try {
        await ContentModel.create({
          campanaId,
          fecha,
          titulo,
          descripcion: String(row['Descripción'] || row['Descripcion'] || '').trim() || undefined,
          tipo,
          urlReferencia: String(row['URL Referencia'] || row['URL_Referencia'] || '').trim() || undefined,
          estado,
          copy: String(row['Copy'] || '').trim() || undefined,
          copyV2: String(row['Copy V2'] || row['Copy_V2'] || '').trim() || undefined,
          guion: String(row['Guión'] || row['Guion'] || '').trim() || undefined,
          guionV2: String(row['Guión V2'] || row['Guion_V2'] || '').trim() || undefined,
        })
        results.imported++
      } catch (createErr) {
        results.errors.push(`Fila ${rowNum}: Error al crear contenido - ${(createErr as Error).message}`)
      }
    }

    // Cleanup temp file
    try { fs.unlinkSync(uploadedFile.filepath) } catch {}

    return res.status(200).json({
      success: true,
      data: results,
      message: `Importación completada: ${results.imported} importados, ${results.skipped} omitidos (título duplicado), ${results.errors.length} errores`,
    })
  } catch (error) {
    console.error('Calendar import error:', error)
    return res.status(500).json({ success: false, error: 'Error al importar el archivo' })
  }
}
