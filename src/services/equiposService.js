import { supabase } from '../config/supabase'

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
      const mappedData = mapFormFieldsToDBColumns(equipoData)
      
      
      const { data, error } = await supabase
        .from(EQUIPOS_TABLE)
        .insert([mappedData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating equipo:', error)
      return { data: null, error }
    }
  },

  // Actualizar un equipo
  async update(id, equipoData) {
    try {
      const mappedData = mapFormFieldsToDBColumns(equipoData)
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
      return { data: null, error }
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

