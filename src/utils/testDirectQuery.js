// Test directo de la consulta
export const testDirectQuery = async () => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('🧪 === TEST DIRECTO ===')
  
  // Test 1: Obtener todos los usuarios
  console.log('1. Obteniendo todos los usuarios...')
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/perfiles_usuarios?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Todos los usuarios:', data)
      console.log('📊 Total:', data.length)
      
      // Mostrar emails disponibles
      data.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.rol} - ${user.estado}`)
      })
    } else {
      console.error('❌ Error:', response.status, await response.text())
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
  
  // Test 2: Buscar por email específico
  console.log('\n2. Buscando por email específico...')
  const testEmail = 'admin@hospital.com'
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(testEmail)}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Resultado búsqueda:', data)
      console.log('📊 Encontrados:', data.length)
    } else {
      console.error('❌ Error:', response.status, await response.text())
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
  
  console.log('\n🧪 === FIN TEST ===')
}


