import { supabase } from '../config/supabase';

// Función para mapear campos del formulario a columnas de la base de datos
const mapFormFieldsToDBColumns = async (formData) => {
  const dbData = {};
  
  // Si se proporciona un equipo, necesitamos obtener su ID
  if (formData.equipo !== undefined && formData.equipo !== '') {
    try {
      // Buscar el equipo por nombre para obtener su ID
      const { data: equipo, error } = await supabase
        .from('equipos')
        .select('id')
        .eq('nombre', formData.equipo)
        .single();
      
      if (error) {
        console.error('Error al buscar equipo:', error);
        throw new Error('No se pudo encontrar el equipo seleccionado');
      }
      
      dbData.equipo_id = equipo.id;
    } catch (error) {
      throw new Error('Error al procesar el equipo: ' + error.message);
    }
  }
  
  if (formData.tipo !== undefined) dbData.tipo = formData.tipo;
  if (formData.tecnico !== undefined) dbData.tecnico = formData.tecnico;
  if (formData.fechaProgramada !== undefined) dbData.fecha_programada = formData.fechaProgramada;
  if (formData.descripcion !== undefined) dbData.descripcion = formData.descripcion;
  if (formData.costo !== undefined) dbData.costo = formData.costo;
  if (formData.estado !== undefined) dbData.estado = formData.estado;
  
  // Si el estado es "Completado" y no hay fecha de completado, agregar la fecha actual
  if (formData.estado === 'Completado' && !formData.fechaCompletado) {
    dbData.fecha_completado = new Date().toISOString().split('T')[0];
  } else if (formData.fechaCompletado !== undefined) {
    dbData.fecha_completado = formData.fechaCompletado;
  }
  
  return dbData;
};

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    equipo: dbData.equipo_id,
    equipos: dbData.equipos, // Incluir la relación completa
    tipo: dbData.tipo,
    tecnico: dbData.tecnico,
    fechaProgramada: dbData.fecha_programada,
    fechaCompletado: dbData.fecha_completado,
    descripcion: dbData.descripcion,
    costo: dbData.costo,
    estado: dbData.estado,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  };
};

// Obtener todos los mantenimientos
export const getMantenimientos = async () => {
  try {
    // Primero intentar con la relación directa
    let { data, error } = await supabase
      .from('mantenimientos')
      .select(`
        *,
        equipos!equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `)
      .order('created_at', { ascending: false });

    // Si falla, intentar con una consulta manual
    if (error || !data || data.length === 0) {
      console.log('Error en relación directa, intentando consulta manual:', error);
      
      const { data: mantenimientosData, error: mantenimientosError } = await supabase
        .from('mantenimientos')
        .select('*')
        .order('created_at', { ascending: false });

      if (mantenimientosError) throw mantenimientosError;

      // Obtener los equipos por separado
      const equiposIds = mantenimientosData.map(m => m.equipo_id).filter(Boolean);
      const { data: equiposData, error: equiposError } = await supabase
        .from('equipos')
        .select('*')
        .in('id', equiposIds);

      if (equiposError) throw equiposError;

      // Combinar los datos manualmente
      data = mantenimientosData.map(mantenimiento => ({
        ...mantenimiento,
        equipos: equiposData.find(equipo => equipo.id === mantenimiento.equipo_id) || null
      }));
    }


    return {
      data: data ? data.map(mapDBColumnsToFormFields) : [],
      error: null
    };
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    return {
      data: [],
      error: error.message
    };
  }
};

// Crear un nuevo mantenimiento
export const createMantenimiento = async (mantenimientoData) => {
  try {
    const dbData = await mapFormFieldsToDBColumns(mantenimientoData);
    
    const { data, error } = await supabase
      .from('mantenimientos')
      .insert([dbData])
      .select(`
        *,
        equipos:equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `)
      .single();

    if (error) throw error;

    return {
      data: mapDBColumnsToFormFields(data),
      error: null
    };
  } catch (error) {
    console.error('Error al crear mantenimiento:', error);
    return {
      data: null,
      error: error.message
    };
  }
};

// Actualizar un mantenimiento existente
export const updateMantenimiento = async (id, mantenimientoData) => {
  try {
    const dbData = await mapFormFieldsToDBColumns(mantenimientoData);
    
    const { data, error } = await supabase
      .from('mantenimientos')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        equipos:equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `)
      .single();

    if (error) throw error;

    return {
      data: mapDBColumnsToFormFields(data),
      error: null
    };
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error);
    return {
      data: null,
      error: error.message
    };
  }
};

// Eliminar un mantenimiento
export const deleteMantenimiento = async (id) => {
  try {
    const { error } = await supabase
      .from('mantenimientos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      data: true,
      error: null
    };
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    return {
      data: false,
      error: error.message
    };
  }
};

// Buscar mantenimientos
export const searchMantenimientos = async (searchTerm, filterStatus = 'todos') => {
  try {
    // Usar la misma lógica que getMantenimientos pero con filtros
    let { data, error } = await supabase
      .from('mantenimientos')
      .select(`
        *,
        equipos!equipo_id (
          id,
          nombre,
          marca,
          modelo
        )
      `);

    // Aplicar filtro de estado si no es "todos"
    if (filterStatus !== 'todos') {
      data = data?.filter(m => m.estado === filterStatus);
    }

    // Aplicar búsqueda por texto si se proporciona
    if (searchTerm && searchTerm.trim() !== '') {
      data = data?.filter(m => 
        m.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por fecha de creación
    data = data?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Si falla la relación, usar consulta manual
    if (error || !data || data.some(m => !m.equipos)) {
      console.log('Error en relación de búsqueda, usando consulta manual');
      
      let query = supabase.from('mantenimientos').select('*');
      
      if (filterStatus !== 'todos') {
        query = query.eq('estado', filterStatus);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`tecnico.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`);
      }
      
      const { data: mantenimientosData, error: mantenimientosError } = await query
        .order('created_at', { ascending: false });

      if (mantenimientosError) throw mantenimientosError;

      // Obtener equipos
      const equiposIds = mantenimientosData.map(m => m.equipo_id).filter(Boolean);
      const { data: equiposData, error: equiposError } = await supabase
        .from('equipos')
        .select('*')
        .in('id', equiposIds);

      if (equiposError) throw equiposError;

      // Combinar datos
      data = mantenimientosData.map(mantenimiento => ({
        ...mantenimiento,
        equipos: equiposData.find(equipo => equipo.id === mantenimiento.equipo_id) || null
      }));
    }

    return {
      data: data ? data.map(mapDBColumnsToFormFields) : [],
      error: null
    };
  } catch (error) {
    console.error('Error al buscar mantenimientos:', error);
    return {
      data: [],
      error: error.message
    };
  }
};
