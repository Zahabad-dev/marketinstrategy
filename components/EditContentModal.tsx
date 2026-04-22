'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ContenidoCalendarizado, ContentStatus } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface EditContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  content: ContenidoCalendarizado | null
}

export function EditContentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  content
}: EditContentModalProps) {
  const { isAdmin, isEditor } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState<ContentStatus>(ContentStatus.PENDIENTE)
  const [copy, setCopy] = useState('')
  const [copyV2, setCopyV2] = useState('')
  const [showCopyV2, setShowCopyV2] = useState(false)
  const [guion, setGuion] = useState('')
  const [guionV2, setGuionV2] = useState('')
  const [showGuionV2, setShowGuionV2] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (content) {
      setTitulo(content.titulo)
      setDescripcion(content.descripcion || '')
      setEstado(content.estado)
      const rawContent = content as any
      const copyVal = rawContent.copy || ''
      const copyV2Val = rawContent.copy_v2 || rawContent.copyV2 || ''
      const guionVal = rawContent.guion || ''
      const guionV2Val = rawContent.guion_v2 || rawContent.guionV2 || ''
      setCopy(copyVal)
      setCopyV2(copyV2Val)
      setShowCopyV2(!!copyV2Val)
      setGuion(guionVal)
      setGuionV2(guionV2Val)
      setShowGuionV2(!!guionV2Val)
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      const updateData: any = {}
      
      // Editors can edit title, description, copy and guion
      if (isEditor() || isAdmin()) {
        if (titulo !== content.titulo) updateData.titulo = titulo
        if (descripcion !== content.descripcion) updateData.descripcion = descripcion || undefined
        updateData.copy = copy || null
        updateData.copyV2 = copyV2 || null
        updateData.guion = guion || null
        updateData.guionV2 = guionV2 || null
      }
      
      // Only admins can change status
      if (isAdmin() && estado !== content.estado) {
        updateData.estado = estado
      }

      const response = await fetch(`/api/contents/${content.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar contenido')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!content || !isAdmin()) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`/api/contents/${content.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: ContentStatus.APROBADO })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar contenido')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!content || !isAdmin()) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`/api/contents/${content.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: ContentStatus.RECHAZADO })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al rechazar contenido')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!content) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Contenido">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Current Status Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Estado Actual</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {content.estado}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Tipo</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {content.tipo}
              </p>
            </div>
          </div>
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
            disabled={!isEditor() && !isAdmin()}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={3}
            disabled={!isEditor() && !isAdmin()}
          />
        </div>

        {/* Copy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Copy <span className="text-xs text-gray-400 font-normal">(texto de la publicación)</span>
            </label>
            {!showCopyV2 && (isEditor() || isAdmin()) && (
              <button
                type="button"
                onClick={() => setShowCopyV2(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Agregar versión 2
              </button>
            )}
          </div>
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            placeholder="Escribe el texto que acompañará la publicación..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={4}
            disabled={!isEditor() && !isAdmin()}
          />
          {showCopyV2 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Copy — Versión 2</label>
                {(isEditor() || isAdmin()) && (
                  <button
                    type="button"
                    onClick={() => { setShowCopyV2(false); setCopyV2('') }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <textarea
                value={copyV2}
                onChange={(e) => setCopyV2(e.target.value)}
                placeholder="Versión alternativa del copy..."
                className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                rows={4}
                disabled={!isEditor() && !isAdmin()}
              />
            </div>
          )}
        </div>

        {/* Guión */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Guión <span className="text-xs text-gray-400 font-normal">(guion del contenido)</span>
            </label>
            {!showGuionV2 && (isEditor() || isAdmin()) && (
              <button
                type="button"
                onClick={() => setShowGuionV2(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Agregar versión 2
              </button>
            )}
          </div>
          <textarea
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
            placeholder="Escribe el guión o instrucciones del contenido..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={4}
            disabled={!isEditor() && !isAdmin()}
          />
          {showGuionV2 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">Guión — Versión 2</label>
                {(isEditor() || isAdmin()) && (
                  <button
                    type="button"
                    onClick={() => { setShowGuionV2(false); setGuionV2('') }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <textarea
                value={guionV2}
                onChange={(e) => setGuionV2(e.target.value)}
                placeholder="Versión alternativa del guión..."
                className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                rows={4}
                disabled={!isEditor() && !isAdmin()}
              />
            </div>
          )}
        </div>

        {/* Status - Admin Only */}
        {isAdmin() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as ContentStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ContentStatus.PENDIENTE}>Pendiente</option>
              <option value={ContentStatus.EN_REVISION}>En Revisión</option>
              <option value={ContentStatus.APROBADO}>Aprobado</option>
              <option value={ContentStatus.PUBLICADO}>Publicado</option>
              <option value={ContentStatus.RECHAZADO}>Rechazado</option>
            </select>
          </div>
        )}

        {/* Quick Actions - Admin Only */}
        {isAdmin() && content.estado === ContentStatus.PENDIENTE && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</p>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ✓ Aprobar
              </Button>
              <Button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                ✗ Rechazar
              </Button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
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
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
