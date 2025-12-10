import { supabase } from '../config/supabase'
import { uploadMultipleFiles, deleteFileFromStorage } from '../utils/fileUpload'

// Tabla de equipos
const EQUIPOS_TABLE = 'equipos'

// Función para mapear campos del formulario a columnas de la base de datos
const mapFormFieldsToDBColumns = (formData) => {
  // Función auxiliar para convertir cadenas vacías a null
  const emptyStringToNull = (value) => {
    if (value === '' || value === undefined || value === 'EMPTY') {
      return null;
    }
    return value;
  };

  return {
    nombre: emptyStringToNull(formData.nombre),
    marca: emptyStringToNull(formData.marca),
    modelo: emptyStringToNull(formData.modelo),
    numero_serie: emptyStringToNull(formData.numeroSerie),
    codigo_interno: emptyStringToNull(formData.codigoInterno),
    categoria: emptyStringToNull(formData.categoria),
    estado: formData.estado || 'activo', // Estado por defecto
    año_fabricacion: formData.añoFabricacion,
    potencia: emptyStringToNull(formData.potencia),
    voltaje: emptyStringToNull(formData.voltaje),
    dimensiones: emptyStringToNull(formData.dimensiones),
    peso: emptyStringToNull(formData.peso),
    certificaciones: emptyStringToNull(formData.certificaciones),
    fecha_vencimiento_garantia: formData.fechaVencimientoGarantia || null,
    edificio: emptyStringToNull(formData.edificio),
    piso: emptyStringToNull(formData.piso),
    sala: emptyStringToNull(formData.sala),
    cama: emptyStringToNull(formData.cama),
    responsable: emptyStringToNull(formData.responsable),
    departamento: emptyStringToNull(formData.departamento),
    frecuencia_mantenimiento: emptyStringToNull(formData.frecuenciaMantenimiento),
    proveedor_mantenimiento: emptyStringToNull(formData.proveedorMantenimiento),
    costo_promedio_mantenimiento: formData.costoPromedioMantenimiento,
    costo_adquisicion: formData.costoAdquisicion,
    valor_actual: formData.valorActual,
    notas: emptyStringToNull(formData.notas),
    archivos: formData.archivos || [],
    created_at: formData.fechaCreacion || new Date().toISOString(),
    created_by: formData.createdBy
  }
}

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    nombre: dbData.nombre,
    marca: dbData.marca,
    modelo: dbData.modelo,
    numeroSerie: dbData.numero_serie,
    codigoInterno: dbData.codigo_interno,
    categoria: dbData.categoria,
    estado: dbData.estado,
    añoFabricacion: dbData.año_fabricacion,
    potencia: dbData.potencia,
    voltaje: dbData.voltaje,
    dimensiones: dbData.dimensiones,
    peso: dbData.peso,
    certificaciones: dbData.certificaciones,
    fechaVencimientoGarantia: dbData.fecha_vencimiento_garantia,
    edificio: dbData.edificio,
    piso: dbData.piso,
    sala: dbData.sala,
    cama: dbData.cama,
    responsable: dbData.responsable,
    departamento: dbData.departamento,
    frecuenciaMantenimiento: dbData.frecuencia_mantenimiento,
    proveedorMantenimiento: dbData.proveedor_mantenimiento,
    costoPromedioMantenimiento: dbData.costo_promedio_mantenimiento,
    costoAdquisicion: dbData.costo_adquisicion,
    valorActual: dbData.valor_actual,
    notas: dbData.notas,
    archivos: dbData.archivos || [],
    añosAntigüedad: dbData.años_antigüedad,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  }
}

