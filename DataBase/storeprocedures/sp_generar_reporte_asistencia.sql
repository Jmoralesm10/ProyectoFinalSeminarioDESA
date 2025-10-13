-- =====================================================
-- Procedimiento: sp_generar_reporte_asistencia
-- Descripción: Genera reportes de asistencia general y por actividades
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_generar_reporte_asistencia(
    p_tipo_reporte VARCHAR(20) DEFAULT 'general',  -- 'general', 'actividades', 'completo'
    p_fecha_desde DATE DEFAULT NULL,               -- Fecha desde (opcional)
    p_fecha_hasta DATE DEFAULT NULL,               -- Fecha hasta (opcional)
    p_id_actividad INTEGER DEFAULT NULL,           -- ID de actividad específica (opcional)
    p_limite INTEGER DEFAULT 1000,                 -- Límite de resultados
    p_offset INTEGER DEFAULT 0                     -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    tipo_reporte VARCHAR(20),
    total_registros BIGINT,
    fecha_desde DATE,
    fecha_hasta DATE,
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    tipo_usuario VARCHAR(50),
    fecha_asistencia DATE,
    hora_asistencia TIMESTAMP,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200),
    tipo_actividad VARCHAR(50),
    lugar_actividad VARCHAR(200),
    categoria_actividad VARCHAR(100)
) AS $$
DECLARE
    v_fecha_desde DATE;
    v_fecha_hasta DATE;
    v_total_registros BIGINT := 0;
BEGIN
    -- Validar tipo de reporte
    IF p_tipo_reporte NOT IN ('general', 'actividades', 'completo') THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Tipo de reporte inválido. Use: general, actividades o completo' as message,
            NULL::VARCHAR(20) as tipo_reporte,
            NULL::BIGINT as total_registros,
            NULL::DATE as fecha_desde,
            NULL::DATE as fecha_hasta,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_asistencia,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(200) as lugar_actividad,
            NULL::VARCHAR(100) as categoria_actividad;
        RETURN;
    END IF;
    
    -- Establecer fechas por defecto si no se proporcionan
    v_fecha_desde := COALESCE(p_fecha_desde, CURRENT_DATE - INTERVAL '7 days');
    v_fecha_hasta := COALESCE(p_fecha_hasta, CURRENT_DATE);
    
    -- Reporte de asistencia general
    IF p_tipo_reporte IN ('general', 'completo') THEN
        -- Contar total de registros
        SELECT COUNT(*) INTO v_total_registros
        FROM tb_asistencia_general ag
        JOIN tb_usuarios u ON ag.id_usuario = u.id_usuario
        WHERE ag.fecha_asistencia >= v_fecha_desde
        AND ag.fecha_asistencia <= v_fecha_hasta;
        
        -- Retornar datos de asistencia general
        RETURN QUERY
        SELECT 
            TRUE as success,
            'Reporte de asistencia general generado' as message,
            'general'::VARCHAR(20) as tipo_reporte,
            v_total_registros as total_registros,
            v_fecha_desde as fecha_desde,
            v_fecha_hasta as fecha_hasta,
            u.id_usuario as id_usuario,
            u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
            u.email_usuario as email_usuario,
            tu.nombre_tipo_usuario as tipo_usuario,
            ag.fecha_asistencia as fecha_asistencia,
            ag.hora_ingreso as hora_asistencia,
            NULL::INTEGER as id_actividad,
            'Asistencia General al Congreso'::VARCHAR(200) as nombre_actividad,
            'congreso'::VARCHAR(50) as tipo_actividad,
            'Facultad de Ingeniería'::VARCHAR(200) as lugar_actividad,
            'General'::VARCHAR(100) as categoria_actividad
        FROM tb_asistencia_general ag
        JOIN tb_usuarios u ON ag.id_usuario = u.id_usuario
        JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE ag.fecha_asistencia >= v_fecha_desde
        AND ag.fecha_asistencia <= v_fecha_hasta
        ORDER BY ag.fecha_asistencia DESC, ag.hora_ingreso DESC
        LIMIT p_limite OFFSET p_offset;
    END IF;
    
    -- Reporte de asistencia por actividades
    IF p_tipo_reporte IN ('actividades', 'completo') THEN
        -- Contar total de registros
        SELECT COUNT(*) INTO v_total_registros
        FROM tb_asistencia_actividad aa
        JOIN tb_usuarios u ON aa.id_usuario = u.id_usuario
        JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
        WHERE DATE(aa.fecha_asistencia) >= v_fecha_desde
        AND DATE(aa.fecha_asistencia) <= v_fecha_hasta
        AND (p_id_actividad IS NULL OR aa.id_actividad = p_id_actividad);
        
        -- Retornar datos de asistencia por actividades
        RETURN QUERY
        SELECT 
            TRUE as success,
            'Reporte de asistencia por actividades generado' as message,
            'actividades'::VARCHAR(20) as tipo_reporte,
            v_total_registros as total_registros,
            v_fecha_desde as fecha_desde,
            v_fecha_hasta as fecha_hasta,
            u.id_usuario as id_usuario,
            u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
            u.email_usuario as email_usuario,
            tu.nombre_tipo_usuario as tipo_usuario,
            DATE(aa.fecha_asistencia) as fecha_asistencia,
            aa.fecha_asistencia as hora_asistencia,
            aa.id_actividad as id_actividad,
            a.nombre_actividad as nombre_actividad,
            a.tipo_actividad as tipo_actividad,
            a.lugar_actividad as lugar_actividad,
            ca.nombre_categoria as categoria_actividad
        FROM tb_asistencia_actividad aa
        JOIN tb_usuarios u ON aa.id_usuario = u.id_usuario
        JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
        JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
        JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE DATE(aa.fecha_asistencia) >= v_fecha_desde
        AND DATE(aa.fecha_asistencia) <= v_fecha_hasta
        AND (p_id_actividad IS NULL OR aa.id_actividad = p_id_actividad)
        ORDER BY aa.fecha_asistencia DESC
        LIMIT p_limite OFFSET p_offset;
    END IF;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al generar reporte: ' || SQLERRM as message,
            NULL::VARCHAR(20) as tipo_reporte,
            NULL::BIGINT as total_registros,
            NULL::DATE as fecha_desde,
            NULL::DATE as fecha_hasta,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_asistencia,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(200) as lugar_actividad,
            NULL::VARCHAR(100) as categoria_actividad;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_generar_reporte_asistencia(VARCHAR, DATE, DATE, INTEGER, INTEGER, INTEGER) IS 
'Genera reportes de asistencia con diferentes tipos: general (solo entrada al congreso), 
actividades (solo talleres/competencias) o completo (ambos). Permite filtros por fechas y actividades específicas.';

-- Ejemplos de uso:
-- SELECT * FROM sp_generar_reporte_asistencia('general');
-- SELECT * FROM sp_generar_reporte_asistencia('actividades', '2025-11-12', '2025-11-13');
-- SELECT * FROM sp_generar_reporte_asistencia('completo', NULL, NULL, 1, 50, 0);
