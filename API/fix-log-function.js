// Script para corregir la función log_actividad
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'congreso_tecnologia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Javier123.',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

async function fixLogFunction() {
  try {
    console.log('Corrigiendo función log_actividad...');
    const client = await pool.connect();
    
    // Corregir la función log_actividad para usar tb_logs_sistema
    const correctedFunction = `
    CREATE OR REPLACE FUNCTION log_actividad()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO tb_logs_sistema (
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log,
            fecha_log
        ) VALUES (
            TG_OP,
            TG_TABLE_NAME,
            COALESCE(NEW.id::text, OLD.id::text),
            CASE 
                WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
                ELSE to_jsonb(NEW)
            END,
            CURRENT_TIMESTAMP
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    console.log('Ejecutando corrección...');
    await client.query(correctedFunction);
    
    console.log('✅ Función log_actividad corregida exitosamente');
    
    client.release();
    await pool.end();
    console.log('✅ Corrección completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles del error:', error);
    process.exit(1);
  }
}

fixLogFunction();
