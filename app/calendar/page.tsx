'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Image, FileVideo, Link2, FileText } from 'lucide-react'
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
  const [clients, setClients] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<number|null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => { fetchData() }, [year, month])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: `Bearer ${token}` }
    try {
      const [coR, caR, clR] = await Promise.all([
        fetch('/api/contents', { headers: h }),
        fetch(`/api/campaigns/calendar?año=${year}&mes=${month+1}`, { headers: h }),
        fetch('/api/clients', { headers: h }),
      ])
      setContents((await coR.json()).data?.data || [])
      const calData = await caR.json()
      setCampaigns(calData.data?.campaigns || [])
      setClients((await clR.json()).data?.data || [])
    } catch {} finally { setLoading(false) }
  }

  const getContentForDay = (day: number) => {
    return contents.filter(c => {
      if (!c.fecha) return false
      const d = new Date(c.fecha)
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

  const clientName = (campaignId: string) => {
    const cam = campaigns.find((c: any) => c.id === campaignId)
    if (!cam) return ''
    const cl = clients.find((c: any) => c.id === (cam.cliente_id || cam.clienteId))
    return cl?.nombre_empresa || ''
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">Vista mensual de contenido calendarizado</p>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Calendar */}
          <div className="card flex-1">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="btn btn-secondary p-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
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
                      className={`min-h-[80px] rounded-lg p-1 border ${day ? 'cursor-pointer hover:bg-primary-50 hover:border-primary-200' : 'border-transparent'} ${isSelected ? 'border-primary-400 bg-primary-50' : 'border-gray-100'} ${!day ? '' : ''}`}
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
            {campaigns.length > 0 && (
              <div className="card mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Campañas activas en {MONTH_NAMES[month]}</h3>
                <div className="space-y-2">
                  {campaigns.map((c: any) => {
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

