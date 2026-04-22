import type { NextApiRequest, NextApiResponse } from 'next'
import * as XLSX from 'xlsx'
import { CampaignModel, ContentModel, ClientModel } from '@/models'
import { extractTokenFromHeader, verifyAccessToken } from '@/lib'

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = extractTokenFromHeader(req.headers.authorization as string)
    if (!token) return res.status(401).json({ success: false, error: 'No autorizado' })

    const payload = verifyAccessToken(token)
    if (!payload) return res.status(401).json({ success: false, error: 'Token inválido' })

    const { clienteId, año, mes } = req.query

    if (!clienteId || typeof clienteId !== 'string') {
      return res.status(400).json({ success: false, error: 'Se requiere clienteId' })
    }

    // Fetch client info
    const client = await ClientModel.findById(clienteId)
    if (!client) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' })
    }

    // Fetch campaigns for this client (optionally filtered by month/year)
    const campaigns = await CampaignModel.findByClienteId(clienteId)
    const filteredCampaigns = campaigns.filter(cam => {
      if (año && mes) {
        return cam.anio === parseInt(año as string) && cam.mes === parseInt(mes as string)
      }
      if (año) return cam.anio === parseInt(año as string)
      return true
    })

    if (filteredCampaigns.length === 0) {
      return res.status(404).json({ success: false, error: 'No se encontraron campañas para este cliente' })
    }

    // Build Excel rows
    const rows: any[] = []
    for (const campaign of filteredCampaigns) {
      const contents = await ContentModel.findByCampanaId(campaign.id)
      for (const c of contents) {
        rows.push({
          'Título': c.titulo,
          'Fecha': c.fecha ? new Date(c.fecha).toISOString().split('T')[0] : '',
          'Tipo': c.tipo,
          'Estado': c.estado,
          'Descripción': c.descripcion || '',
          'URL Referencia': (c as any).url_referencia || (c as any).urlReferencia || '',
          'Copy': (c as any).copy || '',
          'Copy V2': (c as any).copy_v2 || (c as any).copyV2 || '',
          'Guión': (c as any).guion || '',
          'Guión V2': (c as any).guion_v2 || (c as any).guionV2 || '',
          'Campaña Mes': campaign.mes,
          'Campaña Año': campaign.anio,
          'Objetivo Campaña': (campaign as any).objetivo_general || (campaign as any).objetivoGeneral || '',
        })
      }
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No hay contenidos calendarizados para exportar' })
    }

    // Build workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Título
      { wch: 12 }, // Fecha
      { wch: 14 }, // Tipo
      { wch: 14 }, // Estado
      { wch: 40 }, // Descripción
      { wch: 40 }, // URL Referencia
      { wch: 40 }, // Copy
      { wch: 40 }, // Copy V2
      { wch: 40 }, // Guión
      { wch: 40 }, // Guión V2
      { wch: 14 }, // Campaña Mes
      { wch: 14 }, // Campaña Año
      { wch: 40 }, // Objetivo Campaña
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Calendarización')

    // Add a reference sheet for valid values
    const refData = [
      { Campo: 'Tipo', 'Valores Válidos': 'IMAGEN | VIDEO_FILE | VIDEO_LINK | PDF' },
      { Campo: 'Estado', 'Valores Válidos': 'PENDIENTE | EN_REVISION | APROBADO | PUBLICADO | RECHAZADO' },
      { Campo: 'Campaña Mes', 'Valores Válidos': '1 (Enero) ... 12 (Diciembre)' },
      { Campo: 'Fecha', 'Valores Válidos': 'Formato YYYY-MM-DD (ej: 2025-05-15)' },
    ]
    const wsRef = XLSX.utils.json_to_sheet(refData)
    wsRef['!cols'] = [{ wch: 18 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(wb, wsRef, 'Referencia')

    const clientName = (client as any).nombre_empresa || (client as any).nombreEmpresa || 'cliente'
    const safeName = clientName.replace(/[^a-zA-Z0-9_\-]/g, '_')
    const dateStr = año && mes
      ? `${MONTH_NAMES[parseInt(mes as string) - 1]}_${año}`
      : `todos`

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="Calendarizacion_${safeName}_${dateStr}.xlsx"`)
    res.setHeader('Content-Length', buffer.length)
    return res.status(200).send(buffer)
  } catch (error) {
    console.error('Calendar export error:', error)
    return res.status(500).json({ success: false, error: 'Error al exportar' })
  }
}
