import jwt from 'jsonwebtoken'

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

/** Invitado: solo lectura (GET). Técnico y Admin: todo. */
export function requireWriteAccess(req, res, next) {
  if (req.user?.rol === 'Invitado') {
    return res.status(403).json({ error: 'Solo lectura: sin permisos de escritura' })
  }
  next()
}
