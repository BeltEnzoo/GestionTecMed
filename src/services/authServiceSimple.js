const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const authServiceSimple = {
  // Iniciar sesión
  async signIn(email, password) {
    try {
      console.log('🔍 Intentando login con:', email)
      console.log('🔗 URL:', SUPABASE_URL)
      console.log('🔑 Key configurada:', SUPABASE_ANON_KEY ? 'Sí' : 'No')
      
      // Buscar usuario en nuestra tabla usando fetch directo
      const url = `${SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(email)}&select=*`
      console.log('🌐 URL completa:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Status de respuesta:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP:', response.status, errorText)
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Resultado de la consulta:', { data, length: data?.length })

      if (!data || data.length === 0) {
        throw new Error('Usuario no encontrado')
      }

      const userData = data[0]
      console.log('Usuario encontrado:', userData.email, userData.rol)

      // Verificar contraseña
      if (userData.password !== password) {
        throw new Error('Contraseña incorrecta')
      }

      // Actualizar último acceso
      await fetch(
        `${SUPABASE_URL}/rest/v1/perfiles_usuarios?id=eq.${userData.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ ultimo_acceso: new Date().toISOString() })
        }
      )

      // Guardar en localStorage
      const userToStore = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: userData.rol,
        estado: userData.estado,
        departamento: userData.departamento,
        cargo: userData.cargo
      }

      console.log('📊 Datos del usuario a guardar:', userToStore)
      console.log('🔍 Rol del usuario:', userData.rol)

      localStorage.setItem('user', JSON.stringify(userToStore))
      localStorage.setItem('isAuthenticated', 'true')

      console.log('✅ Login exitoso para:', userData.email, 'con rol:', userData.rol)

      return {
        user: userToStore,
        error: null
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      return {
        user: null,
        error: error.message
      }
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      // Disparar evento personalizado para notificar cambios en el mismo tab
      window.dispatchEvent(new Event('localStorageChange'))
      
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      
      if (!isAuthenticated || !userData) {
        return null
      }
      
      return JSON.parse(userData)
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      return null
    }
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const isAuth = localStorage.getItem('isAuthenticated')
    return isAuth === 'true'
  },

  // Verificar permisos
  hasPermission(permission) {
    const user = this.getCurrentUser()
    if (!user) return false
    
    // Administrador tiene todos los permisos
    if (user.rol === 'Administrador') return true
    
    // Técnico puede hacer todo excepto gestionar usuarios
    if (user.rol === 'Técnico') {
      return permission !== 'manage_users'
    }
    
    // Invitado solo puede ver
    if (user.rol === 'Invitado') {
      return permission === 'view_only'
    }
    
    return false
  }
}
