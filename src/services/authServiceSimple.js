import { api, setSession, clearSession } from './api'

export const authServiceSimple = {
  async signIn(email, password) {
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setSession({ token: data.token, user: data.user })

      return {
        user: data.user,
        error: null,
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      return {
        user: null,
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

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token')
  },

  hasPermission(permission) {
    const user = this.getCurrentUser()
    if (!user) return false

    if (user.rol === 'Administrador') return true

    if (user.rol === 'Técnico') {
      return permission !== 'manage_users'
    }

    if (user.rol === 'Invitado') {
      return permission === 'view_only'
    }

    return false
  },
}
