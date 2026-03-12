import { supabase } from '../config/supabase'

// Tabla de stock/insumos
const STOCK_TABLE = 'stock_insumos'

// Función para mapear campos del formulario a columnas de la base de datos
const mapFormFieldsToDBColumns = (formData) => {
  const emptyStringToNull = (value) => {
    if (value === '' || value === undefined || value === 'EMPTY') {
      return null;
    }
    return value;
  };

  return {
    nombre: formData.nombre || '',
    descripcion: emptyStringToNull(formData.descripcion),
    categoria: formData.categoria || 'Insumo',
    cantidad: parseFloat(formData.cantidad) || 0,
    unidad_medida: formData.unidadMedida || 'unidades',
    stock_minimo: parseFloat(formData.stockMinimo) || 0,
    ubicacion: emptyStringToNull(formData.ubicacion),
    proveedor: emptyStringToNull(formData.proveedor),
    costo_unitario: formData.costoUnitario ? parseFloat(formData.costoUnitario) : null,
    fecha_ingreso: formData.fechaIngreso || new Date().toISOString().split('T')[0],
    fecha_vencimiento: formData.fechaVencimiento || null,
    notas: emptyStringToNull(formData.notas),
    created_by: formData.createdBy
  }
}

// Función para mapear datos de la base de datos al formato del frontend
const mapDBColumnsToFormFields = (dbData) => {
  return {
    id: dbData.id,
    nombre: dbData.nombre,
    descripcion: dbData.descripcion,
    categoria: dbData.categoria,
    cantidad: dbData.cantidad,
    unidadMedida: dbData.unidad_medida,
    stockMinimo: dbData.stock_minimo,
    ubicacion: dbData.ubicacion,
    proveedor: dbData.proveedor,
    costoUnitario: dbData.costo_unitario,
    fechaIngreso: dbData.fecha_ingreso,
    fechaVencimiento: dbData.fecha_vencimiento,
    notas: dbData.notas,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  }
}

export const stockService = {
  // Obtener todos los items de stock
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(STOCK_TABLE)
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching stock:', error)
      return { data: null, error }
    }
  },

  // Obtener un item de stock por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(STOCK_TABLE)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error fetching stock item:', error)
      return { data: null, error }
    }
  },

  // Crear un nuevo item de stock
  async create(stockData) {
    try {
      const dbData = mapFormFieldsToDBColumns(stockData)
      const { data, error } = await supabase
        .from(STOCK_TABLE)
        .insert([dbData])
        .select()
        .single()
      
      if (error) throw error
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error creating stock item:', error)
      return { data: null, error }
    }
  },

  // Actualizar un item de stock
  async update(id, stockData) {
    try {
      const dbData = mapFormFieldsToDBColumns(stockData)
      const { data, error } = await supabase
        .from(STOCK_TABLE)
        .update(dbData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error updating stock item:', error)
      return { data: null, error }
    }
  },

  // Eliminar un item de stock
  async delete(id) {
    try {
      const { error } = await supabase
        .from(STOCK_TABLE)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting stock item:', error)
      return { data: null, error }
    }
  },

  // Buscar items de stock
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(STOCK_TABLE)
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,ubicacion.ilike.%${searchTerm}%`)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching stock:', error)
      return { data: null, error }
    }
  }
}


