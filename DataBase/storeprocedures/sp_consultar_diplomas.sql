-- =====================================================
-- Procedimiento: sp_consultar_diplomas
-- Descripción: Consulta diplomas con filtros opcionales
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================
DROP FUNCTION sp_consultar_diplomas(uuid,integer,character varying,date,date,boolean,integer,integer);
CREATE OR REPLACE FUNCTION sp_consultar_diplomas(
    p_id_usuario UUID DEFAULT NULL,            -- Filtrar por usuario específico
    p_id_actividad INTEGER DEFAULT NULL,       -- Filtrar por actividad específica
    p_tipo_diploma VARCHAR(50) DEFAULT NULL,   -- Filtrar por tipo de diploma
    p_fecha_desde DATE DEFAULT NULL,           -- Filtrar desde fecha
    p_fecha_hasta DATE DEFAULT NULL,           -- Filtrar hasta fecha
    p_solo_no_enviados BOOLEAN DEFAULT FALSE,  -- Solo diplomas no enviados por email
    p_limite INTEGER DEFAULT 100,              -- Límite de resultados
    p_offset INTEGER DEFAULT 0                 -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_registros BIGINT,
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200),
    tipo_actividad VARCHAR(50),
    tipo_diploma VARCHAR(50),
    nombre_diploma VARCHAR(200),
    posicion_diploma INTEGER,
    archivo_path_diploma VARCHAR(500),
    fecha_generacion_diploma TIMESTAMP,
    fecha_descarga_diploma TIMESTAMP,
    enviado_email_diploma BOOLEAN,
    fecha_envio_email_diploma TIMESTAMP,
    generado_por_nombre TEXT,
    observaciones_diploma TEXT
) AS $$
DECLARE
    v_total_registros BIGINT := 0;
    v_fecha_desde_filter DATE;
    v_fecha_hasta_filter DATE;
BEGIN
    -- Establecer fechas por defecto si no se proporcionan
    v_fecha_desde_filter := COALESCE(p_fecha_desde, '2020-01-01'::DATE);
    v_fecha_hasta_filter := COALESCE(p_fecha_hasta, CURRENT_DATE + INTERVAL '1 day');
    
    -- Validar límite y offset
    IF p_limite IS NULL OR p_limite <= 0 THEN
        p_limite := 100;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;
    
    -- Contar total de registros que cumplen los criterios
    SELECT COUNT(*) INTO v_total_registros
    FROM tb_diplomas d
    JOIN tb_usuarios u ON d.id_usuario = u.id_usuario
    LEFT JOIN tb_actividades a ON d.id_actividad = a.id_actividad
    LEFT JOIN tb_usuarios generador ON d.generado_por_usuario = generador.id_usuario
    LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad
    WHERE 
        (p_id_usuario IS NULL OR d.id_usuario = p_id_usuario)
        AND (p_id_actividad IS NULL OR d.id_actividad = p_id_actividad)
        AND (p_tipo_diploma IS NULL OR d.tipo_diploma = p_tipo_diploma)
        AND d.fecha_generacion_diploma::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
        AND (NOT p_solo_no_enviados OR d.enviado_email_diploma = FALSE);
    
    -- Si no hay registros, retornar información de éxito sin datos
    IF v_total_registros = 0 THEN
        RETURN QUERY SELECT 
            TRUE as success,
            'Consulta de diplomas realizada exitosamente. No se encontraron diplomas que cumplan los criterios.' as message,
            v_total_registros as total_registros,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(50) as tipo_diploma,
            NULL::VARCHAR(200) as nombre_diploma,
            NULL::INTEGER as posicion_diploma,
            NULL::VARCHAR(500) as archivo_path_diploma,
            NULL::TIMESTAMP as fecha_generacion_diploma,
            NULL::TIMESTAMP as fecha_descarga_diploma,
            NULL::BOOLEAN as enviado_email_diploma,
            NULL::TIMESTAMP as fecha_envio_email_diploma,
            NULL::TEXT as generado_por_nombre,
            NULL::TEXT as observaciones_diploma;
    ELSE
        -- Retornar datos de diplomas
        RETURN QUERY
        SELECT 
            TRUE as success,
            'Consulta de diplomas realizada exitosamente' as message,
            v_total_registros as total_registros,
            d.id_usuario as id_usuario,
            u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
            u.email_usuario as email_usuario,
            d.id_actividad as id_actividad,
            a.nombre_actividad as nombre_actividad,
            a.tipo_actividad as tipo_actividad,
            d.tipo_diploma as tipo_diploma,
            d.nombre_diploma as nombre_diploma,
            rc.posicion_resultado as posicion_diploma,
            d.archivo_path_diploma as archivo_path_diploma,
            d.fecha_generacion_diploma as fecha_generacion_diploma,
            d.fecha_descarga_diploma as fecha_descarga_diploma,
            d.enviado_email_diploma as enviado_email_diploma,
            d.fecha_envio_email_diploma as fecha_envio_email_diploma,
            generador.nombre_usuario || ' ' || generador.apellido_usuario as generado_por_nombre,
            d.observaciones_diploma as observaciones_diploma
        FROM tb_diplomas d
        JOIN tb_usuarios u ON d.id_usuario = u.id_usuario
        LEFT JOIN tb_actividades a ON d.id_actividad = a.id_actividad
        LEFT JOIN tb_usuarios generador ON d.generado_por_usuario = generador.id_usuario
        LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad
        WHERE 
            (p_id_usuario IS NULL OR d.id_usuario = p_id_usuario)
            AND (p_id_actividad IS NULL OR d.id_actividad = p_id_actividad)
            AND (p_tipo_diploma IS NULL OR d.tipo_diploma = p_tipo_diploma)
            AND d.fecha_generacion_diploma::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            AND (NOT p_solo_no_enviados OR d.enviado_email_diploma = FALSE)
        ORDER BY d.fecha_generacion_diploma DESC, d.tipo_diploma, rc.posicion_resultado
        LIMIT p_limite OFFSET p_offset;
    END IF;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar diplomas: ' || SQLERRM as message,
            NULL::BIGINT as total_registros,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(50) as tipo_diploma,
            NULL::VARCHAR(200) as nombre_diploma,
            NULL::INTEGER as posicion_diploma,
            NULL::VARCHAR(500) as archivo_path_diploma,
            NULL::TIMESTAMP as fecha_generacion_diploma,
            NULL::TIMESTAMP as fecha_descarga_diploma,
            NULL::BOOLEAN as enviado_email_diploma,
            NULL::TIMESTAMP as fecha_envio_email_diploma,
            NULL::TEXT as generado_por_nombre,
            NULL::TEXT as observaciones_diploma;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_diplomas(UUID, INTEGER, VARCHAR, DATE, DATE, BOOLEAN, INTEGER, INTEGER) IS 
'Consulta diplomas con filtros opcionales por usuario, actividad, tipo, fechas y estado de envío.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_diplomas(); -- Todos los diplomas
-- SELECT * FROM sp_consultar_diplomas(p_id_usuario := 'user-uuid'); -- Diplomas de un usuario
-- SELECT * FROM sp_consultar_diplomas(p_tipo_diploma := 'participacion'); -- Solo diplomas de participación
-- SELECT * FROM sp_consultar_diplomas(p_solo_no_enviados := TRUE); -- Solo diplomas no enviados
-- SELECT * FROM sp_consultar_diplomas(p_id_actividad := 1, p_tipo_diploma := 'primer_lugar'); -- Ganadores de una actividad
