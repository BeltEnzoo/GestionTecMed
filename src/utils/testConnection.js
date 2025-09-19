// Script para probar la conexión directa a Supabase
export const testSupabaseConnection = async () => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('🔍 Variables de entorno:')
  console.log('URL:', SUPABASE_URL)
  console.log('KEY:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada')
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variables de entorno no configuradas')
    return false
  }
  
  try {
    // Probar conexión directa
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/perfiles_usuarios?select=count`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('🔗 Respuesta de Supabase:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Conexión exitosa. Total usuarios:', data[0]?.count || 'N/A')
      return true
    } else {
      console.error('❌ Error en la conexión:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return false
  }
}

// Función para probar búsqueda de usuario específico
export const testUserSearch = async (email) => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  try {
    console.log(`🔍 Buscando usuario: ${email}`)
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('🔗 Respuesta:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Resultado:', data)
      return data
    } else {
      console.error('❌ Error:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('❌ Error:', error)
    return null
  }
}


