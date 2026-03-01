'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  FolderKanban, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  editorOnly?: boolean
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: Building2,
  },
  {
    name: 'Campañas',
    href: '/campaigns',
    icon: FolderKanban,
  },
  {
    name: 'Usuarios',
    href: '/app/users',
    icon: Users,
    adminOnly: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isAdmin, isEditor } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin()) return false
    if (item.editorOnly && !isEditor() && !isAdmin()) return false
    return true
  })

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">Marketing SaaS</h1>
            <p className="text-xs text-gray-400">{user?.nombre}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-gray-800">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            user.rol === 'ADMIN' 
              ? 'bg-purple-600 text-white' 
              : user.rol === 'EDITOR'
              ? 'bg-blue-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {user.rol}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  )
}
