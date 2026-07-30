import { api } from './api'

const mapFormFieldsToDBColumns = (formData) => {
  const emptyStringToNull = (value) => {
    if (value === '' || value === undefined || value === 'EMPTY') return null
    return value
  }

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
    created_by: formData.createdBy,
  }
}

const mapDBColumnsToFormFields = (dbData) => ({
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
  updatedAt: dbData.updated_at,
})

export const stockService = {
  async getAll() {
    try {
      const { data } = await api('/api/stock')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching stock:', error)
      return { data: null, error }
    }
  },

  async getById(id) {
    try {
      const { data } = await api(`/api/stock/${id}`)
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error fetching stock item:', error)
      return { data: null, error }
    }
  },

  async create(stockData) {
    try {
      const { data } = await api('/api/stock', {
        method: 'POST',
        body: JSON.stringify(mapFormFieldsToDBColumns(stockData)),
      })
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error creating stock item:', error)
      return { data: null, error }
    }
  },

  async update(id, stockData) {
    try {
      const { data } = await api(`/api/stock/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapFormFieldsToDBColumns(stockData)),
      })
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error updating stock item:', error)
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      await api(`/api/stock/${id}`, { method: 'DELETE' })
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting stock item:', error)
      return { data: null, error }
    }
  },

  async search(searchTerm) {
    try {
      const { data } = await api(`/api/stock/search?q=${encodeURIComponent(searchTerm)}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error searching stock:', error)
      return { data: null, error }
    }
  },
}
