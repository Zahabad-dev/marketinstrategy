/**
 * Script para probar el registro de usuarios
 * Verifica que el rol CLIENT se asigne correctamente por defecto
 */

const API_URL = process.env.API_URL || 'http://localhost:3000'

async function testRegister() {
  console.log('🧪 Probando registro de usuario...\n')

  // Test 1: Registro sin especificar rol (debería ser CLIENT)
  console.log('📝 Test 1: Registro sin especificar rol')
  try {
    const response1 = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'test123456',
        nombre: 'Usuario Test Sin Rol',
      }),
    })

    const data1 = await response1.json()
    console.log('Status:', response1.status)
    console.log('Response:', JSON.stringify(data1, null, 2))
    
    if (data1.success && data1.data.rol === 'CLIENT') {
      console.log('✅ PASÓ: El rol CLIENT se asignó correctamente por defecto\n')
    } else {
      console.log('❌ FALLÓ: El rol no es CLIENT. Rol recibido:', data1.data?.rol, '\n')
    }
  } catch (error) {
    console.error('❌ Error en Test 1:', error.message, '\n')
  }

  // Test 2: Registro especificando rol CLIENT explícitamente
  console.log('📝 Test 2: Registro especificando rol CLIENT explícitamente')
  try {
    const response2 = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-explicit-${Date.now()}@example.com`,
        password: 'test123456',
        nombre: 'Usuario Test Con Rol',
        rol: 'CLIENT',
      }),
    })

    const data2 = await response2.json()
    console.log('Status:', response2.status)
    console.log('Response:', JSON.stringify(data2, null, 2))
    
    if (data2.success && data2.data.rol === 'CLIENT') {
      console.log('✅ PASÓ: El rol CLIENT se asignó correctamente\n')
    } else {
      console.log('❌ FALLÓ: El rol no es CLIENT. Rol recibido:', data2.data?.rol, '\n')
    }
  } catch (error) {
    console.error('❌ Error en Test 2:', error.message, '\n')
  }

  // Test 3: Login con usuario de ejemplo
  console.log('📝 Test 3: Login con usuario@example.com')
  try {
    const response3 = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'usuario@example.com',
        password: 'contraseña123',
      }),
    })

    const data3 = await response3.json()
    console.log('Status:', response3.status)
    
    if (data3.success) {
      console.log('✅ PASÓ: Login exitoso')
      console.log('Usuario:', data3.data.user.nombre)
      console.log('Rol:', data3.data.user.rol)
      console.log('Token recibido:', data3.data.accessToken ? 'Sí' : 'No')
    } else {
      console.log('❌ FALLÓ: No se pudo hacer login')
      console.log('Error:', data3.error)
    }
  } catch (error) {
    console.error('❌ Error en Test 3:', error.message)
    console.log('💡 Nota: El usuario usuario@example.com debe existir en la BD\n')
  }
}

// Ejecutar tests
testRegister().catch(console.error)
