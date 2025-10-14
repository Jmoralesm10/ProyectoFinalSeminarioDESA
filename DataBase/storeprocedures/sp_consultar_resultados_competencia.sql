-- =====================================================
-- Procedimiento: sp_consultar_resultados_competencia
-- Descripción: Consulta los resultados de una competencia específica
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_resultados_competencia(
    p_id_actividad INTEGER DEFAULT NULL,       -- Filtrar por competencia específica
    p_solo_ganadores BOOLEAN DEFAULT TRUE,     -- Solo mostrar ganadores (primeros 3 lugares)
    p_limite INTEGER DEFAULT 100,              -- Límite de resultados
    p_offset INTEGER DEFAULT 0                 -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_registros BIGINT,
    id_actividad INTEGER,
    nombre_competencia VARCHAR(200),
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    posicion_resultado INTEGER,
    puntuacion_resultado DECIMAL(10,2),
    descripcion_proyecto_resultado TEXT,
    foto_proyecto_path_resultado VARCHAR(500),
    fecha_resultado TIMESTAMP,
    observaciones_resultado TEXT,
    tipo_diploma_generado VARCHAR(50) -- Indica si ya tiene diploma generado
) AS $$
DECLARE
    v_total_registros BIGINT := 0;
BEGIN
    -- Validar límite y offset
    IF p_limite IS NULL OR p_limite <= 0 THEN
        p_limite := 100;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;
    
    -- Contar total de registros que cumplen los criterios
    SELECT COUNT(*) INTO v_total_registros
    FROM tb_resultados_competencia rc
    JOIN tb_usuarios u ON rc.id_usuario = u.id_usuario
    JOIN tb_actividades a ON rc.id_actividad = a.id_actividad
    WHERE 
        (p_id_actividad IS NULL OR rc.id_actividad = p_id_actividad)
        AND a.tipo_actividad = 'competencia'
        AND (NOT p_solo_ganadores OR rc.posicion_resultado IN (1, 2, 3));
    
    -- Retornar datos de resultados
    RETURN QUERY
    SELECT 
        TRUE as success,
        'Consulta de resultados de competencia realizada exitosamente' as message,
        v_total_registros as total_registros,
        rc.id_actividad as id_actividad,
        a.nombre_actividad as nombre_competencia,
        rc.id_usuario as id_usuario,
        u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
        u.email_usuario as email_usuario,
        rc.posicion_resultado as posicion_resultado,
        rc.puntuacion_resultado as puntuacion_resultado,
        rc.descripcion_proyecto_resultado as descripcion_proyecto_resultado,
        rc.foto_proyecto_path_resultado as foto_proyecto_path_resultado,
        rc.fecha_resultado as fecha_resultado,
        rc.observaciones_resultado as observaciones_resultado,
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM tb_diplomas d 
                WHERE d.id_usuario = rc.id_usuario 
                AND d.id_actividad = rc.id_actividad
                AND d.tipo_diploma = 'participacion'
            ) THEN 'participacion'
            ELSE NULL
        END as tipo_diploma_generado
    FROM tb_resultados_competencia rc
    JOIN tb_usuarios u ON rc.id_usuario = u.id_usuario
    JOIN tb_actividades a ON rc.id_actividad = a.id_actividad
    WHERE 
        (p_id_actividad IS NULL OR rc.id_actividad = p_id_actividad)
        AND a.tipo_actividad = 'competencia'
        AND (NOT p_solo_ganadores OR rc.posicion_resultado IN (1, 2, 3))
    ORDER BY rc.id_actividad, rc.posicion_resultado, rc.puntuacion_resultado DESC
    LIMIT p_limite OFFSET p_offset;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar resultados de competencia: ' || SQLERRM as message,
            NULL::BIGINT as total_registros,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_competencia,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::INTEGER as posicion_resultado,
            NULL::DECIMAL(10,2) as puntuacion_resultado,
            NULL::TEXT as descripcion_proyecto_resultado,
            NULL::VARCHAR(500) as foto_proyecto_path_resultado,
            NULL::TIMESTAMP as fecha_resultado,
            NULL::TEXT as observaciones_resultado,
            NULL::VARCHAR(50) as tipo_diploma_generado;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_resultados_competencia(INTEGER, BOOLEAN, INTEGER, INTEGER) IS 
'Consulta los resultados de competencias con información de ganadores y estado de diplomas generados.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_resultados_competencia(); -- Todos los resultados
-- SELECT * FROM sp_consultar_resultados_competencia(1); -- Resultados de una competencia específica
-- SELECT * FROM sp_consultar_resultados_competencia(1, TRUE); -- Solo ganadores de una competencia
-- SELECT * FROM sp_consultar_resultados_competencia(NULL, TRUE); -- Solo ganadores de todas las competencias
