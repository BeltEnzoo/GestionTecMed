import jwt from 'jsonwebtoken'
import { query } from '../db.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Sin permisos' })
    }
    next()
  }
}

export function isSuperuser(user) {
  return user?.rol === 'Superusuario'
}

export function canManageUsers(user) {
  return user?.rol === 'Superusuario' || user?.rol === 'Administrador'
}

/** Invitado: solo lectura. Superusuario, Admin y Técnico: escritura. */
export function requireWriteAccess(req, res, next) {
  if (req.user?.rol === 'Invitado') {
    return res.status(403).json({ error: 'Solo lectura: sin permisos de escritura' })
  }
  next()
}

/**
 * Resuelve la sede activa:
 * - Superusuario: header X-Sede-Id (obligatorio salvo rutas excluidas)
 * - Resto: su sede_id fija
 */
export async function resolveSede(req, res, next) {
  try {
    if (isSuperuser(req.user)) {
      const headerSede = req.headers['x-sede-id']
      if (!headerSede) {
        return res.status(400).json({ error: 'Seleccioná una sede' })
      }
      const { rows } = await query(
        `SELECT id, nombre, codigo FROM sedes WHERE id = $1 AND activa = TRUE`,
        [headerSede]
      )
      if (!rows[0]) {
        return res.status(400).json({ error: 'Sede inválida' })
      }
      req.sedeId = rows[0].id
      req.sede = rows[0]
      return next()
    }

    if (!req.user.sede_id) {
      return res.status(403).json({ error: 'Usuario sin sede asignada' })
    }
    req.sedeId = req.user.sede_id
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al resolver sede' })
  }
}
