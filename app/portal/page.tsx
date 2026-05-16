'use client'

import { useEffect, useState, useMemo } from 'react'
import { Calendar, FileText, Image, FileVideo, Link2, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-green-100 text-green-800',
  PUBLICADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
}
const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_REVISION: 'En Revisión', APROBADO: 'Aprobado',
  PUBLICADO: 'Publicado', RECHAZADO: 'Rechazado',
}
const TIPO_ICONS: Record<string, any> = {
  IMAGEN: Image, VIDEO_FILE: FileVideo, VIDEO_LINK: Link2, PDF: FileText,
}
const TIPO_LABELS: Record<string, string> = {
  IMAGEN: 'Imagen', VIDEO_FILE: 'Video', VIDEO_LINK: 'Video (enlace)', PDF: 'PDF',
}
const CAMPAIGN_COLORS = ['bg-blue-400','bg-purple-400','bg-green-400','bg-orange-400','bg-pink-400','bg-teal-400','bg-red-400','bg-indigo-400']

export default function PortalPage() {
  const { getToken } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [allContents, setAllContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [filterCampaign, setFilterCampaign] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const token = getToken()
    try {
      const res = await fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } })
      const cams = (await res.json()).data?.data || []
      setCampaigns(cams)
      const contentArrays = await Promise.all(
        cams.map((c: any) =>
          fetch(`/api/contents?campanaId=${c.id}&perPage=500`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => (d.data?.data || []).map((item: any) => ({ ...item, _campanaId: c.id })))
            .catch(() => [])
        )
      )
      const allItems = contentArrays.flat()
      setAllContents(allItems)
      // Auto-navigate to the month with the nearest upcoming content
      const now = new Date()
      const future = allItems.filter((c: any) => c.fecha && new Date(c.fecha) >= new Date(now.getFullYear(), now.getMonth(), 1))
      if (future.length > 0) {
        future.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        const nearest = new Date(future[0].fecha)
        setCurrentDate(new Date(nearest.getFullYear(), nearest.getMonth(), 1))
      }
    } catch {} finally { setLoading(false) }
  }

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const campaignColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    campaigns.forEach((c, i) => { map[c.id] = CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length] })
    return map
  }, [campaigns])

  const filteredContents = filterCampaign
    ? allContents.filter(c => (c.campana_id || c.campanaId || c._campanaId) === filterCampaign)
    : allContents

  const contentsByDay = useMemo(() => {
    const map: Record<number, any[]> = {}
    filteredContents.forEach(c => {
      if (!c.fecha) return
      const d = new Date(c.fecha.split('T')[0] + 'T12:00:00')
      if (d.getFullYear() !== year || d.getMonth() !== month) return
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push(c)
    })
    return map
  }, [filteredContents, year, month])

  const selectedDayContents = selectedDay ? (contentsByDay[selectedDay] || []) : []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Calendario de Contenido</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Revisa el plan de contenido del mes</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : campaigns.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No tienes campañas asignadas</p>
            <p className="text-gray-400 mt-2">Contacta a tu equipo de marketing para más información</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Campaign filter pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-medium">Filtrar:</span>
              <button onClick={() => setFilterCampaign(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${!filterCampaign ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                Todas
              </button>
              {campaigns.map((c: any, i) => (
                <button key={c.id} onClick={() => setFilterCampaign(prev => prev === c.id ? null : c.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${filterCampaign === c.id ? 'text-white border-transparent ' + CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length].replace('bg-','bg-') : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                  style={filterCampaign === c.id ? {} : {}}>
                  <span className={`w-2 h-2 rounded-full ${CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length]}`} />
                  {MONTH_NAMES[(c.mes||1)-1]} {c.anio || c.año}
                </button>
              ))}
            </div>

            {/* Status legend — mobile only */}
            <div className="flex sm:hidden flex-wrap gap-x-4 gap-y-1.5 px-1">
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const dotColors: Record<string, string> = {
                  PENDIENTE: 'bg-gray-400',
                  EN_REVISION: 'bg-yellow-400',
                  APROBADO: 'bg-green-500',
                  PUBLICADO: 'bg-blue-500',
                  RECHAZADO: 'bg-red-500',
                }
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColors[key]}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </span>
                )
              })}
            </div>

            {/* Calendar card */}
            <div className="card p-0 overflow-hidden">
              {/* Month header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 border-b">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 divide-x divide-y">
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const dayNum = idx - firstDay + 1
                  const validDay = dayNum >= 1 && dayNum <= daysInMonth
                  const dayContents = validDay ? (contentsByDay[dayNum] || []) : []
                  const isToday = validDay && new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year
                  const isSelected = validDay && selectedDay === dayNum
                  return (
                    <div key={idx} onClick={() => { if (validDay) setSelectedDay(prev => prev === dayNum ? null : dayNum) }}
                      className={`min-h-[70px] sm:min-h-[90px] p-1 sm:p-2 transition-colors ${!validDay ? 'bg-gray-50' : 'cursor-pointer'} ${isSelected ? 'bg-blue-50' : validDay ? 'hover:bg-gray-50' : ''}`}>
                      {validDay && (
                        <>
                          <div className={`text-sm font-medium mb-1.5 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}>
                            {dayNum}
                          </div>
                          <div className="space-y-0.5">
                            {dayContents.slice(0, 3).map((c: any) => {
                              const color = campaignColorMap[c.campana_id || c.campanaId || c._campanaId] || 'bg-gray-400'
                              return (
                                <div key={c.id} className={`rounded px-1.5 py-0.5 text-white text-[11px] font-medium truncate leading-tight ${color}`}>
                                  {c.titulo}
                                </div>
                              )
                            })}
                            {dayContents.length > 3 && (
                              <div className="text-[11px] text-gray-500 pl-1">+{dayContents.length - 3} más</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {selectedDay} de {MONTH_NAMES[month]}  {selectedDayContents.length} pieza{selectedDayContents.length !== 1 ? 's' : ''}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedDayContents.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No hay contenido programado para este día</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedDayContents.map((c: any) => {
                      const Icon = TIPO_ICONS[c.tipo] || FileText
                      const campColor = campaignColorMap[c.campana_id || c.campanaId || c._campanaId]
                      return (
                        <div key={c.id} className="rounded-lg border border-gray-200 overflow-hidden">
                          {c.tipo === 'IMAGEN' && (c.url_referencia || c.urlReferencia) && (
                            <div className="h-32 bg-gray-100 overflow-hidden">
                              <img src={c.url_referencia || c.urlReferencia} alt={c.titulo}
                                className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {campColor && <span className={`w-2 h-2 rounded-full shrink-0 ${campColor}`} />}
                              <Icon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                              <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_LABELS[c.estado] || c.estado}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 text-sm leading-snug">{c.titulo}</p>
                            {c.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.descripcion}</p>}
                            {(c.url_referencia || c.urlReferencia) && (
                              <a href={c.url_referencia || c.urlReferencia} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                                <ExternalLink className="w-3 h-3" /> Ver archivo
                              </a>
                            )}
                            {/* Copy */}
                            {(c.copy) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Copy</p>
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">{c.copy}</p>
                                {(c.copy_v2 || c.copyV2) && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">Copy — Versión 2</p>
                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{c.copy_v2 || c.copyV2}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Guión */}
                            {(c.guion) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Guión</p>
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">{c.guion}</p>
                                {(c.guion_v2 || c.guionV2) && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-purple-700 mb-1">Guión — Versión 2</p>
                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{c.guion_v2 || c.guionV2}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['PENDIENTE','EN_REVISION','APROBADO','PUBLICADO'] as const).map(status => {
                const count = filteredContents.filter(c => {
                  if (c.estado !== status) return false
                  if (!c.fecha) return false
                  const d = new Date(c.fecha.split('T')[0] + 'T12:00:00')
                  return d.getFullYear() === year && d.getMonth() === month
                }).length
                return (
                  <div key={status} className={`rounded-xl p-4 ${STATUS_COLORS[status]}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium mt-0.5">{STATUS_LABELS[status]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}