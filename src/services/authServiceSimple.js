import { api, setSession, clearSession, getSedes, getSedeId, setSedeId } from './api'

export const authServiceSimple = {
  async signIn(email, password) {
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setSession({ token: data.token, user: data.user, sedes: data.sedes || [] })

      return {
        user: data.user,
        sedes: data.sedes || [],
        error: null,
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      return {
        user: null,
        sedes: [],
        error: error.message,
      }
    }
  },

  async signOut() {
    try {
      clearSession()
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const token = localStorage.getItem('token')

      if (!isAuthenticated || !userData || !token) {
        return null
      }

      return JSON.parse(userData)
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      return null
    }
  },

  getSedes,
  getSedeId,
  setSedeId,

  getSedeActiva() {
    const id = getSedeId()
    const sedes = getSedes()
    return sedes.find((s) => s.id === id) || null
  },

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token')
  },

  hasPermission(permission) {
    const user = this.getCurrentUser()
    if (!user) return false

    if (user.rol === 'Superusuario' || user.rol === 'Administrador') return true

    if (user.rol === 'Técnico') {
      return permission !== 'manage_users'
    }

    if (user.rol === 'Invitado') {
      return permission === 'view_only'
    }

    return false
  },

  canManageUsers() {
    const user = this.getCurrentUser()
    return user?.rol === 'Superusuario' || user?.rol === 'Administrador'
  },

  isSuperuser() {
    return this.getCurrentUser()?.rol === 'Superusuario'
  },
}