export const equiposService = {
  // Obtener un equipo específico por ID con su historial
  async getEquipoById(id) {
    try {
      // Obtener datos del equipo
      const { data: equipo, error: equipoError } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (equipoError) throw equipoError

      // Obtener eventos del historial
      const { data: eventos, error: eventosError } = await supabase
        .from('historial_eventos')
        .select('*')
        .eq('equipo_id', id)
        .order('fecha_evento', { ascending: false })

      if (eventosError) throw eventosError

      // Obtener mantenimientos
      const { data: mantenimientos, error: mantenimientosError } = await supabase
        .from('mantenimientos')
        .select('*')
        .eq('equipo_id', id)
        .order('fecha_programada', { ascending: false })

      if (mantenimientosError) throw mantenimientosError

      return {
        data: {
          ...mapDBColumnsToFormFields(equipo),
          eventos: eventos || [],
          mantenimientos: mantenimientos || []
        },
        error: null
      }
    } catch (error) {
      console.error('Error al obtener equipo por ID:', error)
      return {
        data: null,
        error: error.message
      }
    }
  },

  // Obtener todos los equipos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipos:', error)
      return { data: null, error }
    }
  },

  // Obtener un equipo por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipo:', error)
      return { data: null, error }
    }
  },

  // Crear un nuevo equipo
  async create(equipoData) {
    try {
      // Separar archivos del resto de los datos
      const filesToUpload = equipoData.archivos?.filter(f => f.file instanceof File) || []
      const existingFiles = equipoData.archivos?.filter(f => f.url || f.path) || []
      
      // Primero insertar el equipo para obtener el ID
      const mappedDataWithoutFiles = { ...mapFormFieldsToDBColumns(equipoData), archivos: existingFiles }
      
      const { data: newEquipo, error: insertError } = await supabase
        .from(EQUIPOS_TABLE)
        .insert([mappedDataWithoutFiles])
        .select()
        .single()
      
      if (insertError) throw insertError

      // Si hay archivos para subir, subirlos ahora que tenemos el ID
      let uploadedFiles = [...existingFiles]
      if (filesToUpload.length > 0 && newEquipo?.id) {
        const uploadResults = await uploadMultipleFiles(filesToUpload, newEquipo.id.toString())
        
        // Filtrar solo los archivos que se subieron correctamente
        uploadedFiles = [
          ...existingFiles,
          ...uploadResults
            .filter(result => result.url && !result.error)
            .map(result => ({
              url: result.url,
              path: result.path,
              name: result.name,
              type: result.type,
              size: result.size
            }))
        ]

        // Actualizar el equipo con las URLs de los archivos subidos
        if (uploadedFiles.length > existingFiles.length) {
          const { data: updatedEquipo, error: updateError } = await supabase
            .from(EQUIPOS_TABLE)
            .update({ archivos: uploadedFiles })
            .eq('id', newEquipo.id)
            .select()
            .single()
          
          if (updateError) {
            console.error('Error updating equipo with files:', updateError)
            // No lanzamos error aquí porque el equipo ya se creó, solo los archivos fallaron
          } else {
            return { data: updatedEquipo, error: null }
          }
        }
      }
      
      return { data: { ...newEquipo, archivos: uploadedFiles }, error: null }
    } catch (error) {
      console.error('Error creating equipo:', error)
      return { data: null, error: error.message || error }
    }
  },

  // Actualizar un equipo
  async update(id, equipoData) {
    try {
      // Separar archivos nuevos de los existentes
      const filesToUpload = equipoData.archivos?.filter(f => f.file instanceof File) || []
      const existingFiles = equipoData.archivos?.filter(f => f.url || f.path) || []
      
      // Obtener el equipo actual para comparar archivos
      const { data: currentEquipo } = await supabase
        .from(EQUIPOS_TABLE)
        .select('archivos')
        .eq('id', id)
        .single()
      
      // Determinar qué archivos se eliminaron
      const currentFiles = currentEquipo?.archivos || []
      const filesToDelete = currentFiles.filter(
        currentFile => !existingFiles.some(existingFile => 
          existingFile.path === currentFile.path || existingFile.url === currentFile.url
        )
      )
      
      // Eliminar archivos que ya no están en la lista
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map(file => {
            if (file.path) {
              return deleteFileFromStorage(file.path)
            }
            return Promise.resolve({ success: true })
          })
        )
      }
      
      // Subir nuevos archivos
      let uploadedFiles = [...existingFiles]
      if (filesToUpload.length > 0) {
        const uploadResults = await uploadMultipleFiles(filesToUpload, id.toString())
        
        uploadedFiles = [
          ...existingFiles,
          ...uploadResults
            .filter(result => result.url && !result.error)
            .map(result => ({
              url: result.url,
              path: result.path,
              name: result.name,
              type: result.type,
              size: result.size
            }))
        ]
      }
      
      // Actualizar el equipo con los nuevos datos
      const mappedData = mapFormFieldsToDBColumns({ ...equipoData, archivos: uploadedFiles })
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .update(mappedData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating equipo:', error)
      return { data: null, error: error.message || error }
    }
  },

  // Eliminar un equipo
  async delete(id) {
    try {
      const { error } = await supabase
        .from(EQUIPOS_TABLE)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting equipo:', error)
      return { error }
    }
  },

  // Buscar equipos
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%,numero_serie.ilike.%${searchTerm}%,codigo_interno.ilike.%${searchTerm}%,sala.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching equipos:', error)
      return { data: null, error }
    }
  },

  // Obtener equipos por estado
  async getByEstado(estado) {
    try {
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .eq('estado', estado)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipos by estado:', error)
      return { data: null, error }
    }
  },

  // Obtener equipos por departamento
  async getByDepartamento(departamento) {
    try {
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .select('*')
        .eq('departamento', departamento)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipos by departamento:', error)
      return { data: null, error }
    }
  },

  // Obtener estadísticas
  async getStats() {
    try {
      const { data: total, error: totalError } = await supabase
        .from(EQUIPOS_TABLE)
        .select('id', { count: 'exact' })
      
      if (totalError) throw totalError

      const { data: activos, error: activosError } = await supabase
        .from(EQUIPOS_TABLE)
        .select('id', { count: 'exact' })
        .eq('estado', 'activo')
      
      if (activosError) throw activosError

      const { data: mantenimiento, error: mantenimientoError } = await supabase
        .from(EQUIPOS_TABLE)
        .select('id', { count: 'exact' })
        .eq('estado', 'mantenimiento')
      
      if (mantenimientoError) throw mantenimientoError

      const { data: fueraServicio, error: fueraServicioError } = await supabase
        .from(EQUIPOS_TABLE)
        .select('id', { count: 'exact' })
        .eq('estado', 'fuera-servicio')
      
      if (fueraServicioError) throw fueraServicioError

      return {
        data: {
          total: total?.[0]?.count || 0,
          activos: activos?.[0]?.count || 0,
          mantenimiento: mantenimiento?.[0]?.count || 0,
          fueraServicio: fueraServicio?.[0]?.count || 0,
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { data: null, error }
    }
  }
}

