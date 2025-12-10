import { supabase } from '../config/supabase'

const STORAGE_BUCKET = 'equipos-files'

/**
 * Sube un archivo a Supabase Storage
 * @param {File} file - El archivo a subir
 * @param {string} equipoId - ID del equipo (para crear la carpeta)
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export const uploadFileToStorage = async (file, equipoId) => {
  try {
    // Crear un nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${equipoId}/${fileName}`

    // Subir el archivo
    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { url: null, error: uploadError.message }
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      error: null,
      path: filePath,
      name: file.name,
      type: file.type,
      size: file.size
    }
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error)
    return { url: null, error: error.message }
  }
}

/**
 * Sube múltiples archivos a Supabase Storage
 * @param {File[]} files - Array de archivos a subir
 * @param {string} equipoId - ID del equipo (para crear la carpeta)
 * @returns {Promise<Array<{url: string, error: null} | {url: null, error: string}>>}
 */
export const uploadMultipleFiles = async (files, equipoId) => {
  const uploadPromises = files.map(file => uploadFileToStorage(file.file || file, equipoId))
  const results = await Promise.all(uploadPromises)
  return results
}

/**
 * Elimina un archivo de Supabase Storage
 * @param {string} filePath - Ruta del archivo en Storage
 * @returns {Promise<{success: boolean, error: null | string}>}
 */
export const deleteFileFromStorage = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteFileFromStorage:', error)
    return { success: false, error: error.message }
  }
}

