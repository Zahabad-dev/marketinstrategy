'use client'

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
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadge[user.rol] || 'bg-gray-100 text-gray-600'}`}>
                {user.rol}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
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
