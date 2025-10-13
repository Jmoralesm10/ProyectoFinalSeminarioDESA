-- =====================================================
-- Procedimiento: sp_consultar_historial_usuario
-- Descripción: Consulta el historial completo de un usuario
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_historial_usuario(
    p_id_usuario UUID,                    -- ID del usuario a consultar
    p_tipo_historial VARCHAR(50) DEFAULT 'completo', -- 'completo', 'actividades', 'asistencias', 'administracion'
    p_fecha_desde DATE DEFAULT NULL,      -- Filtrar desde esta fecha
    p_fecha_hasta DATE DEFAULT NULL,      -- Filtrar hasta esta fecha
    p_limite INTEGER DEFAULT 50,          -- Límite de registros
    p_offset INTEGER DEFAULT 0            -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_registros BIGINT,
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    tipo_usuario VARCHAR(50),
    estado_usuario BOOLEAN,
    fecha_inscripcion TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    -- Información de actividades
    actividades_inscritas JSONB,
    actividades_completadas JSONB,
    -- Información de asistencias
    asistencias_generales JSONB,
    asistencias_actividades JSONB,
    -- Información de administración
    roles_administrador JSONB,
    logs_sistema JSONB,
    -- Estadísticas generales
    estadisticas_generales JSONB
) AS $$
DECLARE
    v_total_registros BIGINT := 0;
    v_nombre_completo TEXT;
    v_email_usuario VARCHAR(255);
    v_tipo_usuario VARCHAR(50);
    v_estado_usuario BOOLEAN;
    v_fecha_inscripcion TIMESTAMP;
    v_ultimo_acceso TIMESTAMP;
    v_actividades_inscritas JSONB;
    v_actividades_completadas JSONB;
    v_asistencias_generales JSONB;
    v_asistencias_actividades JSONB;
    v_roles_administrador JSONB;
    v_logs_sistema JSONB;
    v_estadisticas_generales JSONB;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::BIGINT as total_registros,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::BOOLEAN as estado_usuario,
            NULL::TIMESTAMP as fecha_inscripcion,
            NULL::TIMESTAMP as ultimo_acceso,
            NULL::JSONB as actividades_inscritas,
            NULL::JSONB as actividades_completadas,
            NULL::JSONB as asistencias_generales,
            NULL::JSONB as asistencias_actividades,
            NULL::JSONB as roles_administrador,
            NULL::JSONB as logs_sistema,
            NULL::JSONB as estadisticas_generales;
        RETURN;
    END IF;
    
    -- Obtener información básica del usuario
    SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario,
        u.email_usuario,
        tu.nombre_tipo_usuario,
        u.estado_usuario,
        u.fecha_inscripcion_usuario,
        u.ultimo_acceso_usuario
    INTO 
        v_nombre_completo,
        v_email_usuario,
        v_tipo_usuario,
        v_estado_usuario,
        v_fecha_inscripcion,
        v_ultimo_acceso
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    WHERE u.id_usuario = p_id_usuario;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado' as message,
            NULL::BIGINT as total_registros,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::BOOLEAN as estado_usuario,
            NULL::TIMESTAMP as fecha_inscripcion,
            NULL::TIMESTAMP as ultimo_acceso,
            NULL::JSONB as actividades_inscritas,
            NULL::JSONB as actividades_completadas,
            NULL::JSONB as asistencias_generales,
            NULL::JSONB as asistencias_actividades,
            NULL::JSONB as roles_administrador,
            NULL::JSONB as logs_sistema,
            NULL::JSONB as estadisticas_generales;
        RETURN;
    END IF;
    
    -- Obtener actividades inscritas
    IF p_tipo_historial IN ('completo', 'actividades') THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id_actividad', a.id_actividad,
                'nombre_actividad', a.nombre_actividad,
                'tipo_actividad', a.tipo_actividad,
                'fecha_inicio', a.fecha_inicio_actividad,
                'fecha_fin', a.fecha_fin_actividad,
                'estado_inscripcion', ia.estado_inscripcion,
                'fecha_inscripcion', ia.fecha_inscripcion,
                'observaciones', ia.observaciones_inscripcion
            ) ORDER BY ia.fecha_inscripcion DESC
        ) INTO v_actividades_inscritas
        FROM tb_inscripciones_actividad ia
        JOIN tb_actividades a ON ia.id_actividad = a.id_actividad
        WHERE ia.id_usuario = p_id_usuario
        AND (p_fecha_desde IS NULL OR ia.fecha_inscripcion::DATE >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR ia.fecha_inscripcion::DATE <= p_fecha_hasta);
        
        -- Obtener actividades completadas (con asistencia)
        SELECT jsonb_agg(
            jsonb_build_object(
                'id_actividad', a.id_actividad,
                'nombre_actividad', a.nombre_actividad,
                'fecha_asistencia', aa.fecha_asistencia,
                'hora_ingreso', aa.hora_ingreso
            ) ORDER BY aa.fecha_asistencia DESC
        ) INTO v_actividades_completadas
        FROM tb_asistencia_actividad aa
        JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
        WHERE aa.id_usuario = p_id_usuario
        AND (p_fecha_desde IS NULL OR aa.fecha_asistencia::DATE >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR aa.fecha_asistencia::DATE <= p_fecha_hasta);
    END IF;
    
    -- Obtener asistencias generales
    IF p_tipo_historial IN ('completo', 'asistencias') THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'fecha_asistencia', ag.fecha_asistencia,
                'hora_ingreso', ag.hora_ingreso
            ) ORDER BY ag.fecha_asistencia DESC
        ) INTO v_asistencias_generales
        FROM tb_asistencia_general ag
        WHERE ag.id_usuario = p_id_usuario
        AND (p_fecha_desde IS NULL OR ag.fecha_asistencia >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR ag.fecha_asistencia <= p_fecha_hasta);
        
        -- Obtener asistencias a actividades específicas
        SELECT jsonb_agg(
            jsonb_build_object(
                'id_actividad', aa.id_actividad,
                'nombre_actividad', a.nombre_actividad,
                'fecha_asistencia', aa.fecha_asistencia,
                'hora_ingreso', aa.hora_ingreso
            ) ORDER BY aa.fecha_asistencia DESC
        ) INTO v_asistencias_actividades
        FROM tb_asistencia_actividad aa
        JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
        WHERE aa.id_usuario = p_id_usuario
        AND (p_fecha_desde IS NULL OR aa.fecha_asistencia::DATE >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR aa.fecha_asistencia::DATE <= p_fecha_hasta);
    END IF;
    
    -- Obtener roles de administrador
    IF p_tipo_historial IN ('completo', 'administracion') THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'rol_administrador', a.rol_administrador,
                'permisos_administrador', a.permisos_administrador,
                'estado_administrador', a.estado_administrador,
                'fecha_asignacion', a.fecha_asignacion_administrador,
                'fecha_ultima_actividad', a.fecha_ultima_actividad_administrador,
                'asignado_por', asignador.nombre_usuario || ' ' || asignador.apellido_usuario,
                'observaciones', a.observaciones_administrador
            ) ORDER BY a.fecha_asignacion_administrador DESC
        ) INTO v_roles_administrador
        FROM tb_administradores a
        LEFT JOIN tb_usuarios asignador ON a.asignado_por_usuario = asignador.id_usuario
        WHERE a.id_usuario = p_id_usuario;
    END IF;
    
    -- Obtener logs del sistema
    IF p_tipo_historial IN ('completo', 'administracion') THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'fecha_log', ls.fecha_log,
                'accion_log', ls.accion_log,
                'tabla_afectada', ls.tabla_afectada,
                'registro_id', ls.registro_id,
                'detalles_log', ls.detalles_log
            ) ORDER BY ls.fecha_log DESC
        ) INTO v_logs_sistema
        FROM tb_logs_sistema ls
        WHERE ls.id_usuario = p_id_usuario
        AND (p_fecha_desde IS NULL OR ls.fecha_log::DATE >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR ls.fecha_log::DATE <= p_fecha_hasta)
        LIMIT p_limite OFFSET p_offset;
    END IF;
    
    -- Calcular estadísticas generales
    SELECT jsonb_build_object(
        'total_actividades_inscritas', COALESCE((
            SELECT COUNT(*) FROM tb_inscripciones_actividad 
            WHERE id_usuario = p_id_usuario AND estado_inscripcion = 'confirmada'
        ), 0),
        'total_asistencias_generales', COALESCE((
            SELECT COUNT(*) FROM tb_asistencia_general 
            WHERE id_usuario = p_id_usuario
        ), 0),
        'total_asistencias_actividades', COALESCE((
            SELECT COUNT(*) FROM tb_asistencia_actividad 
            WHERE id_usuario = p_id_usuario
        ), 0),
        'total_roles_administrador', COALESCE((
            SELECT COUNT(*) FROM tb_administradores 
            WHERE id_usuario = p_id_usuario AND estado_administrador = TRUE
        ), 0),
        'dias_desde_inscripcion', EXTRACT(DAYS FROM CURRENT_DATE - v_fecha_inscripcion::DATE),
        'dias_desde_ultimo_acceso', CASE 
            WHEN v_ultimo_acceso IS NOT NULL THEN EXTRACT(DAYS FROM CURRENT_DATE - v_ultimo_acceso::DATE)
            ELSE NULL
        END
    ) INTO v_estadisticas_generales;
    
    -- Contar total de registros
    v_total_registros := 1; -- Siempre retornamos al menos el usuario
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        TRUE as success,
        'Historial consultado exitosamente' as message,
        v_total_registros as total_registros,
        p_id_usuario as id_usuario,
        v_nombre_completo as nombre_completo,
        v_email_usuario as email_usuario,
        v_tipo_usuario as tipo_usuario,
        v_estado_usuario as estado_usuario,
        v_fecha_inscripcion as fecha_inscripcion,
        v_ultimo_acceso as ultimo_acceso,
        COALESCE(v_actividades_inscritas, '[]'::jsonb) as actividades_inscritas,
        COALESCE(v_actividades_completadas, '[]'::jsonb) as actividades_completadas,
        COALESCE(v_asistencias_generales, '[]'::jsonb) as asistencias_generales,
        COALESCE(v_asistencias_actividades, '[]'::jsonb) as asistencias_actividades,
        COALESCE(v_roles_administrador, '[]'::jsonb) as roles_administrador,
        COALESCE(v_logs_sistema, '[]'::jsonb) as logs_sistema,
        v_estadisticas_generales as estadisticas_generales;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar historial: ' || SQLERRM as message,
            NULL::BIGINT as total_registros,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::BOOLEAN as estado_usuario,
            NULL::TIMESTAMP as fecha_inscripcion,
            NULL::TIMESTAMP as ultimo_acceso,
            NULL::JSONB as actividades_inscritas,
            NULL::JSONB as actividades_completadas,
            NULL::JSONB as asistencias_generales,
            NULL::JSONB as asistencias_actividades,
            NULL::JSONB as roles_administrador,
            NULL::JSONB as logs_sistema,
            NULL::JSONB as estadisticas_generales;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_historial_usuario(UUID, VARCHAR, DATE, DATE, INTEGER, INTEGER) IS 
'Consulta el historial completo de un usuario incluyendo actividades, asistencias, roles de administrador y logs del sistema.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_historial_usuario('uuid-usuario'); -- Historial completo
-- SELECT * FROM sp_consultar_historial_usuario('uuid-usuario', 'actividades'); -- Solo actividades
-- SELECT * FROM sp_consultar_historial_usuario('uuid-usuario', 'completo', '2024-01-01', '2024-12-31'); -- Con filtro de fechas
