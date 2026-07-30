import { api } from './api'
import { uploadMultipleFiles, deleteFileFromStorage } from '../utils/fileUpload'

const mapFormFieldsToDBColumns = (formData) => {
  const emptyStringToNull = (value) => {
    if (value === '' || value === undefined || value === 'EMPTY') return null
    return value
  }

  return {
    nombre: emptyStringToNull(formData.nombre),
    marca: emptyStringToNull(formData.marca),
    modelo: emptyStringToNull(formData.modelo),
    numero_serie: emptyStringToNull(formData.numeroSerie),
    codigo_interno: emptyStringToNull(formData.codigoInterno),
    categoria: emptyStringToNull(formData.categoria),
    estado: formData.estado || 'activo',
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
    created_by: formData.createdBy,
  }
}

const mapDBColumnsToFormFields = (dbData) => ({
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
  updatedAt: dbData.updated_at,
  eventos: dbData.eventos,
  mantenimientos: dbData.mantenimientos,
})

export const equiposService = {
  async getEquipoById(id) {
    try {
      const { data } = await api(`/api/equipos/${id}`)
      return { data: mapDBColumnsToFormFields(data), error: null }
    } catch (error) {
      console.error('Error al obtener equipo por ID:', error)
      return { data: null, error: error.message }
    }
  },

  async getAll() {
    try {
      const { data } = await api('/api/equipos')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipos:', error)
      return { data: null, error }
    }
  },

  async getById(id) {
    try {
      const { data } = await api(`/api/equipos/${id}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching equipo:', error)
      return { data: null, error }
    }
  },

  async create(equipoData) {
    try {
      const filesToUpload = equipoData.archivos?.filter((f) => f.file instanceof File) || []
      const existingFiles = equipoData.archivos?.filter((f) => f.url || f.path) || []
      const mapped = { ...mapFormFieldsToDBColumns(equipoData), archivos: existingFiles }

      const { data: newEquipo } = await api('/api/equipos', {
        method: 'POST',
        body: JSON.stringify(mapped),
      })

      let uploadedFiles = [...existingFiles]
      if (filesToUpload.length > 0 && newEquipo?.id) {
        const uploadResults = await uploadMultipleFiles(filesToUpload, newEquipo.id.toString())
        uploadedFiles = [
          ...existingFiles,
          ...uploadResults
            .filter((r) => r.url && !r.error)
            .map((r) => ({
              url: r.url,
              path: r.path,
              name: r.name,
              type: r.type,
              size: r.size,
            })),
        ]

        if (uploadedFiles.length > existingFiles.length) {
          const { data: updated } = await api(`/api/equipos/${newEquipo.id}`, {
            method: 'PUT',
            body: JSON.stringify({ archivos: uploadedFiles }),
          })
          return { data: updated, error: null }
        }
      }

      return { data: { ...newEquipo, archivos: uploadedFiles }, error: null }
    } catch (error) {
      console.error('Error creating equipo:', error)
      if (error.code === '23505' || error.status === 409) {
        return { data: null, error: error.message }
      }
      return { data: null, error: error.message || error }
    }
  },

  async update(id, equipoData) {
    try {
      const filesToUpload = equipoData.archivos?.filter((f) => f.file instanceof File) || []
      const existingFiles = equipoData.archivos?.filter((f) => f.url || f.path) || []

      const { data: currentEquipo } = await api(`/api/equipos/${id}`)
      const currentFiles = currentEquipo?.archivos || []
      const filesToDelete = currentFiles.filter(
        (currentFile) =>
          !existingFiles.some(
            (existingFile) =>
              existingFile.path === currentFile.path || existingFile.url === currentFile.url
          )
      )

      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map((file) =>
            file.path ? deleteFileFromStorage(file.path) : Promise.resolve({ success: true })
          )
        )
      }

      let uploadedFiles = [...existingFiles]
      if (filesToUpload.length > 0) {
        const uploadResults = await uploadMultipleFiles(filesToUpload, id.toString())
        uploadedFiles = [
          ...existingFiles,
          ...uploadResults
            .filter((r) => r.url && !r.error)
            .map((r) => ({
              url: r.url,
              path: r.path,
              name: r.name,
              type: r.type,
              size: r.size,
            })),
        ]
      }

      const mappedData = mapFormFieldsToDBColumns({ ...equipoData, archivos: uploadedFiles })
      const { data } = await api(`/api/equipos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mappedData),
      })
      return { data, error: null }
    } catch (error) {
      console.error('Error updating equipo:', error)
      if (error.code === '23505' || error.status === 409) {
        return { data: null, error: error.message }
      }
      return { data: null, error: error.message || error }
    }
  },

  async delete(id) {
    try {
      await api(`/api/equipos/${id}`, { method: 'DELETE' })
      return { error: null }
    } catch (error) {
      console.error('Error deleting equipo:', error)
      return { error }
    }
  },

  async search(searchTerm) {
    try {
      const { data } = await api(`/api/equipos/search?q=${encodeURIComponent(searchTerm)}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error searching equipos:', error)
      return { data: null, error }
    }
  },

  async getByEstado(estado) {
    try {
      const { data } = await api('/api/equipos')
      return {
        data: (data || []).filter((e) => e.estado === estado),
        error: null,
      }
    } catch (error) {
      console.error('Error fetching equipos by estado:', error)
      return { data: null, error }
    }
  },

  async getByDepartamento(departamento) {
    try {
      const { data } = await api('/api/equipos')
      return {
        data: (data || []).filter((e) => e.departamento === departamento),
        error: null,
      }
    } catch (error) {
      console.error('Error fetching equipos by departamento:', error)
      return { data: null, error }
    }
  },

  async getStats() {
    try {
      const { data } = await api('/api/equipos/stats')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { data: null, error }
    }
  },
}
