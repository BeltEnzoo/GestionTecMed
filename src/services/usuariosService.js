import { api } from './api'

export const usuariosService = {
  async getUsuarios() {
    try {
      const { data } = await api('/api/usuarios')
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return { data: [], error: error.message }
    }
  },

  async getUsuarioById(id) {
    try {
      const { data } = await api(`/api/usuarios/${id}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error)
      return { data: null, error: error.message }
    }
  },

  async createUsuario(usuarioData) {
    try {
      const { data } = await api('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          email: usuarioData.email,
          password: usuarioData.password,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          telefono: usuarioData.telefono,
          departamento: usuarioData.departamento,
          cargo: usuarioData.cargo,
          rol: usuarioData.rol,
          estado: usuarioData.estado,
          fechaIngreso: usuarioData.fechaIngreso,
          permisos: usuarioData.permisos || {},
          avatarUrl: usuarioData.avatarUrl,
        }),
      })
      return { data, error: null }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return { data: null, error: error.message }
    }
  },

  async updateUsuario(id, usuarioData) {
    try {
      const payload = {
        email: usuarioData.email,
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        telefono: usuarioData.telefono,
        departamento: usuarioData.departamento,
        cargo: usuarioData.cargo,
        rol: usuarioData.rol,
        estado: usuarioData.estado,
        fechaIngreso: usuarioData.fechaIngreso,
        permisos: usuarioData.permisos || {},
        avatarUrl: usuarioData.avatarUrl,
      }
      if (usuarioData.password) {
        payload.password = usuarioData.password
      }

      const { data } = await api(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return { data: null, error: error.message }
    }
  },

  async deleteUsuario(id) {
    try {
      await api(`/api/usuarios/${id}`, { method: 'DELETE' })
      return { data: true, error: null }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return { data: false, error: error.message }
    }
  },

  async getEstadisticasUsuarios() {
    try {
      const { data } = await api('/api/usuarios/stats')
      return {
        data: {
          total: data.total || 0,
          activos: data.activos || 0,
          inactivos: (data.total || 0) - (data.activos || 0),
          porRol: {
            Administrador: data.administradores || 0,
            Técnico: data.tecnicos || 0,
            Invitado: data.invitados || 0,
          },
        },
        error: null,
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error)
      return { data: null, error: error.message }
    }
  },

  async updateUltimoAcceso() {
    return { error: null }
  },
}
