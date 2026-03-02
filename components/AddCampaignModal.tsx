'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Client, CampaignStatus } from '@/types'

interface AddCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedClient?: string
  preselectedMonth?: number
  preselectedYear?: number
}

export function AddCampaignModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedClient = '',
  preselectedMonth,
  preselectedYear
}: AddCampaignModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clienteId, setClienteId] = useState(preselectedClient)
  const [mes, setMes] = useState(preselectedMonth || new Date().getMonth() + 1)
  const [año, setAño] = useState(preselectedYear || new Date().getFullYear())
  const [objetivoGeneral, setObjetivoGeneral] = useState('')
  const [estado, setEstado] = useState<CampaignStatus>(CampaignStatus.PLANIFICADA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchClients()
    }
  }, [isOpen])

  useEffect(() => {
    setClienteId(preselectedClient)
  }, [preselectedClient])

  useEffect(() => {
    if (preselectedMonth) setMes(preselectedMonth)
    if (preselectedYear) setAño(preselectedYear)
  }, [preselectedMonth, preselectedYear])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/clients?perPage=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId,
          mes: Number(mes),
          año: Number(año),
          objetivoGeneral,
          estado
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear campaña')
      }

      // Reset form
      setClienteId('')
      setMes(new Date().getMonth() + 1)
      setAño(new Date().getFullYear())
      setObjetivoGeneral('')
      setEstado(CampaignStatus.PLANIFICADA)
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setClienteId(preselectedClient)
    setMes(preselectedMonth || new Date().getMonth() + 1)
    setAño(preselectedYear || new Date().getFullYear())
    setObjetivoGeneral('')
    setEstado(CampaignStatus.PLANIFICADA)
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Campaña">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione un cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nombreEmpresa}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes *
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año *
            </label>
            <select
              value={año}
              onChange={(e) => setAño(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo General *
          </label>
          <textarea
            value={objetivoGeneral}
            onChange={(e) => setObjetivoGeneral(e.target.value)}
            placeholder="Describe el objetivo principal de esta campaña"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as CampaignStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CampaignStatus.PLANIFICADA}>Planificada</option>
            <option value={CampaignStatus.EN_PROGRESO}>En Progreso</option>
            <option value={CampaignStatus.COMPLETADA}>Completada</option>
            <option value={CampaignStatus.CANCELADA}>Cancelada</option>
          </select>
        </div>

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
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creando...' : 'Crear Campaña'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
