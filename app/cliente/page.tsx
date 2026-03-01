'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, EventContentArg } from '@fullcalendar/core'
import { ContenidoCalendarizado, ContentType, Campaign } from '@/types'
import { Calendar as CalendarIcon, Play, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLinkMetadata } from '@/lib/link-detector'

// Color configuration
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6',
  VIDEO_FILE: '#3B82F6',
  IMAGEN: '#10B981',
  PDF: '#EF4444',
}

interface Client {
  id: string
  nombreEmpresa: string
  contacto: string
  usuarioId: string
}

export default function ClienteViewPage() {
  const router = useRouter()
  const { user, isClient, loading: authLoading } = useAuth()
  const calendarRef = useRef<FullCalendar>(null)
  
  const [client, setClient] = useState<Client | null>(null)
  const [contents, setContents] = useState<ContenidoCalendarizado[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedContent, setSelectedContent] = useState<ContenidoCalendarizado | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      if (!isClient()) {
        router.push('/dashboard')
        return
      }

      fetchClientData()
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (client) {
      fetchContents()
    }
  }, [client, currentMonth, currentYear])

  const fetchClientData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      if (!token) return

      // Get client record for this user
      const clientsRes = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        const userClient = clientsData.data.data.find((c: Client) => c.usuarioId === user?.id)
        
        if (userClient) {
          setClient(userClient)
          
          // Fetch campaigns for this client
          const campaignsRes = await fetch('/api/campaigns?perPage=100', {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          
          if (campaignsRes.ok) {
            const campaignsData = await campaignsRes.json()
            const clientCampaigns = campaignsData.data.data.filter(
              (c: Campaign) => c.clienteId === userClient.id
            )
            setCampaigns(clientCampaigns)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token || !client) return

      const response = await fetch('/api/contents?perPage=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        let fetchedContents = data.data.data || []

        // Filter by client campaigns
        const clientCampaignIds = campaigns.map(c => c.id)
        fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) =>
          clientCampaignIds.includes(content.campañaId)
        )

        // Filter by current month/year
        fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) => {
          const contentDate = new Date(content.fecha)
          return contentDate.getMonth() + 1 === currentMonth && contentDate.getFullYear() === currentYear
        })

        // Only show approved or published content
        fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) => 
          content.estado === 'APROBADO' || content.estado === 'PUBLICADO'
        )

        setContents(fetchedContents)
      }
    } catch (error) {
      console.error('Error fetching contents:', error)
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const contentId = clickInfo.event.id
    const content = contents.find(c => c.id === contentId)
    
    if (content) {
      setSelectedContent(content)
      setIsViewerOpen(true)
    }
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const content = contents.find(c => c.id === eventInfo.event.id)
    if (!content) return <div>{eventInfo.event.title}</div>

    const emoji = 
      content.tipo === 'IMAGEN' ? '🖼️' :
      content.tipo === 'VIDEO_LINK' ? '🔗' :
      content.tipo === 'VIDEO_FILE' ? '🎥' :
      '📄'

    return (
      <div className="px-1 py-0.5">
        <span className="mr-1">{emoji}</span>
        <span className="text-xs font-medium">{eventInfo.event.title}</span>
      </div>
    )
  }

  const calendarEvents = contents.map(content => ({
    id: content.id,
    title: content.titulo,
    start: new Date(content.fecha),
    backgroundColor: contentTypeColors[content.tipo] || '#6B7280',
    borderColor: contentTypeColors[content.tipo] || '#6B7280',
    extendedProps: { content }
  }))

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentMonth(now.getMonth() + 1)
    setCurrentYear(now.getFullYear())
  }

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.gotoDate(new Date(currentYear, currentMonth - 1, 1))
    }
  }, [currentMonth, currentYear])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando vista ejecutiva...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso No Disponible</h1>
          <p className="text-gray-600">No se encontró información del cliente para este usuario.</p>
        </div>
      </div>
    )
  }

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Executive */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.nombreEmpresa}</h1>
              <p className="text-gray-600 mt-1">Vista Ejecutiva - Calendario de Contenidos</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                router.push('/login')
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Month Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {contents.length} {contents.length === 1 ? 'contenido' : 'contenidos'} publicados
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
              >
                Hoy
              </button>
              <button
                onClick={handleNextMonth}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            headerToolbar={false}
            events={calendarEvents}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            dayMaxEvents={4}
            moreLinkText={(num: number) => `+${num}`}
            height="auto"
            fixedWeekCount={false}
            showNonCurrentDates={false}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tipos de Contenido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: contentTypeColors.IMAGEN }}></div>
              <span className="text-sm text-gray-600">🖼️ Imágenes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: contentTypeColors.VIDEO_LINK }}></div>
              <span className="text-sm text-gray-600">🔗 Enlaces de Video</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: contentTypeColors.VIDEO_FILE }}></div>
              <span className="text-sm text-gray-600">🎥 Videos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: contentTypeColors.PDF }}></div>
              <span className="text-sm text-gray-600">📄 Documentos PDF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Viewer Modal */}
      {isViewerOpen && selectedContent && (
        <ContentViewerModal
          content={selectedContent}
          onClose={() => {
            setIsViewerOpen(false)
            setSelectedContent(null)
          }}
        />
      )}
    </div>
  )
}

// Executive Content Viewer Modal Component
function ContentViewerModal({ content, onClose }: { content: ContenidoCalendarizado, onClose: () => void }) {
  const renderContent = () => {
    switch (content.tipo) {
      case 'IMAGEN':
        if (content.archivoLocal) {
          return (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={content.archivoLocal}
                alt={content.titulo}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          )
        }
        break

      case 'VIDEO_LINK':
        if (content.urlReferencia) {
          const linkData = getLinkMetadata(content.urlReferencia)

          // Si es embeddable, mostrar iframe
          if (linkData.isEmbeddable && linkData.embedUrl) {
            return (
              <div>
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <iframe
                    src={linkData.embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  📺 Reproduciendo desde {linkData.platform}
                </p>
              </div>
            )
          }

          // Fallback a enlace externo
          return (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <a
                href={content.urlReferencia}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 text-purple-700 hover:text-purple-900 font-medium text-lg"
              >
                <ExternalLink className="w-6 h-6" />
                Abrir en {linkData.platform}
              </a>
            </div>
          )
        }
        break

      case 'VIDEO_FILE':
        if (content.archivoLocal) {
          return (
            <div className="rounded-lg overflow-hidden bg-black">
              <video
                src={content.archivoLocal}
                controls
                className="w-full h-auto max-h-[70vh]"
              >
                Tu navegador no soporta reproducción de video.
              </video>
            </div>
          )
        }
        break

      case 'PDF':
        if (content.archivoLocal) {
          return (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-6xl">📄</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Documento PDF</h4>
                    <p className="text-gray-600 text-sm">Listo para ver o descargar</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={content.archivoLocal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-5 h-5" />
                  Abrir PDF
                </a>
                <a
                  href={content.archivoLocal}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Descargar
                </a>
              </div>
            </div>
          )
        }
        break
    }

    return (
      <div className="p-12 text-center text-gray-500">
        <p>No hay contenido disponible para visualizar</p>
      </div>
    )
  }

  const getDownloadButton = () => {
    if (content.archivoLocal && (content.tipo === 'IMAGEN' || content.tipo === 'VIDEO_FILE')) {
      return (
        <a
          href={content.archivoLocal}
          download
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Descargar
        </a>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{content.titulo}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(content.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getDownloadButton()}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {content.descripcion && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{content.descripcion}</p>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  )
}
