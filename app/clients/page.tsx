'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, X, User, Building2, KeyRound, CheckCircle2 } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_FORM = {
  nombre_empresa: '',
  contacto: '',
  userEmail: '',
  userPassword: '',
  userNombre: '',
  createAccount: false,
}

export default function ClientsPage() {
  const { getToken, isAdmin, isEditor } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [editHasAccount, setEditHasAccount] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState<{ empresa: string; email: string; password: string } | null>(null)

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
  const openEdit = (c: any) => {
    setForm({ nombre_empresa: c.nombre_empresa, contacto: c.contacto || '', userEmail: '', userPassword: '', userNombre: '', createAccount: false })
    setEditId(c.id); setEditHasAccount(!!c.usuario_id); setError(''); setModal('edit')
  }
  const closeModal = () => { setModal(null); setError('') }

  const handleSave = async () => {
    if (!form.nombre_empresa.trim()) { setError('El nombre de empresa es requerido'); return }
    if (form.createAccount) {
      if (!form.userEmail.trim()) { setError('El email del usuario es requerido'); return }
      if (!form.userPassword || form.userPassword.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); return }
      if (!form.userNombre.trim()) { setError('El nombre del usuario es requerido'); return }
    }
    setSaving(true); setError('')
    try {
      const token = getToken()
      const isEdit = modal === 'edit'
      let usuarioId: string | null = null

      // Step 1: create user account if requested
      if (form.createAccount && isAdmin()) {
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.userEmail.trim(), password: form.userPassword, nombre: form.userNombre.trim(), rol: 'CLIENT' }),
        })
        if (!userRes.ok) { const d = await userRes.json(); setError(d.error || 'Error al crear usuario'); setSaving(false); return }
        const userData = await userRes.json()
        usuarioId = userData.data?.id || null
      }

      // Step 2: create/update client
      const clientBody: any = { nombreEmpresa: form.nombre_empresa, contacto: form.contacto }
      if (usuarioId) clientBody.usuarioId = usuarioId
      const res = await fetch(isEdit ? `/api/clients/${editId}` : '/api/clients', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(clientBody),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error al guardar'); setSaving(false); return }
      closeModal(); fetchClients()
      if (form.createAccount && usuarioId) {
        setSuccessInfo({ empresa: form.nombre_empresa, email: form.userEmail.trim(), password: form.userPassword })
      }
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este cliente?')) return
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

        {successInfo && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Acceso al portal asignado</p>
                <p className="text-sm text-green-700 mt-1"><strong>{successInfo.empresa}</strong> puede iniciar sesion con:</p>
                <div className="mt-2 bg-white rounded-lg border border-green-200 p-3 text-sm font-mono space-y-1">
                  <p><span className="text-gray-500 font-sans">Email:</span> {successInfo.email}</p>
                  <p><span className="text-gray-500 font-sans">Contrasena:</span> {successInfo.password}</p>
                </div>
                <p className="text-xs text-green-600 mt-2">Guarda estas credenciales y comparte las con el cliente</p>
              </div>
              <button onClick={() => setSuccessInfo(null)} className="text-green-400 hover:text-green-600"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado</th>
                    {canManage() && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{c.nombre_empresa}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.contacto || '-'}</td>
                      <td className="px-6 py-4">
                        {c.usuario_id ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <User className="w-3 h-3" /> Acceso activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">Sin acceso</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : '-'}
                      </td>
                      {canManage() && (
                        <td className="px-6 py-4 text-right space-x-1">
                          <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{modal === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Datos de la Empresa
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa *</label>
                    <input type="text" value={form.nombre_empresa}
                      onChange={(e) => setForm((f: any) => ({ ...f, nombre_empresa: e.target.value }))}
                      className="input" placeholder="Ej: TechCorp SA de CV" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                    <input type="text" value={form.contacto}
                      onChange={(e) => setForm((f: any) => ({ ...f, contacto: e.target.value }))}
                      className="input" placeholder="Nombre o email del contacto" />
                  </div>
                </div>
              </div>

              {isAdmin() && (modal === 'create' || (modal === 'edit' && !editHasAccount)) && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <KeyRound className="w-4 h-4" /> Acceso al Portal
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={form.createAccount}
                          onChange={(e) => setForm((f: any) => ({ ...f, createAccount: e.target.checked }))} />
                        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                      </div>
                      <span className="text-sm text-gray-600">{modal === 'create' ? 'Crear cuenta' : 'Asignar acceso'}</span>
                    </label>
                  </div>
                  {form.createAccount && (
                    <div className="space-y-3 bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs text-blue-700">El cliente iniciara sesion con estas credenciales para ver su calendario.</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                        <input type="text" value={form.userNombre}
                          onChange={(e) => setForm((f: any) => ({ ...f, userNombre: e.target.value }))}
                          className="input" placeholder="Ej: Juan Perez" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de acceso *</label>
                        <input type="email" value={form.userEmail}
                          onChange={(e) => setForm((f: any) => ({ ...f, userEmail: e.target.value }))}
                          className="input" placeholder="cliente@empresa.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena *</label>
                        <input type="text" value={form.userPassword}
                          onChange={(e) => setForm((f: any) => ({ ...f, userPassword: e.target.value }))}
                          className="input font-mono" placeholder="Minimo 6 caracteres" />
                        <p className="text-xs text-gray-500 mt-1">Se mostrara una sola vez al crear el cliente.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
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