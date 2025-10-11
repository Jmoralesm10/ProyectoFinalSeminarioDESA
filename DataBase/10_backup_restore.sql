-- =====================================================
-- Script de respaldo y restauración
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Función para crear respaldo completo de la base de datos
CREATE OR REPLACE FUNCTION crear_respaldo_completo()
RETURNS TEXT AS $$
DECLARE
    v_fecha_actual TEXT;
    v_nombre_archivo TEXT;
    v_comando TEXT;
BEGIN
    -- Generar nombre de archivo con fecha y hora
    v_fecha_actual := to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    v_nombre_archivo := 'congreso_tecnologia_backup_' || v_fecha_actual || '.sql';
    
    -- Comando para crear respaldo (esto se ejecutaría desde el sistema operativo)
    v_comando := 'pg_dump -h localhost -U postgres -d congreso_tecnologia -f /backups/' || v_nombre_archivo;
    
    -- Registrar en logs
    INSERT INTO logs_sistema (accion, tabla_afectada, detalles, fecha_log)
    VALUES ('RESPALDO', 'DATABASE', 
            jsonb_build_object('archivo', v_nombre_archivo, 'comando', v_comando), 
            CURRENT_TIMESTAMP);
    
    RETURN 'Respaldo programado: ' || v_nombre_archivo || '. Ejecutar: ' || v_comando;
END;
$$ LANGUAGE plpgsql;

