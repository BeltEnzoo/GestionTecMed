import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set')
}

// Una pool por instancia serverless (reutiliza conexiones en warm starts)
const globalForDb = globalThis

export const pool =
  globalForDb.__pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__pgPool = pool
} else {
  globalForDb.__pgPool = pool
}

export async function query(text, params) {
  return pool.query(text, params)
}
