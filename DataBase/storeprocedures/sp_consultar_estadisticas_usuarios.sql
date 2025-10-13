-- =====================================================
-- Procedimiento: sp_consultar_estadisticas_usuarios
-- Descripción: Consulta estadísticas generales del sistema de usuarios
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_estadisticas_usuarios(
    p_fecha_desde DATE DEFAULT NULL,      -- Filtrar estadísticas desde esta fecha
    p_fecha_hasta DATE DEFAULT NULL,      -- Filtrar estadísticas hasta esta fecha
    p_tipo_estadisticas VARCHAR(50) DEFAULT 'completo' -- 'completo', 'usuarios', 'actividades', 'asistencias', 'administradores'
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    estadisticas_generales JSONB,
    estadisticas_usuarios JSONB,
    estadisticas_actividades JSONB,
    estadisticas_asistencias JSONB,
    estadisticas_administradores JSONB,
    tendencias JSONB
) AS $$
DECLARE
    v_estadisticas_generales JSONB;
    v_estadisticas_usuarios JSONB;
    v_estadisticas_actividades JSONB;
    v_estadisticas_asistencias JSONB;
    v_estadisticas_administradores JSONB;
    v_tendencias JSONB;
    v_fecha_desde_filter DATE;
    v_fecha_hasta_filter DATE;
