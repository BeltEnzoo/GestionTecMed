import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { debugLogin } from '../../utils/debugLogin'
import { testDirectQuery } from '../../utils/testDirectQuery'
import MedicalCarousel from './MedicalCarousel'
import './LoginForm.css'
import './MedicalCarousel.css'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, loading, error } = useAuth()
  const navigate = useNavigate()

  // Debug solo en desarrollo (comentado temporalmente)
  // useEffect(() => {
  //   if (import.meta.env.DEV) {
  //     console.log('🔍 LoginForm cargado - Variables de entorno OK')
  //   }
  // }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await signIn(formData.email, formData.password)
      if (data && !error) {
        console.log('✅ Login exitoso, forzando navegación...')
        // Forzar navegación inmediata
        window.location.href = '/'
      } else if (error) {
        console.error('❌ Error en login:', error)
      }
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err)
    }
  }

  return (
    <div className="login-container">
      <MedicalCarousel />
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">🏥 Gestión Equipamiento Médico</h1>
          <p className="login-subtitle">Acceso al Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-section">
            <h3 className="login-section-title">Credenciales</h3>
            <div className="login-form-field">
              <label className="login-form-label">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="login-form-input"
                required
                placeholder="tu.email@hospital.com"
              />
            </div>

            <div className="login-form-field">
              <label className="login-form-label">
                Contraseña *
              </label>
              <div className="login-form-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-form-input"
                  required
                  placeholder="Tu contraseña"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-form-password-toggle"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <div className="login-footer">
            <p className="login-info">
              🔒 Acceso restringido al personal autorizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm

