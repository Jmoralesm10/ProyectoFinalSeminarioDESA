// Script para corregir definitivamente el stored procedure
const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'congreso_tecnologia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Javier123.',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

async function fixSPFinal() {
  try {
    console.log('Corrigiendo definitivamente el stored procedure...');
    const client = await pool.connect();
    
    // Eliminar el stored procedure existente
    console.log('Eliminando stored procedure existente...');
    await client.query('DROP FUNCTION IF EXISTS sp_inscribir_usuario(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR)');
    
    // Leer y ejecutar el stored procedure corregido
    const spPath = path.join(__dirname, '..', 'DataBase', 'storeprocedures', 'sp_inscribir_usuario.sql');
    const spContent = fs.readFileSync(spPath, 'utf8');
    
    console.log('Creando stored procedure corregido...');
    await client.query(spContent);
    
    console.log('✅ Stored procedure corregido exitosamente');
    
    client.release();
    await pool.end();
    console.log('✅ Corrección completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles del error:', error);
    process.exit(1);
  }
}

fixSPFinal();
