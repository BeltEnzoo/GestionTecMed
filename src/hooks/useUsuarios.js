import { useState, useEffect } from 'react'
import { usuariosService } from '../services/usuariosService'

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await usuariosService.getUsuarios()
      
      if (error) {
        setError(error)
      } else {
        setUsuarios(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createUsuario = async (usuarioData) => {
    try {
      const { data, error } = await usuariosService.createUsuario(usuarioData)
      
      if (error) {
        throw new Error(error)
      }
      
      // Actualizar la lista local
      setUsuarios(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateUsuario = async (id, usuarioData) => {
    try {
      const { data, error } = await usuariosService.updateUsuario(id, usuarioData)
      
      if (error) {
        throw new Error(error)
      }
      
      // Actualizar la lista local
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === id ? data : usuario
        )
      )
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const deleteUsuario = async (id) => {
    try {
      const { data, error } = await usuariosService.deleteUsuario(id)
      
      if (error) {
        throw new Error(error)
      }
      
      // Actualizar la lista local
      setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
  }
}


