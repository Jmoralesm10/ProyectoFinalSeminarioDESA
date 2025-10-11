// Script para verificar triggers y corregir el problema
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

async function checkTriggers() {
  try {
    console.log('Verificando triggers y tablas...');
    const client = await pool.connect();
    
    // Verificar si existe la tabla logs_sistema
    console.log('\n1. Verificando tabla logs_sistema...');
    const logsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'logs_sistema'
      );
    `);
    console.log('Tabla logs_sistema existe:', logsTableCheck.rows[0].exists);
    
    // Verificar si existe la tabla tb_logs_sistema
    console.log('\n2. Verificando tabla tb_logs_sistema...');
    const tbLogsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tb_logs_sistema'
      );
    `);
    console.log('Tabla tb_logs_sistema existe:', tbLogsTableCheck.rows[0].exists);
    
    // Listar triggers en tb_usuarios
    console.log('\n3. Triggers en tb_usuarios:');
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_timing, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'tb_usuarios'
      ORDER BY action_timing, event_manipulation;
    `);
    
    triggers.rows.forEach(trigger => {
      console.log(`- ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
    });
    
    // Verificar la función log_actividad
    console.log('\n4. Verificando función log_actividad...');
    const functionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'log_actividad'
      );
    `);
    console.log('Función log_actividad existe:', functionCheck.rows[0].exists);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTriggers();
