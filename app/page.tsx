'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Clientes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Campañas Activas</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Contenidos Pendientes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
            <div className="space-y-2">
              <a href="/clients" className="block p-3 hover:bg-gray-50 rounded-md border border-gray-200">
                📋 Gestionar Clientes
              </a>
              <a href="/campaigns" className="block p-3 hover:bg-gray-50 rounded-md border border-gray-200">
                🎯 Gestionar Campañas
              </a>
              <a href="/calendar" className="block p-3 hover:bg-gray-50 rounded-md border border-gray-200">
                📅 Ver Calendario
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
            <p className="text-gray-500 text-sm">No hay actividad reciente</p>
          </div>
        </div>
      </main>
    </div>
  )
}
