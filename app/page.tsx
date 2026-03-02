export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
          🎯 MarketInStrategy
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Sistema de Gestión de Marketing Digital
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a
            href="/login"
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'block'
            }}
          >
            Iniciar Sesión
          </a>
          <a
            href="/test"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'block'
            }}
          >
            Ver Estado del Sistema
          </a>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Deployment: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
