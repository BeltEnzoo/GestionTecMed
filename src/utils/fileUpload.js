import { api, API_URL, getToken, getSedeId } from '../services/api'

/**
 * Sube un archivo al backend (multer /uploads)
 */
export const uploadFileToStorage = async (file, equipoId) => {
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('equipoId', equipoId)

    const headers = {
      Authorization: `Bearer ${getToken()}`,
    }
    const sedeId = getSedeId()
    if (sedeId) headers['X-Sede-Id'] = sedeId

    const res = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      headers,
      body: form,
    })

    const data = await res.json()
    if (!res.ok) {
      return { url: null, error: data.error || 'Error al subir archivo' }
    }

    return {
      url: data.url,
      error: null,
      path: data.path,
      name: data.name,
      type: data.type,
      size: data.size,
    }
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error)
    return { url: null, error: error.message }
  }
}

export const uploadMultipleFiles = async (files, equipoId) => {
  const uploadPromises = files.map((file) =>
    uploadFileToStorage(file.file || file, equipoId)
  )
  return Promise.all(uploadPromises)
}

export const deleteFileFromStorage = async (filePath) => {
  try {
    await api('/api/uploads', {
      method: 'DELETE',
      body: JSON.stringify({ path: filePath }),
    })
    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteFileFromStorage:', error)
    return { success: false, error: error.message }
  }
}
