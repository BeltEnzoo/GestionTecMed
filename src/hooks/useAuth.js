import { useState, useEffect, useCallback } from 'react'
import { authServiceSimple } from '../services/authServiceSimple'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [sedes, setSedes] = useState([])
  const [sedeId, setSedeIdState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(() => {
    try {
      const currentUser = authServiceSimple.getCurrentUser()
      setUser(currentUser)
      setSedes(authServiceSimple.getSedes())
      setSedeIdState(authServiceSimple.getSedeId())
    } catch (err) {
      setError(err.message)
      setUser(null)
      setSedes([])
      setSedeIdState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const handleStorageChange = (e) => {
      if (
        !e.key ||
        e.key === 'user' ||
        e.key === 'isAuthenticated' ||
        e.key === 'sedeId' ||
        e.key === 'sedes'
      ) {
        refresh()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', refresh)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', refresh)
    }
  }, [refresh])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { user: userData, sedes: userSedes, error: err } =
        await authServiceSimple.signIn(email, password)
      if (err) throw new Error(err)
      setUser(userData)
      setSedes(userSedes || [])
      setSedeIdState(authServiceSimple.getSedeId())
      return { data: userData, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await authServiceSimple.signOut()
      if (err) throw new Error(err)
      setUser(null)
      setSedes([])
      setSedeIdState(null)
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const setSedeActiva = (id) => {
    authServiceSimple.setSedeId(id)
    setSedeIdState(id)
    // Recargar datos filtrados por la nueva sede
    window.location.reload()
  }

  const hasPermission = (permission) => authServiceSimple.hasPermission(permission)

  const sedeActiva = sedes.find((s) => s.id === sedeId) || null

  return {
    user,
    sedes,
    sedeId,
    sedeActiva,
    setSedeActiva,
    loading,
    error,
    signIn,
    signOut,
    hasPermission,
    canManageUsers: authServiceSimple.canManageUsers(),
    isSuperuser: user?.rol === 'Superusuario',
    isAuthenticated: !!user,
  }
}
