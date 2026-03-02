'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesiÃ³n')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MarketInStrategy</h1>
          <p className="text-gray-600">Sistema de GestiÃ³n de CampaÃ±as</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              ContraseÃ±a
            </label>
            <input
              id="password"
              type="password"
              required
              className="input"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Iniciar SesiÃ³n'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <p className="font-medium text-gray-600 mb-1">Credenciales de acceso:</p>
          <p>Email: <span className="font-mono text-primary-600">admin@marketinstrategy.com</span></p>
          <p>ContraseÃ±a: <span className="font-mono text-primary-600">admin123</span></p>
        </div>
      </div>
    </div>
  )
}
