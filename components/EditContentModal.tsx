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
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (content) {
      setTitulo(content.titulo)
      setDescripcion(content.descripcion || '')
      setEstado(content.estado)
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
      
      // Editors can edit title and description
      if (isEditor() || isAdmin()) {
        if (titulo !== content.titulo) updateData.titulo = titulo
        if (descripcion !== content.descripcion) updateData.descripcion = descripcion || undefined
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
            variant="outline"
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
