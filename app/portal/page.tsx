'use client'

import { useEffect, useState } from 'react'
import { Calendar, FileText, Image, FileVideo, Link2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
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

export default function PortalPage() {
  const { getToken } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => { fetchCampaigns() }, [])
  useEffect(() => { if (selectedCampaign) fetchContents(selectedCampaign.id) }, [selectedCampaign])

  const fetchCampaigns = async () => {
    setLoading(true)
    const token = getToken()
    try {
      const res = await fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } })
      const cams = (await res.json()).data?.data || []
      setCampaigns(cams)
      if (cams.length > 0) setSelectedCampaign(cams[0])
    } catch {} finally { setLoading(false) }
  }

  const fetchContents = async (campanaId: string) => {
    const token = getToken()
    try {
      const res = await fetch(`/api/contents?campanaId=${campanaId}`, { headers: { Authorization: `Bearer ${token}` } })
      setContents((await res.json()).data?.data || [])
    } catch {}
  }

  const campaignContents = contents

  const monthContents = contents.filter(c => {
    if (!c.fecha) return false
    const d = new Date(c.fecha)
    return d.getFullYear() === year && d.getMonth() === month
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Portal</h1>
          <p className="text-gray-600 mt-1">Revisa el contenido de tus campañas</p>
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
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Campaigns sidebar */}
            <div className="lg:w-72 space-y-3">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide px-1">Mis Campañas</h2>
              {campaigns.map((c: any) => {
                const campaignConts = contents.filter(co => (co.campana_id || co.campanaId) === c.id)
                const approved = campaignConts.filter(co => co.estado === 'APROBADO' || co.estado === 'PUBLICADO').length
                return (
                  <button key={c.id} onClick={() => setSelectedCampaign(c)}
                    className={`w-full text-left rounded-xl p-4 border-2 transition-all ${selectedCampaign?.id === c.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <p className="font-medium text-gray-900 text-sm">{MONTH_NAMES[(c.mes||1)-1]} {c.anio || c.año}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.objetivo_general || c.objetivoGeneral}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        c.estado === 'EN_PROGRESO' ? 'bg-green-100 text-green-700' :
                        c.estado === 'PLANIFICADA' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{c.estado === 'EN_PROGRESO' ? 'En Progreso' : c.estado === 'PLANIFICADA' ? 'Planificada' : c.estado}</span>
                      <span className="text-xs text-gray-400">{approved}/{campaignConts.length} piezas</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Content panel */}
            <div className="flex-1 space-y-4">
              {selectedCampaign && (
                <>
                  <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
                    <h2 className="font-semibold text-gray-900">{MONTH_NAMES[(selectedCampaign.mes||1)-1]} {selectedCampaign.anio || selectedCampaign.año}</h2>
                    <p className="text-gray-600 mt-1">{selectedCampaign.objetivo_general || selectedCampaign.objetivoGeneral}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{campaignContents.length} piezas de contenido</span>
                      <span>{campaignContents.filter(c => c.estado === 'APROBADO' || c.estado === 'PUBLICADO').length} aprobadas</span>
                    </div>
                  </div>

                  {campaignContents.length === 0 ? (
                    <div className="card text-center py-12">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400">No hay contenido para esta campaña aún</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {campaignContents.map((c: any) => {
                        const Icon = TIPO_ICONS[c.tipo] || FileText
                        return (
                          <div key={c.id} className="card hover:shadow-md transition-shadow">
                            {c.tipo === 'IMAGEN' && (c.url_referencia || c.urlReferencia) && (
                              <div className="-mx-6 -mt-6 mb-3 rounded-t-lg overflow-hidden h-48 bg-gray-100">
                                <img src={c.url_referencia || c.urlReferencia} alt={c.titulo}
                                  className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                              </div>
                            )}
                            {(c.tipo === 'VIDEO_FILE' || c.tipo === 'VIDEO_LINK') && (
                              <div className="flex items-center justify-center -mx-6 -mt-6 mb-3 h-36 rounded-t-lg bg-gray-900">
                                <FileVideo className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                              <span className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_LABELS[c.estado] || c.estado}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{c.titulo}</h3>
                            {c.descripcion && <p className="text-sm text-gray-500 mb-2">{c.descripcion}</p>}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                              <span className="text-xs text-gray-400">
                                {c.fecha ? new Date(c.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) : '-'}
                              </span>
                              {(c.url_referencia || c.urlReferencia) && (
                                <a href={c.url_referencia || c.urlReferencia} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                                  <ExternalLink className="w-3 h-3" /> Ver
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

