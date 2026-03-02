export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
          ✅ Vercel Funcionando
        </h1>
        <div style={{ color: '#6b7280', lineHeight: '1.6' }}>
          <p><strong>Status:</strong> Deployment exitoso</p>
          <p><strong>Framework:</strong> Next.js 14</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <p style={{ marginTop: '1rem' }}>
            <a href="/api/health" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              → Ver Health Check API
            </a>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              → Ir a Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
