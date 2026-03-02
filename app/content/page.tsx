'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Edit, X, Upload, Link2, Image, FileVideo, FileText, ExternalLink, Calendar } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const TIPO_ICONS: Record<string, any> = {
  IMAGEN: Image, VIDEO_FILE: FileVideo, VIDEO_LINK: Link2, PDF: FileText,
}
const TIPO_LABELS: Record<string, string> = {
  IMAGEN: 'Imagen', VIDEO_FILE: 'Video (archivo)', VIDEO_LINK: 'Video (enlace)', PDF: 'PDF',
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
}

export default function ContentPage() {
  const { getToken, isAdmin, isEditor } = useAuth()
  const [contents, setContents] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCampaign, setFilterCampaign] = useState('')
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [editId, setEditId] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadPreview, setUploadPreview] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canManage = () => isAdmin() || isEditor()

  useEffect(() => { fetchData() }, [filterCampaign])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: `Bearer ${token}` }
    try {
      const [coRes, caRes, clRes] = await Promise.all([
        fetch(`/api/contents${filterCampaign ? '?campanaId=' + filterCampaign : ''}`, { headers: h }),
        fetch('/api/campaigns', { headers: h }),
        fetch('/api/clients', { headers: h }),
      ])
      setContents((await coRes.json()).data?.data || [])
      setCampaigns((await caRes.json()).data?.data || [])
      setClients((await clRes.json()).data?.data || [])
    } catch {} finally { setLoading(false) }
  }

  const campaignLabel = (c: any) => {
    const cl = clients.find((cl: any) => cl.id === (c.cliente_id || c.clienteId))
    const name = cl?.nombre_empresa || 'Cliente'
    return `${name} — ${c.mes}/${c.anio || c.año}`
  }

  const openCreate = () => { setForm({ ...EMPTY_FORM, campanaId: filterCampaign }); setEditId(null); setError(''); setUploadPreview(null); setModal('create') }
  const openEdit = (c: any) => {
    setForm({ campanaId: c.campana_id || c.campanaId || '', titulo: c.titulo, descripcion: c.descripcion || '',
      tipo: c.tipo, urlReferencia: c.url_referencia || c.urlReferencia || '',
      fecha: c.fecha ? c.fecha.split('T')[0] : '', estado: c.estado || 'PENDIENTE' })
    setEditId(c.id); setError(''); setUploadPreview(null); setModal('edit')
  }
  const closeModal = () => { setModal(null); setUploadPreview(null) }

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
      const body = { campanaId: form.campanaId, titulo: form.titulo, descripcion: form.descripcion,
        tipo: form.tipo, urlReferencia: form.urlReferencia, fecha: form.fecha, estado: form.estado }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contenido</h1>
            <p className="text-gray-600 mt-1">Gestiona imágenes, videos y referencias de campaña</p>
          </div>
          {canManage() && (
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Contenido
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="card py-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrar por campaña:</label>
            <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)} className="input max-w-xs">
              <option value="">Todas las campañas</option>
              {campaigns.map((c: any) => <option key={c.id} value={c.id}>{campaignLabel(c)}</option>)}
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : contents.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No hay contenido registrado</p>
            {canManage() && <button onClick={openCreate} className="btn btn-primary">Agregar primer contenido</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((c: any) => {
              const Icon = TIPO_ICONS[c.tipo] || FileText
              const campaign = campaigns.find((cam: any) => cam.id === (c.campana_id || c.campanaId))
              return (
                <div key={c.id} className="card hover:shadow-md transition-shadow">
                  {/* Preview */}
                  {c.tipo === 'IMAGEN' && (c.url_referencia || c.urlReferencia) && (
                    <div className="relative mb-3 -mx-6 -mt-6 rounded-t-lg overflow-hidden h-40 bg-gray-100">
                      <img src={c.url_referencia || c.urlReferencia} alt={c.titulo}
                        className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                    </div>
                  )}
                  {(c.tipo === 'VIDEO_LINK' || c.tipo === 'VIDEO_FILE') && (
                    <div className="flex items-center justify-center h-32 -mx-6 -mt-6 mb-3 bg-gray-900 rounded-t-lg">
                      <FileVideo className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-500">{TIPO_LABELS[c.tipo] || c.tipo}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[c.estado] || c.estado}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{c.titulo}</h3>
                  {c.descripcion && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{c.descripcion}</p>}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    {c.fecha ? new Date(c.fecha).toLocaleDateString('es-MX') : '-'}
                  </div>
                  {campaign && (
                    <p className="text-xs text-gray-400 truncate">{campaignLabel(campaign)}</p>
                  )}
                  {(c.url_referencia || c.urlReferencia) && (
                    <a href={c.url_referencia || c.urlReferencia} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 mt-2">
                      <ExternalLink className="w-3 h-3" /> Ver archivo
                    </a>
                  )}
                  {canManage() && (
                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
                  <select value={form.tipo} onChange={(e) => setForm((f: any) => ({ ...f, tipo: e.target.value }))} className="input">
                    {Object.entries(TIPO_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha programada *</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm((f: any) => ({ ...f, fecha: e.target.value }))} className="input" />
                </div>
              </div>

              {/* Upload or Link */}
              {(form.tipo === 'IMAGEN' || form.tipo === 'VIDEO_FILE' || form.tipo === 'PDF') ? (
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
                    ) : uploadPreview ? (
                      <img src={uploadPreview} className="max-h-32 mx-auto rounded" alt="preview" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Arrastra un archivo o <span className="text-primary-600">haz clic para seleccionar</span></p>
                        <p className="text-xs text-gray-400 mt-1">
                          {form.tipo === 'IMAGEN' ? 'JPG, PNG, GIF, WEBP' : form.tipo === 'PDF' ? 'PDF' : 'MP4, MOV, AVI'}
                        </p>
                      </>
                    )}
                    <input ref={fileRef} type="file" className="hidden"
                      accept={form.tipo === 'IMAGEN' ? 'image/*' : form.tipo === 'PDF' ? 'application/pdf' : 'video/*'}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                  </div>
                  {form.urlReferencia && !uploadPreview && (
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
    </AppLayout>
  )
}

