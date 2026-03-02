'use client'

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
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/clients${params}`, { headers: { Authorization: `Bearer ${token}` } })
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
      const res = await fetch(isEdit ? `/api/clients/${editId}` : '/api/clients', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEmpresa: form.nombre_empresa, contacto: form.contacto }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al guardar'); return }
      closeModal(); fetchClients()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    const token = getToken()
    await fetch(`/api/clients/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
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
