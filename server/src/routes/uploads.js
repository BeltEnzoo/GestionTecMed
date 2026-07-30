import { Router } from 'express'
import multer from 'multer'
import { query } from '../db.js'
import { requireWriteAccess } from '../middleware/auth.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB (límite práctico en serverless)
})

const router = Router()

function publicBase(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '')
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export async function getFileHandler(req, res) {
  try {
    const { rows } = await query(
      `SELECT filename, mime_type, content FROM archivo_blobs WHERE id = $1`,
      [req.params.id]
    )
    if (!rows[0]) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }
    const file = rows[0]
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.filename || 'archivo')}"`
    )
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(file.content)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

router.post('/', requireWriteAccess, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' })
    }

    const equipoId = req.body.equipoId || null
    const { rows } = await query(
      `INSERT INTO archivo_blobs (equipo_id, filename, mime_type, size_bytes, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, filename, mime_type, size_bytes`,
      [
        equipoId,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.buffer,
      ]
    )

    const saved = rows[0]
    const path = saved.id
    const url = `${publicBase(req)}/api/uploads/file/${saved.id}`

    res.status(201).json({
      url,
      path,
      name: saved.filename,
      type: saved.mime_type,
      size: saved.size_bytes,
      error: null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ url: null, error: error.message })
  }
})

router.delete('/', requireWriteAccess, async (req, res) => {
  try {
    const filePath = req.body.path || req.query.path
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'path requerido' })
    }

    // path es el UUID del blob (nuevo) o una ruta legacy disco
    const uuidMatch = String(filePath).match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    )
    if (uuidMatch) {
      await query(`DELETE FROM archivo_blobs WHERE id = $1`, [uuidMatch[0]])
    }

    res.json({ success: true, error: null })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
