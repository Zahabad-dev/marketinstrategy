'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Edit, X, Upload, Link2, Image, FileVideo, FileText, ExternalLink, Calendar, ChevronDown, ChevronUp, MessageSquare, Send, Trash } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const TIPO_ICONS: Record<string, any> = {
  IMAGEN: Image, IMAGEN_LINK: Link2, VIDEO_FILE: FileVideo, VIDEO_LINK: Link2, PDF: FileText,
}
const TIPO_LABELS: Record<string, string> = {
  IMAGEN: 'Imagen', IMAGEN_LINK: 'Imagen (enlace)', VIDEO_FILE: 'Video (archivo)', VIDEO_LINK: 'Video (enlace)', PDF: 'PDF',
}
const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-green-100 text-green-800',
  PUBLICADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
}
const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_REVISION: 'En Revisión', APROBADO: 'Aprobado', PUBLICADO: 'Publicado', RECHAZADO: 'Rechazado',
}
const EMPTY_FORM = {
  campanaId: '', titulo: '', descripcion: '', tipo: 'IMAGEN' as string,
  urlReferencia: '', fecha: new Date().toISOString().split('T')[0], estado: 'PENDIENTE',
  copy: '', copyV2: '', guion: '', guionV2: '',
}

export default function ContentPage() {
  const { getToken, isAdmin, isEditor } = useAuth()
  const [contents, setContents] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCampaign, setFilterCampaign] = useState('')
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [editId, setEditId] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadPreview, setUploadPreview] = useState<string|null>(null)
  const [imageInputMode, setImageInputMode] = useState<'upload'|'url'>('upload')
  const [showCopyV2, setShowCopyV2] = useState(false)
  const [showGuionV2, setShowGuionV2] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Chat state
  const [chatContent, setChatContent] = useState<any|null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLink, setChatLink] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const canManage = () => isAdmin() || isEditor()

  useEffect(() => { fetchData() }, [filterCampaign])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: `Bearer ${token}` }
    try {
      const [coRes, caRes, clRes] = await Promise.all([
        fetch(`/api/contents?perPage=500${filterCampaign ? '&campanaId=' + filterCampaign : ''}`, { headers: h }),
        fetch('/api/campaigns?perPage=200', { headers: h }),
        fetch('/api/clients?perPage=200', { headers: h }),
      ])
      const items: any[] = (await coRes.json()).data?.data || []
      setContents(items)
      // Auto-expand the first (nearest) date group
      const dates = [...new Set(items.map((c: any) => c.fecha ? c.fecha.split('T')[0] : '').filter(Boolean))].sort()
      if (dates.length > 0) setExpandedDates(new Set([dates[0]]))
      setCampaigns((await caRes.json()).data?.data || [])
      setClients((await clRes.json()).data?.data || [])
      // Load comment counts for all items
      if (items.length > 0) {
        const counts: Record<string, number> = {}
        await Promise.all(items.map(async (item: any) => {
          try {
            const r = await fetch(`/api/content-comments?contentId=${item.id}`, { headers: h })
            const d = await r.json()
            counts[item.id] = (d.data || []).length
          } catch { counts[item.id] = 0 }
        }))
        setCommentCounts(counts)
      }
    } catch {} finally { setLoading(false) }
  }

  const openChat = async (c: any) => {
    setChatContent(c)
    setChatInput('')
    setChatLink('')
    const token = getToken()
    const r = await fetch(`/api/content-comments?contentId=${c.id}`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await r.json()
    setChatMessages(d.data || [])
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !chatContent) return
    setChatSending(true)
    const token = getToken()
    const r = await fetch('/api/content-comments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: chatContent.id, message: chatInput, linkUrl: chatLink }),
    })
    if (r.ok) {
      const d = await r.json()
      setChatMessages(prev => [...prev, d.data])
      setChatInput('')
      setChatLink('')
      setCommentCounts(prev => ({ ...prev, [chatContent.id]: (prev[chatContent.id] || 0) + 1 }))
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setChatSending(false)
  }

  const deleteMessage = async (msgId: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return
    const token = getToken()
    await fetch(`/api/content-comments/${msgId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setChatMessages(prev => prev.filter(m => m.id !== msgId))
    if (chatContent) setCommentCounts(prev => ({ ...prev, [chatContent.id]: Math.max(0, (prev[chatContent.id] || 1) - 1) }))
  }

  const formatChatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const campaignLabel = (c: any) => {
    const cl = clients.find((cl: any) => cl.id === (c.cliente_id || c.clienteId))
    const name = cl?.nombre_empresa || 'Cliente'
    return `${name} — ${c.mes}/${c.anio || c.año}`
  }

  const openCreate = () => { setForm({ ...EMPTY_FORM, campanaId: filterCampaign }); setEditId(null); setError(''); setUploadPreview(null); setImageInputMode('upload'); setModal('create') }
  const openEdit = (c: any) => {
    const copyVal = c.copy || ''
    const copyV2Val = c.copy_v2 || c.copyV2 || ''
    const guionVal = c.guion || ''
    const guionV2Val = c.guion_v2 || c.guionV2 || ''
    setForm({ campanaId: c.campana_id || c.campanaId || '', titulo: c.titulo, descripcion: c.descripcion || '',
      tipo: c.tipo, urlReferencia: c.url_referencia || c.urlReferencia || '',
      fecha: c.fecha ? c.fecha.split('T')[0] : '', estado: c.estado || 'PENDIENTE',
      copy: copyVal, copyV2: copyV2Val, guion: guionVal, guionV2: guionV2Val })
    setShowCopyV2(!!copyV2Val)
    setShowGuionV2(!!guionV2Val)
    setEditId(c.id); setError(''); setUploadPreview(null)
    // If editing an image with an existing URL, default to url mode
    setImageInputMode((c.url_referencia || c.urlReferencia) ? 'url' : 'upload')
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setUploadPreview(null); setShowCopyV2(false); setShowGuionV2(false) }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const token = getToken()
      const type = file.type.startsWith('video') ? 'VIDEO_FILE' : file.type === 'application/pdf' ? 'PDF' : 'IMAGEN'
      setForm((f: any) => ({ ...f, tipo: type }))
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`/api/contents/upload?type=${type}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al subir'); return }
      const data = await res.json()
      setForm((f: any) => ({ ...f, archivoLocal: data.data.filename, urlReferencia: data.data.publicUrl }))
      if (type === 'IMAGEN') setUploadPreview(data.data.publicUrl)
    } catch { setError('Error al subir archivo') } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.campanaId) { setError('Selecciona una campaña'); return }
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    setSaving(true); setError('')
    try {
      const token = getToken()
      // IMAGEN_LINK is a UI-only type; save as IMAGEN in the database
      const tipoDb = form.tipo === 'IMAGEN_LINK' ? 'IMAGEN' : form.tipo
      const body = { campanaId: form.campanaId, titulo: form.titulo, descripcion: form.descripcion,
        tipo: tipoDb, urlReferencia: form.urlReferencia, fecha: form.fecha, estado: form.estado,
        copy: form.copy || null, copyV2: form.copyV2 || null,
        guion: form.guion || null, guionV2: form.guionV2 || null }
      const res = await fetch(modal === 'edit' ? `/api/contents/${editId}` : '/api/contents', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      closeModal(); fetchData()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contenido?')) return
    const token = getToken()
    await fetch(`/api/contents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchData()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contenido</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona imágenes, videos y referencias de campaña</p>
          </div>
          {canManage() && (
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Nuevo Contenido
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="card !py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrar por campaña:</label>
            <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)} className="input sm:max-w-xs">
              <option value="">Todas las campañas</option>
              {campaigns.map((c: any) => <option key={c.id} value={c.id}>{campaignLabel(c)}</option>)}
            </select>
          </div>
        </div>

        {/* Content grouped by date */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : contents.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No hay contenido registrado</p>
            {canManage() && <button onClick={openCreate} className="btn btn-primary">Agregar primer contenido</button>}
          </div>
        ) : (() => {
          // Group by date
          const grouped: Record<string, any[]> = {}
          contents.forEach((c: any) => {
            const key = c.fecha ? c.fecha.split('T')[0] : 'sin-fecha'
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(c)
          })
          const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

          const toggleDate = (date: string) => {
            setExpandedDates(prev => {
              const next = new Set(prev)
              next.has(date) ? next.delete(date) : next.add(date)
              return next
            })
          }

          const formatDate = (dateStr: string) => {
            if (dateStr === 'sin-fecha') return 'Sin fecha'
            const d = new Date(dateStr + 'T12:00:00')
            return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              .replace(/^\w/, c => c.toUpperCase())
          }

          return (
            <div className="space-y-3">
              {sortedDates.map(dateKey => {
                const items = grouped[dateKey]
                const isOpen = expandedDates.has(dateKey)
                return (
                  <div key={dateKey} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Accordion header */}
                    <button
                      onClick={() => toggleDate(dateKey)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                        <span className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(dateKey)}</span>
                        <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          {items.length} pieza{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status summary dots */}
                        <div className="hidden sm:flex items-center gap-1">
                          {(['PENDIENTE','EN_REVISION','APROBADO','PUBLICADO'] as const).map(s => {
                            const n = items.filter((c: any) => c.estado === s).length
                            if (!n) return null
                            return (
                              <span key={s} className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${STATUS_COLORS[s]}`}>
                                {n} {STATUS_LABELS[s]}
                              </span>
                            )
                          })}
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* Accordion body */}
                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((c: any) => {
                            const Icon = TIPO_ICONS[c.tipo] || FileText
                            const campaign = campaigns.find((cam: any) => cam.id === (c.campana_id || c.campanaId))
                            return (
                              <div key={c.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Preview */}
                                {c.tipo === 'IMAGEN' && (
                                  <div className="relative h-36 bg-gray-100">
                                    {(c.url_referencia || c.urlReferencia) ? (
                                      <img src={c.url_referencia || c.urlReferencia} alt={c.titulo}
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                                    ) : null}
                                    <div className="absolute inset-0 flex-col items-center justify-center bg-gray-100"
                                      style={{display: (c.url_referencia || c.urlReferencia) ? 'none' : 'flex'}}>
                                      <Image className="w-8 h-8 text-gray-400" />
                                      <span className="text-xs text-gray-400 mt-1">Sin imagen</span>
                                    </div>
                                  </div>
                                )}
                                {(c.tipo === 'VIDEO_LINK' || c.tipo === 'VIDEO_FILE') && (
                                  <div className="flex items-center justify-center h-28 bg-gray-900">
                                    <FileVideo className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="text-xs text-gray-400 truncate">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                                    </div>
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
                                      {STATUS_LABELS[c.estado] || c.estado}
                                    </span>
                                  </div>
                                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{c.titulo}</h3>
                                  {c.descripcion && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{c.descripcion}</p>}
                                  {campaign && (
                                    <p className="text-xs text-gray-400 truncate mb-2">{campaignLabel(campaign)}</p>
                                  )}
                                  <div className="flex items-center justify-between gap-1 flex-wrap">
                                    {(c.url_referencia || c.urlReferencia) && (
                                      <a href={c.url_referencia || c.urlReferencia} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                                        <ExternalLink className="w-3 h-3" /> Ver archivo
                                      </a>
                                    )}
                                    <div className="flex gap-1 ml-auto">
                                      <button onClick={() => openChat(c)}
                                        className="relative p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                        title="Chat de trabajo">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {(commentCounts[c.id] || 0) > 0 && (
                                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                            {commentCounts[c.id] > 9 ? '9+' : commentCounts[c.id]}
                                          </span>
                                        )}
                                      </button>
                                      {canManage() && (
                                        <>
                                          <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{modal === 'create' ? 'Nuevo Contenido' : 'Editar Contenido'}</h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaña *</label>
                <select value={form.campanaId} onChange={(e) => setForm((f: any) => ({ ...f, campanaId: e.target.value }))} className="input">
                  <option value="">Seleccionar campaña...</option>
                  {campaigns.map((c: any) => <option key={c.id} value={c.id}>{campaignLabel(c)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={form.titulo} onChange={(e) => setForm((f: any) => ({ ...f, titulo: e.target.value }))} className="input" placeholder="Ej: Post de lanzamiento" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.descripcion} rows={3} onChange={(e) => setForm((f: any) => ({ ...f, descripcion: e.target.value }))} className="input resize-none" placeholder="Descripción del contenido, instrucciones, notas..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => {
                    const t = e.target.value
                    setForm((f: any) => ({ ...f, tipo: t, urlReferencia: '' }))
                    setUploadPreview(null)
                    setImageInputMode(t === 'IMAGEN_LINK' ? 'url' : 'upload')
                  }} className="input">
                    {Object.entries(TIPO_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha programada *</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm((f: any) => ({ ...f, fecha: e.target.value }))} className="input" />
                </div>
              </div>

              {/* Upload or Link */}
              {(form.tipo === 'IMAGEN' || form.tipo === 'IMAGEN_LINK') ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                  {/* Mode toggle — only show for IMAGEN (not IMAGEN_LINK which is always URL) */}
                  {form.tipo === 'IMAGEN' && (
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3">
                    <button type="button"
                      onClick={() => { setImageInputMode('upload'); setForm((f: any) => ({ ...f, urlReferencia: '' })); setUploadPreview(null) }}
                      className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                        imageInputMode === 'upload' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}>
                      Subir archivo
                    </button>
                    <button type="button"
                      onClick={() => { setImageInputMode('url'); setUploadPreview(null) }}
                      className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                        imageInputMode === 'url' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}>
                      Enlace URL
                    </button>
                  </div>
                  )}

                  {(imageInputMode === 'upload' && form.tipo === 'IMAGEN') ? (
                    <>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}
                        onClick={() => fileRef.current?.click()}
                      >
                        {uploading ? (
                          <p className="text-sm text-gray-500">Subiendo...</p>
                        ) : uploadPreview ? (
                          <img src={uploadPreview} className="max-h-32 mx-auto rounded" alt="preview" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Arrastra un archivo o <span className="text-primary-600">haz clic para seleccionar</span></p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP</p>
                          </>
                        )}
                        <input ref={fileRef} type="file" className="hidden" accept="image/*"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                      </div>
                      {form.urlReferencia && !uploadPreview && (
                        <p className="text-xs text-gray-500 mt-1 truncate">Archivo: {form.urlReferencia}</p>
                      )}
                    </>
                  ) : (
                    // URL mode (always for IMAGEN_LINK, toggle for IMAGEN)
                    <>
                      <div className="flex gap-2">
                        <Link2 className="w-5 h-5 text-gray-400 mt-2.5 shrink-0" />
                        <input type="url" value={form.urlReferencia}
                          onChange={(e) => setForm((f: any) => ({ ...f, urlReferencia: e.target.value }))}
                          className="input flex-1" placeholder="https://drive.google.com/... o https://i.imgur.com/..." />
                      </div>
                      {form.urlReferencia && (
                        <div className="mt-2">
                          <img src={form.urlReferencia} alt="preview"
                            className="max-h-32 rounded border border-gray-200"
                            onError={(e: any) => e.target.style.display='none'}
                            onLoad={(e: any) => e.target.style.display='block'} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (form.tipo === 'VIDEO_FILE' || form.tipo === 'PDF') ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archivo</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <p className="text-sm text-gray-500">Subiendo...</p>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Arrastra un archivo o <span className="text-primary-600">haz clic para seleccionar</span></p>
                        <p className="text-xs text-gray-400 mt-1">
                          {form.tipo === 'PDF' ? 'PDF' : 'MP4, MOV, AVI'}
                        </p>
                      </>
                    )}
                    <input ref={fileRef} type="file" className="hidden"
                      accept={form.tipo === 'PDF' ? 'application/pdf' : 'video/*'}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                  </div>
                  {form.urlReferencia && (
                    <p className="text-xs text-gray-500 mt-1 truncate">Archivo: {form.urlReferencia}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de referencia</label>
                  <div className="flex gap-2">
                    <Link2 className="w-5 h-5 text-gray-400 mt-2.5 shrink-0" />
                    <input type="url" value={form.urlReferencia} onChange={(e) => setForm((f: any) => ({ ...f, urlReferencia: e.target.value }))}
                      className="input flex-1" placeholder="https://youtube.com/..." />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.estado} onChange={(e) => setForm((f: any) => ({ ...f, estado: e.target.value }))} className="input">
                  {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Copy <span className="text-xs text-gray-400 font-normal">(texto de la publicación)</span>
                  </label>
                  {!showCopyV2 && (
                    <button type="button" onClick={() => setShowCopyV2(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      + Versión 2
                    </button>
                  )}
                </div>
                <textarea value={form.copy} rows={4}
                  onChange={(e) => setForm((f: any) => ({ ...f, copy: e.target.value }))}
                  className="input resize-none" placeholder="Escribe el texto que acompañará la publicación..." />
                {showCopyV2 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-600">Copy — Versión 2</label>
                      <button type="button" onClick={() => { setShowCopyV2(false); setForm((f: any) => ({ ...f, copyV2: '' })) }}
                        className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                    </div>
                    <textarea value={form.copyV2} rows={4}
                      onChange={(e) => setForm((f: any) => ({ ...f, copyV2: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                      placeholder="Versión alternativa del copy..." />
                  </div>
                )}
              </div>

              {/* Guión */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Guión <span className="text-xs text-gray-400 font-normal">(guion del contenido)</span>
                  </label>
                  {!showGuionV2 && (
                    <button type="button" onClick={() => setShowGuionV2(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      + Versión 2
                    </button>
                  )}
                </div>
                <textarea value={form.guion} rows={4}
                  onChange={(e) => setForm((f: any) => ({ ...f, guion: e.target.value }))}
                  className="input resize-none" placeholder="Escribe el guión o instrucciones del contenido..." />
                {showGuionV2 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-600">Guión — Versión 2</label>
                      <button type="button" onClick={() => { setShowGuionV2(false); setForm((f: any) => ({ ...f, guionV2: '' })) }}
                        className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                    </div>
                    <textarea value={form.guionV2} rows={4}
                      onChange={(e) => setForm((f: any) => ({ ...f, guionV2: e.target.value }))}
                      className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
                      placeholder="Versión alternativa del guión..." />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={closeModal} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving || uploading} className="btn btn-primary">
                {saving ? 'Guardando...' : modal === 'create' ? 'Crear Contenido' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat slide-over */}
      {chatContent && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => setChatContent(null)} />
          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b bg-gray-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Chat de Trabajo</span>
                </div>
                <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{chatContent.titulo}</h2>
                {chatContent.fecha && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(chatContent.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button onClick={() => setChatContent(null)} className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">Sin mensajes aún</p>
                  <p className="text-xs text-gray-300 mt-1">Escribe el primer comentario o solicitud de cambio</p>
                </div>
              ) : chatMessages.map((msg: any) => (
                <div key={msg.id} className="group flex gap-2.5">
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    msg.user_rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {(msg.user_nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-gray-800">{msg.user_nombre}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                        msg.user_rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>{msg.user_rol}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{formatChatTime(msg.created_at)}</span>
                      {isAdmin() && (
                        <button onClick={() => deleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all">
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {msg.message}
                    </div>
                    {msg.link_url && (
                      <a href={msg.link_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline break-all">
                        <Link2 className="w-3 h-3 shrink-0" />
                        {msg.link_url.length > 50 ? msg.link_url.slice(0, 50) + '…' : msg.link_url}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            {canManage() ? (
              <div className="border-t px-4 py-3 bg-white space-y-2">
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Escribe un cambio, instrucción o comentario… (Enter para enviar)"
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  rows={2}
                />
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="url"
                      value={chatLink}
                      onChange={e => setChatLink(e.target.value)}
                      placeholder="Enlace de referencia (opcional)"
                      className="text-xs bg-transparent flex-1 outline-none text-gray-600 placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={chatSending || !chatInput.trim()}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Shift+Enter para nueva línea</p>
              </div>
            ) : (
              <div className="border-t px-4 py-3 text-xs text-gray-400 text-center">Solo admins y editores pueden escribir mensajes</div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}

