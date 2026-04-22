'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Image, FileVideo, Link2, FileText, Download, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const TIPO_ICONS: Record<string, any> = {
  IMAGEN: Image, VIDEO_FILE: FileVideo, VIDEO_LINK: Link2, PDF: FileText,
}
const STATUS_DOT: Record<string, string> = {
  PENDIENTE: 'bg-gray-400', EN_REVISION: 'bg-yellow-500', APROBADO: 'bg-green-500',
  PUBLICADO: 'bg-blue-500', RECHAZADO: 'bg-red-500',
}
const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_REVISION: 'En Revisión', APROBADO: 'Aprobado',
  PUBLICADO: 'Publicado', RECHAZADO: 'Rechazado',
}

export default function CalendarPage() {
  const { getToken } = useAuth()
  const [contents, setContents] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [allCampaigns, setAllCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<number|null>(null)
  const [filterClientId, setFilterClientId] = useState('')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importClientId, setImportClientId] = useState('')
  const importFileRef = useRef<HTMLInputElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => { fetchData() }, [year, month])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: `Bearer ${token}` }
    try {
      const [coR, caR, allCaR, clR] = await Promise.all([
        fetch('/api/contents?perPage=500', { headers: h }),
        fetch(`/api/campaigns/calendar?año=${year}&mes=${month+1}`, { headers: h }),
        fetch('/api/campaigns?perPage=500', { headers: h }),
        fetch('/api/clients', { headers: h }),
      ])
      setContents((await coR.json()).data?.data || [])
      const calData = await caR.json()
      setCampaigns(calData.data?.campaigns || [])
      setAllCampaigns((await allCaR.json()).data?.data || [])
      setClients((await clR.json()).data?.data || [])
    } catch {} finally { setLoading(false) }
  }

  // Campaign IDs belonging to selected client — use ALL campaigns, not just this month's
  const clientCampaignIds = filterClientId
    ? allCampaigns.filter((cam: any) => (cam.cliente_id || cam.clienteId) === filterClientId).map((cam: any) => cam.id)
    : null

  const filteredContents = filterClientId
    ? contents.filter((c: any) => clientCampaignIds!.includes(c.campana_id || c.campanaId))
    : contents

  const getContentForDay = (day: number) => {
    return filteredContents.filter(c => {
      if (!c.fecha) return false
      const d = new Date(c.fecha.split('T')[0] + 'T12:00:00')
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  const handleDayClick = (day: number) => {
    const dayContents = getContentForDay(day)
    setSelected(dayContents)
    setSelectedDay(day)
  }

  const filteredCampaigns = filterClientId
    ? campaigns.filter((cam: any) => (cam.cliente_id || cam.clienteId) === filterClientId)
    : campaigns

  const handleExport = async () => {
    const clientId = filterClientId
    if (!clientId) {
      alert('Selecciona un cliente para exportar su calendarización')
      return
    }
    setExporting(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({ clienteId: clientId, año: String(year), mes: String(month + 1) })
      const res = await fetch(`/api/calendar/export?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Error al exportar')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="(.+)"/)
      const filename = match ? match[1] : 'calendarizacion.xlsx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar la calendarización')
    } finally {
      setExporting(false)
    }
  }

  const handleImportSubmit = async () => {
    if (!importClientId) { alert('Selecciona un cliente'); return }
    const file = importFileRef.current?.files?.[0]
    if (!file) { alert('Selecciona un archivo Excel'); return }
    setImporting(true)
    setImportResult(null)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('clienteId', importClientId)
      formData.append('file', file)
      const res = await fetch('/api/calendar/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al importar')
        return
      }
      setImportResult(data.data)
      if (importFileRef.current) importFileRef.current.value = ''
      fetchData()
    } catch {
      alert('Error al importar el archivo')
    } finally {
      setImporting(false)
    }
  }

  const clientName = (campaignId: string) => {
    const cam = campaigns.find((c: any) => c.id === campaignId)
    if (!cam) return ''
    const cl = clients.find((c: any) => c.id === (cam.cliente_id || cam.clienteId))
    return cl?.nombre_empresa || ''
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Vista mensual de contenido calendarizado</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrar cliente:</label>
            <select
              value={filterClientId}
              onChange={(e) => { setFilterClientId(e.target.value); setSelectedDay(null); setSelected([]) }}
              className="input sm:max-w-xs"
            >
              <option value="">Todos los clientes</option>
              {clients.map((cl: any) => (
                <option key={cl.id} value={cl.id}>{cl.nombre_empresa}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={handleExport}
              disabled={exporting || !filterClientId}
              title={!filterClientId ? 'Selecciona un cliente para exportar' : 'Exportar calendarización del mes a Excel'}
              className="btn btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
            <button
              onClick={() => { setShowImportModal(true); setImportResult(null); setImportClientId(filterClientId) }}
              className="btn btn-primary flex items-center gap-1.5 text-sm"
            >
              <Upload className="w-4 h-4" />
              Importar Excel
            </button>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Importar Calendarización desde Excel</h2>
                <button onClick={() => { setShowImportModal(false); setImportResult(null) }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente destino <span className="text-red-500">*</span></label>
                  <select
                    value={importClientId}
                    onChange={(e) => setImportClientId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((cl: any) => (
                      <option key={cl.id} value={cl.id}>{cl.nombre_empresa}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Excel (.xlsx) <span className="text-red-500">*</span></label>
                  <input ref={importFileRef} type="file" accept=".xlsx,.xls" className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                  <p className="text-xs text-gray-400 mt-1">
                    Columnas requeridas: <strong>Título</strong>, <strong>Fecha</strong> (YYYY-MM-DD), <strong>Tipo</strong>, <strong>Campaña Mes</strong>, <strong>Campaña Año</strong>.<br/>
                    Si el título ya existe en la campaña, la fila será omitida.
                  </p>
                </div>

                {importResult && (
                  <div className="rounded-lg border p-3 space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-green-700 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {importResult.imported} contenidos importados
                    </div>
                    {importResult.skipped > 0 && (
                      <div className="text-yellow-600">{importResult.skipped} omitidos (título duplicado)</div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          {importResult.errors.length} errores:
                        </div>
                        <ul className="list-disc list-inside text-red-500 text-xs space-y-0.5 max-h-28 overflow-y-auto">
                          {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => { setShowImportModal(false); setImportResult(null) }} className="btn btn-secondary">Cerrar</button>
                  <button onClick={handleImportSubmit} disabled={importing} className="btn btn-primary flex items-center gap-1.5 disabled:opacity-50">
                    <Upload className="w-4 h-4" />
                    {importing ? 'Importando...' : 'Importar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 sm:gap-6 flex-col lg:flex-row">
          {/* Calendar */}
          <div className="card flex-1 !p-4 sm:!p-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="btn btn-secondary !p-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="btn btn-secondary p-2">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              {Object.entries(STATUS_LABELS).map(([k,v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[k]}`} />
                  <span className="text-gray-500">{v}</span>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Cargando...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                ))}
                {cells.map((day, i) => {
                  const dayContents = day ? getContentForDay(day) : []
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                  const isSelected = day === selectedDay
                  return (
                    <div key={i}
                      onClick={() => day && handleDayClick(day)}
                      className={`min-h-[60px] sm:min-h-[80px] rounded-lg p-1 border ${day ? 'cursor-pointer hover:bg-primary-50 hover:border-primary-200' : 'border-transparent'} ${isSelected ? 'border-primary-400 bg-primary-50' : 'border-gray-100'} ${!day ? '' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayContents.slice(0, 3).map((c: any) => {
                              const Icon = TIPO_ICONS[c.tipo] || FileText
                              return (
                                <div key={c.id} className="flex items-center gap-1 text-xs truncate">
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[c.estado] || 'bg-gray-400'}`} />
                                  <span className="truncate text-gray-600">{c.titulo}</span>
                                </div>
                              )
                            })}
                            {dayContents.length > 3 && (
                              <div className="text-xs text-gray-400">+{dayContents.length - 3} más</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Day detail panel */}
          <div className="w-full lg:w-80">
            {selectedDay && selected.length > 0 ? (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {selectedDay} de {MONTH_NAMES[month]}
                </h3>
                <div className="space-y-3">
                  {selected.map((c: any) => {
                    const Icon = TIPO_ICONS[c.tipo] || FileText
                    return (
                      <div key={c.id} className="border rounded-lg p-3 hover:border-primary-200 transition-colors">
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{c.titulo}</p>
                            {c.descripcion && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.descripcion}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${STATUS_DOT[c.estado]?.replace('bg-', 'bg-').replace('-400', '-100').replace('-500', '-100')} text-gray-700`}>
                                {STATUS_LABELS[c.estado] || c.estado}
                              </span>
                            </div>
                            {clientName(c.campana_id || c.campanaId) && (
                              <p className="text-xs text-gray-400 mt-1">{clientName(c.campana_id || c.campanaId)}</p>
                            )}
                            {(c.url_referencia || c.urlReferencia) && (
                              <a href={c.url_referencia || c.urlReferencia} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline mt-1 block truncate">
                                Ver archivo ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {selectedDay ? 'Sin contenido para este día' : 'Selecciona un día para ver el contenido'}
                </p>
              </div>
            )}

            {/* This month campaigns */}
            {filteredCampaigns.length > 0 && (
              <div className="card mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Campañas activas en {MONTH_NAMES[month]}</h3>
                <div className="space-y-2">
                  {filteredCampaigns.map((c: any) => {
                    const cl = clients.find((cl: any) => cl.id === (c.cliente_id || c.clienteId))
                    return (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
                        <div>
                          <p className="text-gray-700 font-medium">{cl?.nombre_empresa || 'Cliente'}</p>
                          <p className="text-gray-400 text-xs truncate">{c.objetivo_general || c.objetivoGeneral}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Fix missing Calendar import in inner scope
function Calendar(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

