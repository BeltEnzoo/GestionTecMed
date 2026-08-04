import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { pool, query } from '../src/db.js'

dotenv.config()

const users = [
  {
    email: 'admin@hospital.com',
    password: 'admin123',
    nombre: 'Super',
    apellido: 'Usuario',
    rol: 'Superusuario',
    sedeCodigo: null,
  },
  {
    email: 'juarez@hospital.com',
    password: 'juarez123',
    nombre: 'Hospital',
    apellido: 'Juárez',
    rol: 'Invitado',
    sedeCodigo: 'juarez',
  },
  {
    email: 'tresarroyos@hospital.com',
    password: 'tresa123',
    nombre: 'Hospital',
    apellido: 'Tres Arroyos',
    rol: 'Invitado',
    sedeCodigo: 'tres-arroyos',
  },
]

async function main() {
  const sedes = (await query('SELECT id, codigo FROM sedes')).rows
  const byCodigo = Object.fromEntries(sedes.map((s) => [s.codigo, s.id]))

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    const sedeId = u.sedeCodigo ? byCodigo[u.sedeCodigo] : null
    if (u.sedeCodigo && !sedeId) {
      throw new Error(`Sede no encontrada: ${u.sedeCodigo}`)
    }

    const existing = await query(
      'SELECT id FROM perfiles_usuarios WHERE email = $1',
      [u.email]
    )

    if (existing.rows[0]) {
      await query(
        `UPDATE perfiles_usuarios
         SET password_hash = $1, nombre = $2, apellido = $3, rol = $4,
             sede_id = $5, estado = 'Activo'
         WHERE email = $6`,
        [hash, u.nombre, u.apellido, u.rol, sedeId, u.email]
      )
      console.log(`Actualizado: ${u.email} (${u.rol})`)
    } else {
      await query(
        `INSERT INTO perfiles_usuarios (
          email, password_hash, nombre, apellido, rol, sede_id, estado, departamento, cargo
        ) VALUES ($1,$2,$3,$4,$5,$6,'Activo','Tecnología Médica',$7)`,
        [u.email, hash, u.nombre, u.apellido, u.rol, sedeId, u.rol]
      )
      console.log(`Creado: ${u.email} (${u.rol})`)
    }
  }

  await pool.end()
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  process.exit(1)
})
