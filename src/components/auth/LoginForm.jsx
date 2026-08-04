import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error: signError } = await signIn(formData.email, formData.password)
      if (data && !signError) {
        window.location.href = '/'
      } else if (signError) {
        console.error('Error en login:', signError)
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err)
    }
  }

  return (
    <div className="login-container">
      <MedicalCarousel />
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand" aria-hidden>TM</div>
          <h1 className="login-title">Gestión Equipamiento Médico</h1>
          <p className="login-subtitle">Acceso al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-field">
            <label className="login-form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-form-input"
              required
              autoComplete="email"
              placeholder="tu.email@hospital.com"
            />
          </div>

          <div className="login-form-field">
            <label className="login-form-label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="login-form-password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-form-input"
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-form-password-toggle"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <div className="login-footer">
            <p className="login-info">
              Acceso restringido al personal autorizado
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
