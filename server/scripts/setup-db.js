import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { pool, query } from '../src/db.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runSqlFile(filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8')
  console.log(`Aplicando ${label}...`)
  await pool.query(sql)
  console.log(`${label} OK`)
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está configurada en server/.env')
    process.exit(1)
  }

  // 1) Migración primero (ALTER / seed sedes) para DBs ya existentes
  await runSqlFile(path.join(__dirname, '../db/migrate_sedes.sql'), 'migrate_sedes.sql')
  // 2) Schema idempotente (CREATE IF NOT EXISTS)
  await runSqlFile(path.join(__dirname, '../db/schema.sql'), 'schema.sql')

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
        email, password_hash, nombre, apellido, departamento, cargo, rol, estado, sede_id, permisos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9)`,
      [
        email,
        hash,
        'Administrador',
        'Sistema',
        'Tecnología Médica',
        'Superusuario',
        'Superusuario',
        'Activo',
        JSON.stringify({
          equipos: 'full',
          mantenimientos: 'full',
          reportes: 'full',
          usuarios: 'full',
          sedes: 'full',
        }),
      ]
    )
    console.log(`Superusuario creado: ${email} / ${password}`)
  } else {
    await query(
      `UPDATE perfiles_usuarios
       SET rol = 'Superusuario', sede_id = NULL
       WHERE email = $1`,
      [email]
    )
    console.log(`Usuario ${email} promovido a Superusuario`)
  }

  console.log('db:setup completado')
  await pool.end()
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  process.exit(1)
})
