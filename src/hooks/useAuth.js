import { useState, useEffect } from 'react'
import { authServiceSimple } from '../services/authServiceSimple'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la aplicación
    const checkSession = () => {
      try {
        const currentUser = authServiceSimple.getCurrentUser()
        console.log('🔍 checkSession: Usuario actual:', currentUser ? 'Sí' : 'No')
        setUser(currentUser)
      } catch (err) {
        setError(err.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escuchar cambios en el localStorage para detectar logout
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'isAuthenticated') {
        checkSession()
      }
    }

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange)
    
    // También escuchar cambios en el mismo tab (custom event)
    const handleCustomStorageChange = () => {
      checkSession()
    }
    
    window.addEventListener('localStorageChange', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
    }
  }, [])

  const signIn = async (email, password) => {
    try {
      console.log('🔄 useAuth.signIn: Iniciando login...')
      setLoading(true)
      setError(null)
      const { user: userData, error } = await authServiceSimple.signIn(email, password)
      if (error) throw error
      console.log('✅ useAuth.signIn: Usuario establecido:', userData)
      setUser(userData)
      return { data: userData, error: null }
    } catch (err) {
      console.error('❌ useAuth.signIn: Error:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
      console.log('🔄 useAuth.signIn: Loading terminado')
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await authServiceSimple.signOut()
      if (error) throw error
      setUser(null)
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission) => {
    return authServiceSimple.hasPermission(permission)
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    hasPermission,
    isAuthenticated: !!user
  }
}