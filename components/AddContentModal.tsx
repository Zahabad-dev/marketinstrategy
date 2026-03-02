'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Campaign, Client, ContentType, ContentStatus } from '@/types'
import { Upload, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react'
import { getLinkMetadata, type LinkMetadata } from '@/lib/link-detector'

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedDate?: Date | null
  preselectedCampaign?: string
  preselectedClient?: string
}

export function AddContentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  selectedDate = null,
  preselectedCampaign = '',
  preselectedClient = ''
}: AddContentModalProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  
  const [campañaId, setCampañaId] = useState(preselectedCampaign)
  const [clienteId, setClienteId] = useState(preselectedClient)
  const [fecha, setFecha] = useState(selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<ContentType>(ContentType.IMAGEN)
  const [urlReferencia, setUrlReferencia] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [linkPreview, setLinkPreview] = useState<LinkMetadata | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    setCampañaId(preselectedCampaign)
  }, [preselectedCampaign])

  useEffect(() => {
    setClienteId(preselectedClient)
  }, [preselectedClient])

  useEffect(() => {
    if (selectedDate) {
      setFecha(selectedDate.toISOString().split('T')[0])
    }
  }, [selectedDate])

  // Detectar preview de link cuando cambia la URL
  useEffect(() => {
    if (tipo === ContentType.VIDEO_LINK && urlReferencia && urlReferencia.length > 10) {
      try {
        const metadata = getLinkMetadata(urlReferencia)
        setLinkPreview(metadata)
      } catch (error) {
        setLinkPreview(null)} 
    } else {
      setLinkPreview(null)
    }
  }, [urlReferencia, tipo])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      // Fetch clients
      const clientsRes = await fetch('/api/clients?perPage=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData.data.data || [])
      }

      // Fetch campaigns
      const campaignsRes = await fetch('/api/campaigns?perPage=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json()
        setCampaigns(campaignsData.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tipo', tipo)

      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/contents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir archivo')
      }

      const data = await response.json()
      return data.data.publicUrl
    } catch (err: any) {
      throw new Error(`Error al subir archivo: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      // Upload file if selected
      let archivoLocal: string | undefined
      if (file && (tipo === ContentType.IMAGEN || tipo === ContentType.VIDEO_FILE || tipo === ContentType.PDF)) {
        archivoLocal = await uploadFile() || undefined
      }

      // Create content
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campañaId,
          fecha,
          titulo,
          descripcion: descripcion || undefined,
          tipo,
          urlReferencia: tipo === ContentType.VIDEO_LINK ? urlReferencia : undefined,
          archivoLocal,
          estado: ContentStatus.PENDIENTE
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear contenido')
      }

      // Reset form
      resetForm()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCampañaId(preselectedCampaign)
    setClienteId(preselectedClient)
    setFecha(selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    setTitulo('')
    setDescripcion('')
    setTipo(ContentType.IMAGEN)
    setUrlReferencia('')
    setFile(null)
    setLinkPreview(null)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Filter campaigns by selected client
  const filteredCampaigns = clienteId
    ? campaigns.filter(c => c.clienteId === clienteId)
    : campaigns

  const needsFile = tipo === ContentType.IMAGEN || tipo === ContentType.VIDEO_FILE || tipo === ContentType.PDF
  const needsURL = tipo === ContentType.VIDEO_LINK

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Contenido">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Client Selector (to filter campaigns) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value)
              setCampañaId('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione un cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nombreEmpresa}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaña *
          </label>
          <select
            value={campañaId}
            onChange={(e) => setCampañaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!clienteId && filteredCampaigns.length === 0}
          >
            <option value="">Seleccione una campaña</option>
            {filteredCampaigns.map(campaign => {
              const client = clients.find(c => c.id === campaign.clienteId)
              return (
                <option key={campaign.id} value={campaign.id}>
                  {client?.nombreEmpresa} - {campaign.objetivoGeneral} ({campaign.mes}/{campaign.anio})
                </option>
              )
            })}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <Input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del contenido"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del contenido"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Contenido *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo(ContentType.IMAGEN)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                tipo === ContentType.IMAGEN
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">Imagen</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo(ContentType.VIDEO_LINK)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                tipo === ContentType.VIDEO_LINK
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="font-medium">Video Link</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo(ContentType.VIDEO_FILE)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                tipo === ContentType.VIDEO_FILE
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Video File</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo(ContentType.PDF)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                tipo === ContentType.PDF
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">PDF</span>
            </button>
          </div>
        </div>

        {/* URL for Video Links */}
        {needsURL && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Video *
            </label>
            <Input
              type="url"
              value={urlReferencia}
              onChange={(e) => setUrlReferencia(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required={needsURL}
            />
            <p className="text-xs text-gray-500 mt-1">
              Soporta YouTube, Vimeo, TikTok, Google Drive y otros enlaces
            </p>
            {linkPreview && (
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  {linkPreview.isEmbeddable ? (
                    <span className="text-green-700 font-semibold">✓ {linkPreview.platform} detectado - Video embeddable</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">⚠ {linkPreview.platform} - Enlace directo</span>
                  )}
                </div>
                {linkPreview.thumbnail && (
                  <img src={linkPreview.thumbnail} alt="Preview" className="mt-2 rounded shadow-sm w-full max-w-xs" />
                )}
              </div>
            )}
          </div>
        )}

        {/* File Upload for Images, Videos, PDFs */}
        {needsFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept={
                tipo === ContentType.IMAGEN 
                  ? 'image/*' 
                  : tipo === ContentType.VIDEO_FILE
                  ? 'video/*'
                  : '.pdf'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={needsFile}
            />
            {file && (
              <p className="text-xs text-gray-600 mt-1">
                Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || uploading}
            className="flex-1"
          >
            {uploading ? 'Subiendo archivo...' : loading ? 'Creando...' : 'Crear Contenido'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
