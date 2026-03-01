'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, EventContentArg, DateSelectArg } from '@fullcalendar/core'
import { ContentDetailModal } from '@/components/ContentDetailModal'
import { 
  ContenidoCalendarizado, 
  ContentType, 
  Campaign, 
  Client,
  ContentStatus,
  CampaignStatus 
} from '@/types'
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon,
  Building2,
  FolderKanban,
  ChevronDown,
  X
} from 'lucide-react'
import { AddClientModal } from '@/components/AddClientModal'
import { AddCampaignModal } from '@/components/AddCampaignModal'
import { AddContentModal } from '@/components/AddContentModal'
import { EditContentModal } from '@/components/EditContentModal'

// Color configuration by content type
const contentTypeColors = {
  VIDEO_LINK: '#8B5CF6', // Purple
  VIDEO_FILE: '#3B82F6', // Blue
  IMAGEN: '#10B981',     // Green
  PDF: '#EF4444',        // Red
}

export default function DashboardPage() {
  const { user, isAdmin, isEditor, loading: authLoading } = useAuth()
  const calendarRef = useRef<FullCalendar>(null)
  
  // Data states
  const [contents, setContents] = useState<ContenidoCalendarizado[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  // Selection states
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  // Modal states
  const [selectedContent, setSelectedContent] = useState<ContenidoCalendarizado | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false)
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchInitialData()
    }
  }, [authLoading, user])

  useEffect(() => {
    if (user && (selectedCampaign || selectedClient || selectedMonth !== new Date().getMonth() + 1 || selectedYear !== new Date().getFullYear())) {
      fetchContents()
    }
  }, [selectedCampaign, selectedClient, selectedMonth, selectedYear])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      if (!token) return

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

      // Fetch contents
      await fetchContents()
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      let url = '/api/contents?perPage=1000'
      
      if (selectedCampaign) {
        url += `&campañaId=${selectedCampaign}`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        let fetchedContents = data.data.data || []

        // Filter by client if selected
        if (selectedClient && !selectedCampaign) {
          const clientCampaignIds = campaigns
            .filter(c => c.clienteId === selectedClient)
            .map(c => c.id)
          
          fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) =>
            clientCampaignIds.includes(content.campañaId)
          )
        }

        // Filter by month/year
        fetchedContents = fetchedContents.filter((content: ContenidoCalendarizado) => {
          const contentDate = new Date(content.fecha)
          return contentDate.getMonth() + 1 === selectedMonth && contentDate.getFullYear() === selectedYear
        })

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
      setIsDetailModalOpen(true)
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (isEditor() || isAdmin()) {
      setSelectedDate(selectInfo.start)
      setIsAddContentModalOpen(true)
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
      <div className="px-1">
        <span className="mr-1">{emoji}</span>
        <span className="text-xs">{eventInfo.event.title}</span>
      </div>
    )
  }

  // Map contents to FullCalendar events
  const calendarEvents = contents.map(content => ({
    id: content.id,
    title: content.titulo,
    start: new Date(content.fecha),
    backgroundColor: contentTypeColors[content.tipo] || '#6B7280',
    borderColor: contentTypeColors[content.tipo] || '#6B7280',
    extendedProps: {
      content
    }
  }))

  // Get filtered campaigns for selector
  const filteredCampaigns = selectedClient
    ? campaigns.filter(c => c.clienteId === selectedClient && c.mes === selectedMonth && c.año === selectedYear)
    : campaigns.filter(c => c.mes === selectedMonth && c.año === selectedYear)

  const clearFilters = () => {
    setSelectedClient('')
    setSelectedCampaign('')
    setSelectedMonth(new Date().getMonth() + 1)
    setSelectedYear(new Date().getFullYear())
  }

  // Update calendar date when month/year changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.gotoDate(new Date(selectedYear, selectedMonth - 1, 1))
    }
  }, [selectedMonth, selectedYear])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Gestión de contenido de marketing</p>
            </div>
            
            <div className="flex gap-3">
              {isAdmin() && (
                <>
                  <button
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Nuevo Cliente</span>
                  </button>
                  <button
                    onClick={() => setIsAddCampaignModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Nueva Campaña</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Client Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value)
                  setSelectedCampaign('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los clientes</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nombreEmpresa}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaña
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedClient && filteredCampaigns.length === 0}
              >
                <option value="">Todas las campañas</option>
                {filteredCampaigns.map(campaign => {
                  const client = clients.find(c => c.id === campaign.clienteId)
                  return (
                    <option key={campaign.id} value={campaign.id}>
                      {client?.nombreEmpresa} - {campaign.objetivoGeneral}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Month Selector */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedClient || selectedCampaign || selectedMonth !== new Date().getMonth() + 1 || selectedYear !== new Date().getFullYear()) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
              >
                <X className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Calendar */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              headerToolbar={{
                left: 'title',
                center: '',
                right: 'today prev,next'
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              selectable={isEditor() || isAdmin()}
              select={handleDateSelect}
              eventContent={renderEventContent}
              dayMaxEvents={3}
              moreLinkText={(num: number) => `+${num} más`}
              height="auto"
              buttonText={{
                today: 'Hoy'
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedContent(null)
        }}
        content={selectedContent}
        canEdit={isEditor() || isAdmin()}
        onEdit={() => {
          setIsDetailModalOpen(false)
          setIsEditModalOpen(true)
        }}
      />

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedContent(null)
        }}
        onSuccess={() => {
          fetchContents()
        }}
        content={selectedContent}
      />

      <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => {
          setIsAddContentModalOpen(false)
          setSelectedDate(null)
        }}
        onSuccess={() => {
          fetchContents()
        }}
        selectedDate={selectedDate}
        preselectedCampaign={selectedCampaign}
        preselectedClient={selectedClient}
      />

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={() => {
          fetchInitialData()
        }}
      />

      <AddCampaignModal
        isOpen={isAddCampaignModalOpen}
        onClose={() => setIsAddCampaignModalOpen(false)}
        onSuccess={() => {
          fetchInitialData()
        }}
        preselectedClient={selectedClient}
        preselectedMonth={selectedMonth}
        preselectedYear={selectedYear}
      />
    </div>
  )
}
