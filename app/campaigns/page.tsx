'use client'

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
    const h = { Authorization: `Bearer ${token}` }
    try {
      const [cr, clr] = await Promise.all([
        fetch(`/api/campaigns${filter !== 'all' ? '?estado=' + filter : ''}`, { headers: h }),
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
      const res = await fetch(modal === 'edit' ? `/api/campaigns/${editId}` : '/api/campaigns', {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      closeModal(); fetchData()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return
    const token = getToken()
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchData()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campañas</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona las campañas de marketing</p>
          </div>
          {canManage() && (
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2 self-start sm:self-auto">
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
            <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                        {c.mes && (c.anio || c.año) ? `${MONTH_NAMES[(c.mes||1)-1]} ${c.anio || c.año}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
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
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {campaigns.map((c: any) => (
                <div key={c.id} className="py-4 px-1 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{c.objetivo_general || c.objetivoGeneral || '-'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {c.mes && (c.anio || c.año) ? `${MONTH_NAMES[(c.mes||1)-1]} ${c.anio || c.año}` : '-'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[c.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[c.estado] || c.estado || '-'}
                      </span>
                    </div>
                  </div>
                  {canManage() && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </>
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
