import { supabase } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'

const USUARIOS_TABLE = 'perfiles_usuarios'

// Función para mapear campos del formulario a columnas de la base de datos
const mapFormFieldsToDBColumns = (formData) => {
  const emptyStringToNull = (value) => {
    if (value === '' || value === null || value === undefined) return null
    return value
  }

  return {
    email: emptyStringToNull(formData.email),
    password: emptyStringToNull(formData.password),
    nombre: emptyStringToNull(formData.nombre),
    apellido: emptyStringToNull(formData.apellido),
    telefono: emptyStringToNull(formData.telefono),
    departamento: emptyStringToNull(formData.departamento),
    cargo: emptyStringToNull(formData.cargo),
    rol: emptyStringToNull(formData.rol),
    estado: emptyStringToNull(formData.estado),
    fecha_ingreso: formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().split('T')[0] : null,
    permisos: formData.permisos || {},
    avatar_url: emptyStringToNull(formData.avatarUrl),
    created_at: formData.fechaCreacion || new Date().toISOString(),
    created_by: formData.createdBy
  }
}

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    userId: dbData.id, // Usamos el mismo ID
    email: dbData.email,
    password: dbData.password, // Incluir password para el formulario
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

export const usuariosService = {
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const { data, error } = await supabase
        .from(USUARIOS_TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data ? data.map(mapDBColumnsToFormFields) : [],
        error: null
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return {
        data: [],
        error: error.message
      }
    }
  },

  // Obtener un usuario por ID
  async getUsuarioById(id) {
    try {
      const { data, error } = await supabase
        .from(USUARIOS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: mapDBColumnsToFormFields(data),
        error: null
      }
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error)
      return {
        data: null,
        error: error.message
      }
    }
  },

  // Crear un nuevo usuario
  async createUsuario(usuarioData) {
    try {
      // Crear el usuario directamente en nuestra tabla
      const mappedData = mapFormFieldsToDBColumns(usuarioData)

      const { data, error } = await supabase
        .from(USUARIOS_TABLE)
        .insert(mappedData)
        .select()
        .single()

      if (error) throw error

      return {
        data: mapDBColumnsToFormFields(data),
        error: null
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return {
        data: null,
        error: error.message
      }
    }
  },

  // Actualizar un usuario
  async updateUsuario(id, usuarioData) {
    try {
      const mappedData = mapFormFieldsToDBColumns(usuarioData)
      
      const { data, error } = await supabase
        .from(USUARIOS_TABLE)
        .update(mappedData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: mapDBColumnsToFormFields(data),
        error: null
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return {
        data: null,
        error: error.message
      }
    }
  },

  // Eliminar un usuario
  async deleteUsuario(id) {
    try {
      // Primero obtener el user_id para eliminar de auth.users
      const { data: usuario, error: fetchError } = await supabase
        .from(USUARIOS_TABLE)
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Eliminar de perfiles_usuarios (esto debería activar CASCADE en auth.users)
      const { error } = await supabase
        .from(USUARIOS_TABLE)
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return {
        data: false,
        error: error.message
      }
    }
  },

  // Obtener estadísticas de usuarios
  async getEstadisticasUsuarios() {
    try {
      // Total de usuarios
      const { data: total, error: totalError } = await supabase
        .from(USUARIOS_TABLE)
        .select('id', { count: 'exact', head: true })

      if (totalError) throw totalError

      // Usuarios activos
      const { data: activos, error: activosError } = await supabase
        .from(USUARIOS_TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'Activo')

      if (activosError) throw activosError

      // Usuarios por rol
      const { data: porRol, error: porRolError } = await supabase
        .from(USUARIOS_TABLE)
        .select('rol')
        .eq('estado', 'Activo')

      if (porRolError) throw porRolError

      // Agrupar por rol
      const rolesCount = porRol.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1
        return acc
      }, {})

      return {
        data: {
          total: total.length || 0,
          activos: activos.length || 0,
          inactivos: (total.length || 0) - (activos.length || 0),
          porRol: rolesCount
        },
        error: null
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error)
      return {
        data: null,
        error: error.message
      }
    }
  },

  // Actualizar último acceso
  async updateUltimoAcceso(userId) {
    try {
      const { error } = await supabase
        .from(USUARIOS_TABLE)
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error al actualizar último acceso:', error)
      return { error: error.message }
    }
  }
}
