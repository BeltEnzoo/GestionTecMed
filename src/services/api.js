// En Vercel: mismo origen (VITE_API_URL vacío o sin definir).
// En local: API Express en :3001.
const API_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? 'http://localhost:3001'
      : ''

export function getToken() {
  return localStorage.getItem('token')
}

export function getSedeId() {
  return localStorage.getItem('sedeId')
}

export function setSedeId(sedeId) {
  if (sedeId) localStorage.setItem('sedeId', sedeId)
  else localStorage.removeItem('sedeId')
  window.dispatchEvent(new Event('localStorageChange'))
}

export function setSession({ token, user, sedes }) {
  if (token) localStorage.setItem('token', token)
  if (user) localStorage.setItem('user', JSON.stringify(user))
  if (sedes) localStorage.setItem('sedes', JSON.stringify(sedes))
  localStorage.setItem('isAuthenticated', 'true')

  // Elegir sede activa
  const current = getSedeId()
  const sedeIds = (sedes || []).map((s) => s.id)
  if (user?.sede_id) {
    setSedeId(user.sede_id)
  } else if (current && sedeIds.includes(current)) {
    // mantener
  } else if (sedeIds[0]) {
    localStorage.setItem('sedeId', sedeIds[0])
  }

  window.dispatchEvent(new Event('localStorageChange'))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('sedes')
  localStorage.removeItem('sedeId')
  localStorage.removeItem('isAuthenticated')
  window.dispatchEvent(new Event('localStorageChange'))
}

export function getSedes() {
  try {
    return JSON.parse(localStorage.getItem('sedes') || '[]')
  } catch {
    return []
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const sedeId = getSedeId()
  if (sedeId && !path.startsWith('/api/auth') && !path.startsWith('/api/sedes')) {
    headers['X-Sede-Id'] = sedeId
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  let payload = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { error: text }
    }
  }

  if (!res.ok) {
    const err = new Error(payload?.error || `Error HTTP ${res.status}`)
    err.status = res.status
    err.code = payload?.code
    err.details = payload?.details
    err.payload = payload
    throw err
  }

  return payload
}

export { API_URL }
