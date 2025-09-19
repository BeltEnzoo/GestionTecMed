import { supabase } from './supabase'

const USUARIOS_TABLE = 'perfiles_usuarios'

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    userId: dbData.id, // Usamos el mismo ID de la tabla
    email: dbData.email,
    nombre: dbData.nombre,
    apellido: dbData.apellido,
    telefono: dbData.telefono,
    departamento: dbData.departamento,
    cargo: dbData.cargo,
    rol: dbData.rol,
    estado: dbData.estado,
    fechaIngreso: dbData.fecha_ingreso,
    ultimoAcceso: dbData.ultimo_acceso,
    permisos: dbData.permisos || {},
    avatarUrl: dbData.avatar_url,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  }
}

export const authServiceCustom = {
  // Iniciar sesión
  async signIn(email, password) {
    try {
      // Buscar usuario en nuestra tabla usando fetch directo
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/perfiles_usuarios?email=eq.${encodeURIComponent(email)}&estado=eq.Activo&select=*`, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || data.length === 0) {
        throw new Error('Usuario no encontrado')
      }

      const userData = data[0]

      // Verificar contraseña (simplificado - en producción usar hash)
      if (userData.password !== password) {
        throw new Error('Contraseña incorrecta')
      }

      // Actualizar último acceso
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/perfiles_usuarios?id=eq.${userData.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ ultimo_acceso: new Date().toISOString() })
      })

      // Guardar en localStorage
      const mappedUserData = mapDBColumnsToFormFields(userData)
      localStorage.setItem('user', JSON.stringify(mappedUserData))
      localStorage.setItem('isAuthenticated', 'true')

      return {
        user: mappedUserData,
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
