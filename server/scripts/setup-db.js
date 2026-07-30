import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { pool, query } from '../src/db.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está configurada en server/.env')
    process.exit(1)
  }

  const schemaPath = path.join(__dirname, '../db/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  console.log('Aplicando schema.sql...')
  await pool.query(schema)
  console.log('Schema OK')

  const email = (process.env.ADMIN_EMAIL || 'admin@hospital.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 10)

  const existing = await query(
    `SELECT id FROM perfiles_usuarios WHERE email = $1`,
    [email]
  )

  if (existing.rows.length === 0) {
    await query(
      `INSERT INTO perfiles_usuarios (
        email, password_hash, nombre, apellido, departamento, cargo, rol, estado, permisos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        email,
        hash,
        'Administrador',
        'Sistema',
        'Tecnología Médica',
        'Administrador de Sistema',
        'Administrador',
        'Activo',
        JSON.stringify({
          equipos: 'full',
          mantenimientos: 'full',
          reportes: 'full',
          usuarios: 'full',
        }),
      ]
    )
    console.log(`Admin creado: ${email} / ${password}`)
  } else {
    console.log(`Admin ya existe: ${email}`)
  }

  console.log('db:setup completado')
  await pool.end()
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  process.exit(1)
})
