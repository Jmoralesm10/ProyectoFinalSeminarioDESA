// Script para corregir la función log_actividad con el campo correcto
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

async function fixLogFunctionField() {
  try {
    console.log('Corrigiendo función log_actividad con campo correcto...');
    const client = await pool.connect();
    
    // Corregir la función log_actividad para usar el campo correcto según la tabla
    const correctedFunction = `
    CREATE OR REPLACE FUNCTION log_actividad()
    RETURNS TRIGGER AS $$
    DECLARE
        registro_id TEXT;
    BEGIN
        -- Determinar el ID del registro según la tabla
        CASE TG_TABLE_NAME
            WHEN 'tb_usuarios' THEN
                registro_id := COALESCE(NEW.id_usuario::text, OLD.id_usuario::text);
            WHEN 'tb_inscripciones_actividad' THEN
                registro_id := COALESCE(NEW.id_inscripcion::text, OLD.id_inscripcion::text);
            WHEN 'asistencia' THEN
                registro_id := COALESCE(NEW.id_asistencia::text, OLD.id_asistencia::text);
            WHEN 'resultados_competencia' THEN
                registro_id := COALESCE(NEW.id_resultado::text, OLD.id_resultado::text);
            ELSE
                registro_id := COALESCE(NEW.id::text, OLD.id::text);
        END CASE;
        
        INSERT INTO tb_logs_sistema (
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log,
            fecha_log
        ) VALUES (
            TG_OP,
            TG_TABLE_NAME,
            registro_id,
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
    
    console.log('✅ Función log_actividad corregida con campos correctos');
    
    client.release();
    await pool.end();
    console.log('✅ Corrección completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles del error:', error);
    process.exit(1);
  }
}

fixLogFunctionField();
