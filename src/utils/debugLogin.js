// Debug completo del login
export const debugLogin = async () => {
  console.log('🔍 === DEBUG COMPLETO DEL LOGIN ===')
  
  // 1. Verificar variables de entorno
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('1. Variables de entorno:')
  console.log('   URL:', SUPABASE_URL)
  console.log('   KEY:', SUPABASE_ANON_KEY ? 'Configurada' : 'NO CONFIGURADA')
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variables de entorno faltantes')
    return
  }
  
  // 2. Probar conexión básica
  console.log('\n2. Probando conexión básica...')
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/perfiles_usuarios?select=count`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('   Status:', response.status)
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Conexión OK. Total usuarios:', data[0]?.count)
    } else {
      const errorText = await response.text()
      console.error('   ❌ Error:', response.status, errorText)
    }
  } catch (error) {
    console.error('   ❌ Error de conexión:', error)
  }
  
  // 3. Probar consulta específica
  console.log('\n3. Probando consulta específica...')
  const testEmail = 'admin@hospital.com'
  
  try {
    const url = `${SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(testEmail)}&select=*`
    console.log('   URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('   Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('   Resultado:', data)
      console.log('   Cantidad:', data.length)
      
      if (data.length > 0) {
        console.log('   ✅ Usuario encontrado:', data[0].email, data[0].rol)
      } else {
        console.log('   ❌ Usuario NO encontrado')
      }
    } else {
      const errorText = await response.text()
      console.error('   ❌ Error:', response.status, errorText)
    }
  } catch (error) {
    console.error('   ❌ Error:', error)
  }
  
  // 4. Probar sin filtro de estado
  console.log('\n4. Probando sin filtro de estado...')
  try {
    const url = `${SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(testEmail)}&select=*`
    console.log('   URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('   Resultado sin filtro:', data)
    }
  } catch (error) {
    console.error('   ❌ Error:', error)
  }
  
  console.log('\n🔍 === FIN DEBUG ===')
}