BEGIN
    -- Establecer filtros de fecha
    v_fecha_desde_filter := COALESCE(p_fecha_desde, '2024-01-01'::DATE);
    v_fecha_hasta_filter := COALESCE(p_fecha_hasta, CURRENT_DATE);
    
    -- Estadísticas generales
    IF p_tipo_estadisticas IN ('completo', 'usuarios') THEN
        SELECT jsonb_build_object(
            'total_usuarios', (
                SELECT COUNT(*) FROM tb_usuarios 
                WHERE fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'usuarios_activos', (
                SELECT COUNT(*) FROM tb_usuarios 
                WHERE estado_usuario = TRUE 
                AND fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'usuarios_inactivos', (
                SELECT COUNT(*) FROM tb_usuarios 
                WHERE estado_usuario = FALSE 
                AND fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'usuarios_por_tipo', (
                SELECT jsonb_object_agg(tu.nombre_tipo_usuario, tipo_count.count)
                FROM (
                    SELECT u.id_tipo_usuario, COUNT(*) as count
                    FROM tb_usuarios u
                    WHERE u.fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY u.id_tipo_usuario
                ) tipo_count
                JOIN tb_tipos_usuario tu ON tipo_count.id_tipo_usuario = tu.id_tipo_usuario
            ),
            'usuarios_por_colegio', (
                SELECT jsonb_object_agg(
                    COALESCE(u.colegio_usuario, 'Sin especificar'), 
                    colegio_count.count
                )
                FROM (
                    SELECT u.colegio_usuario, COUNT(*) as count
                    FROM tb_usuarios u
                    WHERE u.fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY u.colegio_usuario
                ) colegio_count
            ),
            'emails_verificados', (
                SELECT COUNT(*) FROM tb_usuarios 
                WHERE email_verificado_usuario = TRUE 
                AND fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'emails_no_verificados', (
                SELECT COUNT(*) FROM tb_usuarios 
                WHERE email_verificado_usuario = FALSE 
                AND fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            )
        ) INTO v_estadisticas_usuarios;
    END IF;
    
    -- Estadísticas de actividades
    IF p_tipo_estadisticas IN ('completo', 'actividades') THEN
        SELECT jsonb_build_object(
            'total_actividades', (
                SELECT COUNT(*) FROM tb_actividades 
                WHERE fecha_creacion_actividad::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'actividades_activas', (
                SELECT COUNT(*) FROM tb_actividades 
                WHERE estado_actividad = TRUE 
                AND fecha_creacion_actividad::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'total_inscripciones', (
                SELECT COUNT(*) FROM tb_inscripciones_actividad 
                WHERE fecha_inscripcion::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'inscripciones_confirmadas', (
                SELECT COUNT(*) FROM tb_inscripciones_actividad 
                WHERE estado_inscripcion = 'confirmada' 
                AND fecha_inscripcion::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'inscripciones_pendientes', (
                SELECT COUNT(*) FROM tb_inscripciones_actividad 
                WHERE estado_inscripcion = 'pendiente' 
                AND fecha_inscripcion::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'actividades_por_tipo', (
                SELECT jsonb_object_agg(tipo_actividad, count)
                FROM (
                    SELECT tipo_actividad, COUNT(*) as count
                    FROM tb_actividades
                    WHERE fecha_creacion_actividad::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY tipo_actividad
                ) tipo_stats
            ),
            'actividades_mas_populares', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id_actividad', a.id_actividad,
                        'nombre_actividad', a.nombre_actividad,
                        'total_inscripciones', inscripciones.count
                    ) ORDER BY inscripciones.count DESC
                )
                FROM (
                    SELECT ia.id_actividad, COUNT(*) as count
                    FROM tb_inscripciones_actividad ia
                    WHERE ia.fecha_inscripcion::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    AND ia.estado_inscripcion = 'confirmada'
                    GROUP BY ia.id_actividad
                    ORDER BY count DESC
                    LIMIT 10
                ) inscripciones
                JOIN tb_actividades a ON inscripciones.id_actividad = a.id_actividad
            )
        ) INTO v_estadisticas_actividades;
    END IF;
    
    -- Estadísticas de asistencias
    IF p_tipo_estadisticas IN ('completo', 'asistencias') THEN
        SELECT jsonb_build_object(
            'total_asistencias_generales', (
                SELECT COUNT(*) FROM tb_asistencia_general 
                WHERE fecha_asistencia BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'total_asistencias_actividades', (
                SELECT COUNT(*) FROM tb_asistencia_actividad 
                WHERE fecha_asistencia::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'usuarios_con_asistencia', (
                SELECT COUNT(DISTINCT id_usuario) FROM tb_asistencia_general 
                WHERE fecha_asistencia BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'asistencias_por_dia', (
                SELECT jsonb_object_agg(fecha_asistencia::TEXT, count)
                FROM (
                    SELECT fecha_asistencia, COUNT(*) as count
                    FROM tb_asistencia_general
                    WHERE fecha_asistencia BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY fecha_asistencia
                    ORDER BY fecha_asistencia
                ) dia_stats
            ),
            'actividades_con_mas_asistencia', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id_actividad', a.id_actividad,
                        'nombre_actividad', a.nombre_actividad,
                        'total_asistencias', asistencias.count
                    ) ORDER BY asistencias.count DESC
                )
                FROM (
                    SELECT aa.id_actividad, COUNT(*) as count
                    FROM tb_asistencia_actividad aa
                    WHERE aa.fecha_asistencia::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY aa.id_actividad
                    ORDER BY count DESC
                    LIMIT 10
                ) asistencias
                JOIN tb_actividades a ON asistencias.id_actividad = a.id_actividad
            )
        ) INTO v_estadisticas_asistencias;
    END IF;
    
    -- Estadísticas de administradores
    IF p_tipo_estadisticas IN ('completo', 'administradores') THEN
        SELECT jsonb_build_object(
            'total_administradores', (
                SELECT COUNT(*) FROM tb_administradores 
                WHERE fecha_asignacion_administrador::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'administradores_activos', (
                SELECT COUNT(*) FROM tb_administradores 
                WHERE estado_administrador = TRUE 
                AND fecha_asignacion_administrador::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
            ),
            'administradores_por_rol', (
                SELECT jsonb_object_agg(rol_administrador, count)
                FROM (
                    SELECT rol_administrador, COUNT(*) as count
                    FROM tb_administradores
                    WHERE fecha_asignacion_administrador::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    GROUP BY rol_administrador
                ) rol_stats
            ),
            'permisos_mas_comunes', (
                SELECT jsonb_object_agg(permiso, count)
                FROM (
                    SELECT unnest(permisos_administrador) as permiso, COUNT(*) as count
                    FROM tb_administradores
                    WHERE fecha_asignacion_administrador::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
                    AND estado_administrador = TRUE
                    GROUP BY permiso
                    ORDER BY count DESC
                ) permiso_stats
            )
        ) INTO v_estadisticas_administradores;
    END IF;
    
    -- Tendencias (comparación con período anterior)
    IF p_tipo_estadisticas = 'completo' THEN
        -- Calcular estadísticas de tendencias
        DECLARE
            v_periodo_actual INTEGER;
            v_periodo_anterior INTEGER;
            v_porcentaje_cambio NUMERIC;
        BEGIN
            -- Contar usuarios del período actual
            SELECT COUNT(*) INTO v_periodo_actual
            FROM tb_usuarios 
            WHERE fecha_inscripcion_usuario::DATE BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter;
            
            -- Contar usuarios del período anterior
            SELECT COUNT(*) INTO v_periodo_anterior
            FROM tb_usuarios 
            WHERE fecha_inscripcion_usuario::DATE BETWEEN 
                (v_fecha_desde_filter - (v_fecha_hasta_filter - v_fecha_desde_filter)) 
                AND (v_fecha_desde_filter - INTERVAL '1 day')::DATE;
            
            -- Calcular porcentaje de cambio
            IF v_periodo_anterior > 0 THEN
                v_porcentaje_cambio := ROUND(
                    ((v_periodo_actual - v_periodo_anterior)::DECIMAL / v_periodo_anterior * 100)::NUMERIC, 2
                );
            ELSE
                v_porcentaje_cambio := 0;
            END IF;
            
            -- Construir objeto de tendencias
            v_tendencias := jsonb_build_object(
                'crecimiento_usuarios', jsonb_build_object(
                    'periodo_actual', v_periodo_actual,
                    'periodo_anterior', v_periodo_anterior,
                    'porcentaje_cambio', v_porcentaje_cambio
                ),
                'actividad_reciente', jsonb_build_object(
                    'usuarios_activos_ultimos_7_dias', (
                        SELECT COUNT(DISTINCT id_usuario) FROM tb_asistencia_general 
                        WHERE fecha_asistencia >= CURRENT_DATE - INTERVAL '7 days'
                    ),
                    'inscripciones_ultimos_7_dias', (
                        SELECT COUNT(*) FROM tb_inscripciones_actividad 
                        WHERE fecha_inscripcion >= CURRENT_DATE - INTERVAL '7 days'
                    )
                )
            );
        END;
    END IF;
    
    -- Estadísticas generales del sistema
    SELECT jsonb_build_object(
        'fecha_consulta', CURRENT_TIMESTAMP,
        'periodo_consulta', jsonb_build_object(
            'desde', v_fecha_desde_filter,
            'hasta', v_fecha_hasta_filter
        ),
        'sistema_info', jsonb_build_object(
            'version', '1.0.0',
            'ultima_actualizacion', CURRENT_TIMESTAMP
        )
    ) INTO v_estadisticas_generales;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        TRUE as success,
        'Estadísticas consultadas exitosamente' as message,
        v_estadisticas_generales as estadisticas_generales,
        COALESCE(v_estadisticas_usuarios, '{}'::jsonb) as estadisticas_usuarios,
        COALESCE(v_estadisticas_actividades, '{}'::jsonb) as estadisticas_actividades,
        COALESCE(v_estadisticas_asistencias, '{}'::jsonb) as estadisticas_asistencias,
        COALESCE(v_estadisticas_administradores, '{}'::jsonb) as estadisticas_administradores,
        COALESCE(v_tendencias, '{}'::jsonb) as tendencias;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar estadísticas: ' || SQLERRM as message,
            NULL::JSONB as estadisticas_generales,
            NULL::JSONB as estadisticas_usuarios,
            NULL::JSONB as estadisticas_actividades,
            NULL::JSONB as estadisticas_asistencias,
            NULL::JSONB as estadisticas_administradores,
            NULL::JSONB as tendencias;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_estadisticas_usuarios(DATE, DATE, VARCHAR) IS 
'Consulta estadísticas generales del sistema de usuarios incluyendo tendencias y comparaciones.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_estadisticas_usuarios(); -- Estadísticas completas
-- SELECT * FROM sp_consultar_estadisticas_usuarios('2024-01-01', '2024-12-31', 'usuarios'); -- Solo estadísticas de usuarios
-- SELECT * FROM sp_consultar_estadisticas_usuarios(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 'completo'); -- Últimos 30 días
