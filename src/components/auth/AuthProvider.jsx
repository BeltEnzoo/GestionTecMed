import React, { createContext, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AuthContext = createContext()

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Solo redirigir si no está cargando y no está autenticado
    // Y no estamos en la página de login
    if (!auth.loading && !auth.isAuthenticated && location.pathname !== '/login') {
      console.log('🔄 AuthProvider: Redirigiendo a login')
      navigate('/login', { replace: true })
    }
  }, [auth.loading, auth.isAuthenticated, location.pathname, navigate])

  if (auth.loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    )
  }

  if (!auth.isAuthenticated && location.pathname !== '/login') {
    return null // Se redirigirá automáticamente
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

