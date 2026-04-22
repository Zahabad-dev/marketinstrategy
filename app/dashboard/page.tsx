'use client'

import { useEffect, useState } from 'react'
import { Users, Megaphone, TrendingUp, DollarSign } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = getToken()
      const [clientsRes, campaignsRes] = await Promise.all([
        fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/campaigns', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const clientsData = clientsRes.ok ? await clientsRes.json() : { data: { data: [] } }
      const campaignsData = campaignsRes.ok ? await campaignsRes.json() : { data: { data: [] } }

      const clients = clientsData.data?.data || []
      const campaigns = campaignsData.data?.data || []

      setStats({
        clients: {
          total: clients.length,
          active: clients.filter((c: any) => c.estado === 'activo').length,
        },
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter((c: any) => c.estado === 'activo' || c.estado === 'active').length,
          planned: campaigns.filter((c: any) => c.estado === 'planificacion').length,
        },
        total_budget: campaigns.reduce((sum: number, c: any) => sum + (Number(c.presupuesto) || 0), 0),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Clientes',
      value: stats?.clients?.active ?? 0,
      total: stats?.clients?.total ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Campañas Activas',
      value: stats?.campaigns?.active ?? 0,
      total: stats?.campaigns?.total ?? 0,
      icon: Megaphone,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'En Planificación',
      value: stats?.campaigns?.planned ?? 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      name: 'Presupuesto Total',
      value: `$${(stats?.total_budget || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Resumen general de tu agencia de marketing</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando estadísticas...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {statCards.map((stat) => (
              <div key={stat.name} className="card !p-4 sm:!p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                      {stat.value}
                      {'total' in stat && (
                        <span className="text-xs sm:text-sm text-gray-500 ml-1">/ {stat.total}</span>
                      )}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-2 sm:p-3 rounded-lg shrink-0`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bienvenido al sistema</h3>
          <p className="text-gray-600">
            Usa el menú lateral para navegar entre clientes, campañas y calendario.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
