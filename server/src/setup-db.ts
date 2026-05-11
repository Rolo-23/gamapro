import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('Iniciando configuración de la base de datos Neon PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: No se encontró DATABASE_URL en el archivo .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conexión establecida con éxito');

    const schemaPath = path.resolve(__dirname, '../../database/schema_postgres.sql');
    console.log(`Leyendo archivo de schema en: ${schemaPath}`);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Ejecutando script SQL...');
    await client.query(schemaSql);
    
    console.log('✅ Schema creado exitosamente en Neon PostgreSQL');
    client.release();
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
