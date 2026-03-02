import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

function write(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf8')
  console.log('✅', filePath)
}

const root = 'd:/PxY/laboratorio2/codigos/marketinstrategy'

// ─────────────────────────────────────────────
// 1. CLIENTS PAGE with create + edit modals
// ─────────────────────────────────────────────
write(`${root}/app/clients/page.tsx`, `'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_FORM = { nombre_empresa: '', contacto: '' }

export default function ClientsPage() {
  const { getToken, isAdmin, isEditor } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canManage = () => isAdmin() || isEditor()

  useEffect(() => { fetchClients() }, [search])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const params = search ? \`?search=\${encodeURIComponent(search)}\` : ''
      const res = await fetch(\`/api/clients\${params}\`, { headers: { Authorization: \`Bearer \${token}\` } })
      const data = await res.json()
      setClients(data.data?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('create') }
  const openEdit = (c: any) => { setForm({ nombre_empresa: c.nombre_empresa, contacto: c.contacto || '' }); setEditId(c.id); setError(''); setModal('edit') }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.nombre_empresa.trim()) { setError('El nombre de empresa es requerido'); return }
    setSaving(true); setError('')
    try {
      const token = getToken()
      const isEdit = modal === 'edit'
      const res = await fetch(isEdit ? \`/api/clients/\${editId}\` : '/api/clients', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEmpresa: form.nombre_empresa, contacto: form.contacto }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al guardar'); return }
      closeModal(); fetchClients()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    const token = getToken()
    await fetch(\`/api/clients/\${id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` } })
    fetchClients()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona los clientes de la agencia</p>
          </div>
          {canManage() && (
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          )}
        </div>

        <div className="card">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar clientes..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No hay clientes registrados</p>
              {canManage() && <button onClick={openCreate} className="btn btn-primary">Crear primer cliente</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado</th>
                    {canManage() && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{c.nombre_empresa}</td>
                      <td className="px-6 py-4 text-gray-600">{c.contacto || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : '-'}
                      </td>
                      {canManage() && (
                        <td className="px-6 py-4 text-right space-x-1">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{modal === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa *</label>
                <input type="text" value={form.nombre_empresa}
                  onChange={(e) => setForm(f => ({ ...f, nombre_empresa: e.target.value }))}
                  className="input" placeholder="Ej: TechCorp SA de CV" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input type="text" value={form.contacto}
                  onChange={(e) => setForm(f => ({ ...f, contacto: e.target.value }))}
                  className="input" placeholder="Nombre o email del contacto" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={closeModal} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Guardando...' : modal === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
`)

// ─────────────────────────────────────────────
// 2. CAMPAIGNS PAGE with create + edit modals
// ─────────────────────────────────────────────
write(`${root}/app/campaigns/page.tsx`, `'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  PLANIFICADA: 'bg-blue-100 text-blue-800',
  EN_PROGRESO: 'bg-green-100 text-green-800',
  COMPLETADA: 'bg-gray-100 text-gray-800',
  CANCELADA: 'bg-red-100 text-red-800',
}
const STATUS_LABELS: Record<string, string> = {
  PLANIFICADA: 'Planificada', EN_PROGRESO: 'En Progreso', COMPLETADA: 'Completada', CANCELADA: 'Cancelada',
}
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const EMPTY_FORM = {
  clienteId: '', mes: new Date().getMonth() + 1, anio: new Date().getFullYear(),
  objetivoGeneral: '', estado: 'PLANIFICADA'
}

export default function CampaignsPage() {
  const { getToken, isAdmin, isEditor } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [editId, setEditId] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canManage = () => isAdmin() || isEditor()

  useEffect(() => { fetchData() }, [filter])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: \`Bearer \${token}\` }
    try {
      const [cr, clr] = await Promise.all([
        fetch(\`/api/campaigns\${filter !== 'all' ? '?estado=' + filter : ''}\`, { headers: h }),
        fetch('/api/clients', { headers: h }),
      ])
      const cd = await cr.json(); const cld = await clr.json()
      setCampaigns(cd.data?.data || [])
      setClients(cld.data?.data || [])
    } catch {} finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('create') }
  const openEdit = (c: any) => {
    setForm({ clienteId: c.cliente_id || '', mes: c.mes, anio: c.anio,
      objetivoGeneral: c.objetivo_general || c.objetivoGeneral || '', estado: c.estado || 'PLANIFICADA' })
    setEditId(c.id); setError(''); setModal('edit')
  }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.clienteId) { setError('Selecciona un cliente'); return }
    if (!form.objetivoGeneral.trim()) { setError('El objetivo es requerido'); return }
    setSaving(true); setError('')
    try {
      const token = getToken()
      const body = { clienteId: form.clienteId, mes: Number(form.mes), anio: Number(form.anio),
        objetivoGeneral: form.objetivoGeneral, estado: form.estado }
      const res = await fetch(modal === 'edit' ? \`/api/campaigns/\${editId}\` : '/api/campaigns', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      closeModal(); fetchData()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return
    const token = getToken()
    await fetch(\`/api/campaigns/\${id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` } })
    fetchData()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campañas</h1>
            <p className="text-gray-600 mt-1">Gestiona las campañas de marketing</p>
          </div>
          {canManage() && (
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Campaña
            </button>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-xs">
              <option value="all">Todas</option>
              {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No hay campañas registradas</p>
              {canManage() && <button onClick={openCreate} className="btn btn-primary">Crear primera campaña</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objetivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    {canManage() && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                        <p className="truncate">{c.objetivo_general || c.objetivoGeneral || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {c.mes && (c.anio || c.año) ? \`\${MONTH_NAMES[(c.mes||1)-1]} \${c.anio || c.año}\` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={\`px-2 py-1 text-xs font-medium rounded-full \${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}\`}>
                          {STATUS_LABELS[c.estado] || c.estado || '-'}
                        </span>
                      </td>
                      {canManage() && (
                        <td className="px-6 py-4 text-right space-x-1">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{modal === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}</h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select value={form.clienteId} onChange={(e) => setForm((f: any) => ({ ...f, clienteId: e.target.value }))} className="input">
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.nombre_empresa}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
                  <select value={form.mes} onChange={(e) => setForm((f: any) => ({ ...f, mes: Number(e.target.value) }))} className="input">
                    {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input type="number" value={form.anio} min={2020} max={2099}
                    onChange={(e) => setForm((f: any) => ({ ...f, anio: Number(e.target.value) }))} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo General *</label>
                <textarea value={form.objetivoGeneral} rows={3}
                  onChange={(e) => setForm((f: any) => ({ ...f, objetivoGeneral: e.target.value }))}
                  className="input resize-none" placeholder="Describe el objetivo principal de esta campaña..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.estado} onChange={(e) => setForm((f: any) => ({ ...f, estado: e.target.value }))} className="input">
                  {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={closeModal} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Guardando...' : modal === 'create' ? 'Crear Campaña' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
`)

// ─────────────────────────────────────────────
// 3. CONTENT MANAGEMENT PAGE
// ─────────────────────────────────────────────
write(`${root}/app/content/page.tsx`, `'use client'

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
  campañaId: '', titulo: '', descripcion: '', tipo: 'IMAGEN' as string,
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
    const h = { Authorization: \`Bearer \${token}\` }
    try {
      const [coRes, caRes, clRes] = await Promise.all([
        fetch(\`/api/contents\${filterCampaign ? '?campaña=' + filterCampaign : ''}\`, { headers: h }),
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
    return \`\${name} — \${c.mes}/\${c.anio || c.año}\`
  }

  const openCreate = () => { setForm({ ...EMPTY_FORM, campañaId: filterCampaign }); setEditId(null); setError(''); setUploadPreview(null); setModal('create') }
  const openEdit = (c: any) => {
    setForm({ campañaId: c.campaña_id || c.campañaId || '', titulo: c.titulo, descripcion: c.descripcion || '',
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
      const res = await fetch(\`/api/contents/upload?type=\${type}\`, {
        method: 'POST', headers: { Authorization: \`Bearer \${token}\` }, body: fd,
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al subir'); return }
      const data = await res.json()
      setForm((f: any) => ({ ...f, archivoLocal: data.data.filename, urlReferencia: data.data.publicUrl }))
      if (type === 'IMAGEN') setUploadPreview(data.data.publicUrl)
    } catch { setError('Error al subir archivo') } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.campañaId) { setError('Selecciona una campaña'); return }
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    setSaving(true); setError('')
    try {
      const token = getToken()
      const body = { campañaId: form.campañaId, titulo: form.titulo, descripcion: form.descripcion,
        tipo: form.tipo, urlReferencia: form.urlReferencia, fecha: form.fecha, estado: form.estado }
      const res = await fetch(modal === 'edit' ? \`/api/contents/\${editId}\` : '/api/contents', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      closeModal(); fetchData()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contenido?')) return
    const token = getToken()
    await fetch(\`/api/contents/\${id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` } })
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
              const campaign = campaigns.find((cam: any) => cam.id === (c.campaña_id || c.campañaId))
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
                    <span className={\`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 \${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}\`}>
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
                <select value={form.campañaId} onChange={(e) => setForm((f: any) => ({ ...f, campañaId: e.target.value }))} className="input">
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
`)

// ─────────────────────────────────────────────
// 4. CALENDAR PAGE — real grid with content
// ─────────────────────────────────────────────
write(`${root}/app/calendar/page.tsx`, `'use client'

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
    const h = { Authorization: \`Bearer \${token}\` }
    try {
      const [coR, caR, clR] = await Promise.all([
        fetch('/api/contents', { headers: h }),
        fetch(\`/api/campaigns/calendar?año=\${year}&mes=\${month+1}\`, { headers: h }),
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
                  <div className={\`w-2 h-2 rounded-full \${STATUS_DOT[k]}\`} />
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
                      className={\`min-h-[80px] rounded-lg p-1 border \${day ? 'cursor-pointer hover:bg-primary-50 hover:border-primary-200' : 'border-transparent'} \${isSelected ? 'border-primary-400 bg-primary-50' : 'border-gray-100'} \${!day ? '' : ''}\`}
                    >
                      {day && (
                        <>
                          <div className={\`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 \${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}\`}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayContents.slice(0, 3).map((c: any) => {
                              const Icon = TIPO_ICONS[c.tipo] || FileText
                              return (
                                <div key={c.id} className="flex items-center gap-1 text-xs truncate">
                                  <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${STATUS_DOT[c.estado] || 'bg-gray-400'}\`} />
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
                              <span className={\`px-1.5 py-0.5 text-xs rounded-full \${STATUS_DOT[c.estado]?.replace('bg-', 'bg-').replace('-400', '-100').replace('-500', '-100')} text-gray-700\`}>
                                {STATUS_LABELS[c.estado] || c.estado}
                              </span>
                            </div>
                            {clientName(c.campaña_id || c.campañaId) && (
                              <p className="text-xs text-gray-400 mt-1">{clientName(c.campaña_id || c.campañaId)}</p>
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
`)

// ─────────────────────────────────────────────
// 5. CLIENT PORTAL — CLIENT role view of own data
// ─────────────────────────────────────────────
write(`${root}/app/portal/page.tsx`, `'use client'

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

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    const h = { Authorization: \`Bearer \${token}\` }
    try {
      const [caR, coR] = await Promise.all([
        fetch('/api/campaigns', { headers: h }),
        fetch('/api/contents', { headers: h }),
      ])
      const cams = (await caR.json()).data?.data || []
      const conts = (await coR.json()).data?.data || []
      setCampaigns(cams)
      setContents(conts)
      if (cams.length > 0) setSelectedCampaign(cams[0])
    } catch {} finally { setLoading(false) }
  }

  const campaignContents = selectedCampaign
    ? contents.filter(c => (c.campaña_id || c.campañaId) === selectedCampaign.id)
    : []

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
                const campaignConts = contents.filter(co => (co.campaña_id || co.campañaId) === c.id)
                const approved = campaignConts.filter(co => co.estado === 'APROBADO' || co.estado === 'PUBLICADO').length
                return (
                  <button key={c.id} onClick={() => setSelectedCampaign(c)}
                    className={\`w-full text-left rounded-xl p-4 border-2 transition-all \${selectedCampaign?.id === c.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}\`}>
                    <p className="font-medium text-gray-900 text-sm">{MONTH_NAMES[(c.mes||1)-1]} {c.anio || c.año}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.objetivo_general || c.objetivoGeneral}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={\`px-2 py-0.5 text-xs rounded-full font-medium \${
                        c.estado === 'EN_PROGRESO' ? 'bg-green-100 text-green-700' :
                        c.estado === 'PLANIFICADA' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }\`}>{c.estado === 'EN_PROGRESO' ? 'En Progreso' : c.estado === 'PLANIFICADA' ? 'Planificada' : c.estado}</span>
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
                              <span className={\`ml-auto px-2 py-0.5 text-xs rounded-full font-medium \${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}\`}>
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
`)

// ─────────────────────────────────────────────
// 6. UPDATED AppLayout with all nav links
// ─────────────────────────────────────────────
write(`${root}/components/AppLayout.tsx`, `'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Users, Megaphone, Calendar, LogOut, User,
  FileImage, LayoutGrid,
} from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin, isEditor, isClient } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Cargando...</div>
      </div>
    )
  }
  if (!user) return null

  const adminEditorNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Campañas', href: '/campaigns', icon: Megaphone },
    { name: 'Contenido', href: '/content', icon: FileImage },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
  ]
  const clientNav = [
    { name: 'Mi Portal', href: '/portal', icon: LayoutGrid },
  ]

  const navigation = (isAdmin() || isEditor()) ? adminEditorNav : clientNav

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    EDITOR: 'bg-purple-100 text-purple-700',
    CLIENT: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          <h1 className="text-lg font-bold text-primary-600">MarketInStrategy</h1>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.nombre}</p>
              <span className={\`text-xs px-1.5 py-0.5 rounded font-medium \${roleBadge[user.rol] || 'bg-gray-100 text-gray-600'}\`}>
                {user.rol}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.name} href={item.href}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                  active
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }\`}>
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-sm text-gray-700 font-medium">{user.nombre}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
`)

console.log('\n🎉 All pages written successfully!')
