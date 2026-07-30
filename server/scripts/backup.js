import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'
import { promisify } from 'util'
import dotenv from 'dotenv'

dotenv.config()

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backupsDir = path.join(__dirname, '../backups')

fs.mkdirSync(backupsDir, { recursive: true })

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está configurada')
    process.exit(1)
  }

  const outFile = path.join(backupsDir, `backup-${stamp()}.sql`)

  try {
    await execFileAsync(
      'pg_dump',
      [process.env.DATABASE_URL, '--no-owner', '--no-acl', '-f', outFile],
      { maxBuffer: 50 * 1024 * 1024 }
    )
    console.log(`Backup creado: ${outFile}`)
  } catch (error) {
    console.error(
      'pg_dump falló. Instalá PostgreSQL client tools o usá Neon Console → Export.\n',
      error.message
    )
    process.exit(1)
  }
}

main()
