'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Client } from '@/types'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [contacto, setContacto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      // First, create the user account for the client
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: contacto,
          email,
          password,
          rol: 'CLIENT'
        })
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || 'Error al crear usuario')
      }

      const userData = await userResponse.json()
      const userId = userData.data.id

      // Then create the client record
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreEmpresa,
          contacto,
          usuarioId: userId
        })
      })

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json()
        throw new Error(errorData.error || 'Error al crear cliente')
      }

      // Reset form
      setNombreEmpresa('')
      setContacto('')
      setEmail('')
      setPassword('')
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNombreEmpresa('')
    setContacto('')
    setEmail('')
    setPassword('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Nuevo Cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Empresa *
          </label>
          <Input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            placeholder="Ej: Empresa XYZ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Contacto *
          </label>
          <Input
            type="text"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email del Cliente *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@empresa.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña *
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 caracteres"
            minLength={6}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
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
            {loading ? 'Creando...' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
