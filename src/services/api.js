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

export function setSession({ token, user }) {
  if (token) localStorage.setItem('token', token)
  if (user) localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('isAuthenticated', 'true')
  window.dispatchEvent(new Event('localStorageChange'))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  window.dispatchEvent(new Event('localStorageChange'))
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
