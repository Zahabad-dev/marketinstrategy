'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, EventContentArg } from '@fullcalendar/core'
import { ContentDetailModal } from '@/components/ContentDetailModal'
import { ContenidoCalendarizado, ContentType } from '@/types'
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react'

// Configuración de colores por tipo de contenido
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6', // Purple
  VIDEO_FILE: '#3B82F6', // Blue
  IMAGEN: '#10B981',     // Green
  PDF: '#EF4444',        // Red
}

interface Campaign {
  id: string
  clienteId: string
  mes: number
  año: number
  objetivoGeneral: string
}

interface Client {
  id: string
  nombreEmpresa: string
}

export default function CalendarPage() {
  const router = useRouter()
  const calendarRef = useRef<FullCalendar>(null)
  
  const [contents, setContents] = useState<ContenidoCalendarizado[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedContent, setSelectedContent] = useState<ContenidoCalendarizado | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    fetchInitialData(token)
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && (selectedCampaign || selectedClient)) {
      fetchContents(token)
    }
  }, [selectedCampaign, selectedClient])

  const fetchInitialData = async (token: string) => {
    try {
      setLoading(true)
      
      // Fetch clients
      const clientsRes = await fetch('/api/clients?perPage=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData.data.data || [])
      }

      // Fetch campaigns
      const campaignsRes = await fetch('/api/campaigns?perPage=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json()
        setCampaigns(campaignsData.data.data || [])
      }

      // Fetch all contents initially
      await fetchContents(token)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContents = async (token: string) => {
    try {
      let url = '/api/contents?perPage=1000'
      
      if (selectedCampaign) {
        url += `&campañaId=${selectedCampaign}`
      }
      
      // If client is selected but not campaign, filter campaigns by client first
      if (selectedClient && !selectedCampaign) {
        const clientCampaigns = campaigns.filter(c => c.clienteId === selectedClient)
        if (clientCampaigns.length > 0) {
          const campaignIds = clientCampaigns.map(c => c.id).join(',')
          // Note: API might not support multiple IDs, fetch all and filter client-side
          url = '/api/contents?perPage=1000'
        }
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        let fetchedContents = data.data.data || []

        // Client-side filtering if needed
        if (selectedClient && !selectedCampaign) {
          const clientCampaignIds = campaigns
            .filter(c => c.clienteId === selectedClient)
            .map(c => c.id)
          
          fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) =>
            clientCampaignIds.includes(content.campañaId)
          )
        }

        setContents(fetchedContents)
      } else if (response.status === 401) {
        router.push('/login')
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
      setIsModalOpen(true)
    }
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const content = contents.find(c => c.id === eventInfo.event.id)
    if (!content) return null

    const typeLabels: Record<ContentType, string> = {
      VIDEO_LINK: '📹',
      VIDEO_FILE: '🎬',
      IMAGEN: '🖼️',
      PDF: '📄',
    }

    return (
      <div className="fc-event-content-wrapper">
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky">
            <span className="mr-1">{typeLabels[content.tipo as ContentType]}</span>
            {eventInfo.event.title}
          </div>
        </div>
      </div>
    )
  }

  const calendarEvents = contents.map(content => ({
    id: content.id,
    title: content.titulo,
    start: content.fecha,
    backgroundColor: contentTypeColors[content.tipo as ContentType],
    borderColor: contentTypeColors[content.tipo as ContentType],
    extendedProps: {
      tipo: content.tipo,
      estado: content.estado,
    },
  }))

  const clearFilters = () => {
    setSelectedCampaign('')
    setSelectedClient('')
  }

  const hasActiveFilters = selectedCampaign || selectedClient

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Calendario de Contenidos</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {(selectedClient ? 1 : 0) + (selectedCampaign ? 1 : 0)}
                  </span>
                )}
              </button>
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ← Dashboard
              </a>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nombreEmpresa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Campaña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaña
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedClient && campaigns.length === 0}
                  >
                    <option value="">Todas las campañas</option>
                    {(selectedClient
                      ? campaigns.filter(c => c.clienteId === selectedClient)
                      : campaigns
                    ).map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.objetivoGeneral} ({campaign.mes}/{campaign.año})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón limpiar */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Leyenda de colores */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tipos de Contenido</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: contentTypeColors.IMAGEN }}
              />
              <span className="text-sm text-gray-600">🖼️ Imagen</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: contentTypeColors.VIDEO_LINK }}
              />
              <span className="text-sm text-gray-600">📹 Video Link</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: contentTypeColors.VIDEO_FILE }}
              />
              <span className="text-sm text-gray-600">🎬 Video File</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: contentTypeColors.PDF }}
              />
              <span className="text-sm text-gray-600">📄 PDF</span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              Cargando calendario...
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              eventDisplay="block"
              displayEventTime={false}
              dayMaxEvents={3}
              moreLinkText={(num: number) => `+${num} más`}
            />
          )}
        </div>

        {/* Estadísticas */}
        {!loading && contents.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{contents.length}</div>
                <div className="text-sm text-gray-600">Total contenidos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {contents.filter(c => c.tipo === 'IMAGEN').length}
                </div>
                <div className="text-sm text-gray-600">Imágenes</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {contents.filter(c => c.tipo === 'VIDEO_LINK' || c.tipo === 'VIDEO_FILE').length}
                </div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {contents.filter(c => c.tipo === 'PDF').length}
                </div>
                <div className="text-sm text-gray-600">PDFs</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de detalles */}
      <ContentDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedContent(null)
        }}
        content={selectedContent}
      />
    </div>
  )
}
