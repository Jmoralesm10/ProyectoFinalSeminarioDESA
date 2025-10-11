// =====================================================
// Configuración de Base de Datos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a PostgreSQL
const dbConfig = {
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  database: process.env['DB_NAME'] || 'congreso_tecnologia',
  user: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'Javier123.',
  ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // Tiempo de espera para obtener conexión
};

// Crear pool de conexiones
export const pool = new Pool(dbConfig);

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a la base de datos exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para ejecutar queries con manejo de errores
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Función para ejecutar stored procedures
export const executeStoredProcedure = async (
  procedureName: string, 
  params: any[] = []
): Promise<any> => {
  const client = await pool.connect();
  try {
    const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');
    const query = `SELECT * FROM ${procedureName}(${placeholders})`;
    const result = await client.query(query, params);
    return result.rows[0]; // Los stored procedures devuelven una sola fila
  } catch (error) {
    console.error(`Error ejecutando stored procedure ${procedureName}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

// Manejo de eventos del pool
pool.on('connect', () => {
  console.log('🔗 Nueva conexión establecida con la base de datos');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

// Cerrar pool al terminar la aplicación
process.on('SIGINT', async () => {
  console.log('🔄 Cerrando pool de conexiones...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando pool de conexiones...');
  await pool.end();
  process.exit(0);
});