-- Función para crear respaldo de datos específicos
CREATE OR REPLACE FUNCTION crear_respaldo_datos(p_tabla VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_fecha_actual TEXT;
    v_nombre_archivo TEXT;
    v_comando TEXT;
BEGIN
    -- Validar que la tabla existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = p_tabla AND table_schema = 'public'
    ) THEN
        RETURN 'Error: La tabla ' || p_tabla || ' no existe';
    END IF;
    
    -- Generar nombre de archivo
    v_fecha_actual := to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    v_nombre_archivo := 'congreso_tecnologia_' || p_tabla || '_' || v_fecha_actual || '.sql';
    
    -- Comando para respaldo de tabla específica
    v_comando := 'pg_dump -h localhost -U postgres -d congreso_tecnologia -t ' || p_tabla || ' -f /backups/' || v_nombre_archivo;
    
    -- Registrar en logs
    INSERT INTO logs_sistema (accion, tabla_afectada, detalles, fecha_log)
    VALUES ('RESPALDO_TABLA', p_tabla, 
            jsonb_build_object('archivo', v_nombre_archivo, 'comando', v_comando), 
            CURRENT_TIMESTAMP);
    
    RETURN 'Respaldo de tabla programado: ' || v_nombre_archivo || '. Ejecutar: ' || v_comando;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION limpiar_logs_antiguos(p_dias INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_registros_eliminados INTEGER;
BEGIN
    -- Eliminar logs más antiguos que el número de días especificado
    DELETE FROM logs_sistema 
    WHERE fecha_log < CURRENT_TIMESTAMP - INTERVAL '1 day' * p_dias;
    
    GET DIAGNOSTICS v_registros_eliminados = ROW_COUNT;
    
    -- Registrar la limpieza
    INSERT INTO logs_sistema (accion, tabla_afectada, detalles, fecha_log)
    VALUES ('LIMPIEZA_LOGS', 'logs_sistema', 
            jsonb_build_object('dias', p_dias, 'registros_eliminados', v_registros_eliminados), 
            CURRENT_TIMESTAMP);
    
    RETURN v_registros_eliminados;
END;
$$ LANGUAGE plpgsql;

-- Función para exportar datos a CSV
CREATE OR REPLACE FUNCTION exportar_datos_csv(p_tabla VARCHAR, p_ruta VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_comando TEXT;
    v_fecha_actual TEXT;
    v_nombre_archivo TEXT;
BEGIN
    -- Validar que la tabla existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = p_tabla AND table_schema = 'public'
    ) THEN
        RETURN 'Error: La tabla ' || p_tabla || ' no existe';
    END IF;
    
    -- Generar nombre de archivo
    v_fecha_actual := to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    v_nombre_archivo := p_tabla || '_' || v_fecha_actual || '.csv';
    
    -- Comando para exportar a CSV
    v_comando := 'psql -h localhost -U postgres -d congreso_tecnologia -c "\COPY ' || p_tabla || ' TO ''' || p_ruta || '/' || v_nombre_archivo || ''' WITH CSV HEADER"';
    
    -- Registrar en logs
    INSERT INTO logs_sistema (accion, tabla_afectada, detalles, fecha_log)
    VALUES ('EXPORTAR_CSV', p_tabla, 
            jsonb_build_object('archivo', v_nombre_archivo, 'comando', v_comando), 
            CURRENT_TIMESTAMP);
    
    RETURN 'Exportación programada: ' || v_nombre_archivo || '. Ejecutar: ' || v_comando;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar integridad de la base de datos
CREATE OR REPLACE FUNCTION verificar_integridad_bd()
RETURNS TABLE (
    tabla VARCHAR,
    registros BIGINT,
    problemas TEXT[]
) AS $$
DECLARE
    rec RECORD;
    problemas TEXT[];
BEGIN
    -- Verificar cada tabla principal
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        problemas := ARRAY[]::TEXT[];
        
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM ' || rec.table_name INTO rec.registros;
        
        -- Verificaciones específicas por tabla
        CASE rec.table_name
            WHEN 'usuarios' THEN
                -- Verificar usuarios sin código QR
                IF EXISTS (SELECT 1 FROM usuarios WHERE codigo_qr IS NULL) THEN
                    problemas := array_append(problemas, 'Usuarios sin código QR');
                END IF;
                
                -- Verificar emails duplicados
                IF EXISTS (
                    SELECT email, COUNT(*) 
                    FROM usuarios 
                    GROUP BY email 
                    HAVING COUNT(*) > 1
                ) THEN
                    problemas := array_append(problemas, 'Emails duplicados');
                END IF;
                
            WHEN 'actividades' THEN
                -- Verificar actividades con cupo negativo
                IF EXISTS (SELECT 1 FROM actividades WHERE cupo_disponible < 0) THEN
                    problemas := array_append(problemas, 'Cupo disponible negativo');
                END IF;
                
                -- Verificar fechas inconsistentes
                IF EXISTS (SELECT 1 FROM actividades WHERE fecha_fin < fecha_inicio) THEN
                    problemas := array_append(problemas, 'Fechas inconsistentes');
                END IF;
                
            WHEN 'inscripciones_actividad' THEN
                -- Verificar inscripciones a actividades inactivas
                IF EXISTS (
                    SELECT 1 FROM inscripciones_actividad ia
                    JOIN actividades a ON ia.actividad_id = a.id
                    WHERE a.activo = false
                ) THEN
                    problemas := array_append(problemas, 'Inscripciones a actividades inactivas');
                END IF;
        END CASE;
        
        RETURN QUERY SELECT rec.table_name, rec.registros, problemas;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para optimizar la base de datos
CREATE OR REPLACE FUNCTION optimizar_bd()
RETURNS TEXT AS $$
DECLARE
    v_resultado TEXT := '';
BEGIN
    -- Actualizar estadísticas
    ANALYZE;
    v_resultado := v_resultado || 'Estadísticas actualizadas. ';
    
    -- Limpiar logs antiguos
    PERFORM limpiar_logs_antiguos(90);
    v_resultado := v_resultado || 'Logs antiguos limpiados. ';
    
    -- Vacuum de tablas principales
    VACUUM ANALYZE usuarios;
    VACUUM ANALYZE actividades;
    VACUUM ANALYZE inscripciones_actividad;
    VACUUM ANALYZE asistencia;
    v_resultado := v_resultado || 'Vacuum completado. ';
    
    -- Registrar optimización
    INSERT INTO logs_sistema (accion, tabla_afectada, detalles, fecha_log)
    VALUES ('OPTIMIZACION', 'DATABASE', 
            jsonb_build_object('resultado', v_resultado), 
            CURRENT_TIMESTAMP);
    
    RETURN 'Optimización completada: ' || v_resultado;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de las funciones de respaldo
COMMENT ON FUNCTION crear_respaldo_completo() IS 'Crea un respaldo completo de la base de datos';
COMMENT ON FUNCTION crear_respaldo_datos(VARCHAR) IS 'Crea respaldo de una tabla específica';
COMMENT ON FUNCTION limpiar_logs_antiguos(INTEGER) IS 'Limpia logs más antiguos que el número de días especificado';
COMMENT ON FUNCTION exportar_datos_csv(VARCHAR, VARCHAR) IS 'Exporta datos de una tabla a formato CSV';
COMMENT ON FUNCTION verificar_integridad_bd() IS 'Verifica la integridad de la base de datos';
COMMENT ON FUNCTION optimizar_bd() IS 'Optimiza la base de datos ejecutando mantenimiento';
