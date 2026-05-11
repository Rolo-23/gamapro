import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones a Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requiere SSL
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Ejecuta una query con parámetros y devuelve las filas resultantes.
 * Reemplaza el patrón pool.request().input().query() de mssql.
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Verifica la conexión a la base de datos.
 */
export async function getConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ Conectado a Neon PostgreSQL');
  } finally {
    client.release();
  }
}

/**
 * Cierra todas las conexiones del pool.
 */
export async function closeConnection(): Promise<void> {
  await pool.end();
  console.log('🔌 Pool de conexiones cerrado');
}
