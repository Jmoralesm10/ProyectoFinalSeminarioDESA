-- =====================================================
-- Procedimiento: sp_generar_diplomas_congreso
-- Descripción: Genera diplomas de participación general al congreso
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_generar_diplomas_congreso(
    p_generado_por_usuario UUID,               -- ID del administrador que genera
    p_fecha_desde DATE DEFAULT NULL,           -- Fecha desde para filtrar asistencias
    p_fecha_hasta DATE DEFAULT NULL,           -- Fecha hasta para filtrar asistencias
    p_plantilla_congreso VARCHAR(500) DEFAULT NULL, -- Plantilla para diplomas del congreso
    p_solo_usuarios_sin_diploma BOOLEAN DEFAULT TRUE -- Solo generar para usuarios sin diploma del congreso
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_diplomas_generados INTEGER,
    total_usuarios_con_asistencia INTEGER,
    detalles_diplomas JSONB
) AS $$
DECLARE
    v_fecha_desde_filter DATE;
    v_fecha_hasta_filter DATE;
    v_total_diplomas INTEGER := 0;
    v_total_usuarios INTEGER := 0;
    v_detalles JSONB := '[]'::jsonb;
    v_diploma_record JSONB;
    v_usuario_record RECORD;
BEGIN
    -- Validar parámetros obligatorios
    IF p_generado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'ID del usuario administrador es obligatorio' as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as total_usuarios_con_asistencia,
            NULL::JSONB as detalles_diplomas;
        RETURN;
    END IF;
    
    -- Establecer fechas por defecto si no se proporcionan
    v_fecha_desde_filter := COALESCE(p_fecha_desde, CURRENT_DATE - INTERVAL '30 days');
    v_fecha_hasta_filter := COALESCE(p_fecha_hasta, CURRENT_DATE);
    
    -- Contar total de usuarios con asistencia general
    SELECT COUNT(DISTINCT ag.id_usuario) INTO v_total_usuarios
    FROM tb_asistencia_general ag
    WHERE ag.fecha_asistencia BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter;
    
    -- Generar diplomas para usuarios con asistencia general al congreso
    FOR v_usuario_record IN
        SELECT DISTINCT 
            ag.id_usuario, 
            u.nombre_usuario, 
            u.apellido_usuario,
            u.email_usuario,
            ag.fecha_asistencia
        FROM tb_asistencia_general ag
        JOIN tb_usuarios u ON ag.id_usuario = u.id_usuario
        WHERE ag.fecha_asistencia BETWEEN v_fecha_desde_filter AND v_fecha_hasta_filter
        AND u.estado_usuario = TRUE
        AND (
            NOT p_solo_usuarios_sin_diploma 
            OR NOT EXISTS(
                SELECT 1 FROM tb_diplomas d 
                WHERE d.id_usuario = ag.id_usuario 
                AND d.tipo_diploma = 'congreso_general'
            )
        )
    LOOP
        INSERT INTO tb_diplomas (
            id_usuario, 
            id_actividad, -- NULL para diplomas del congreso general
            tipo_diploma, 
            nombre_diploma, 
            posicion_diploma, 
            plantilla_path_diploma, 
            generado_por_usuario,
            observaciones_diploma
        ) VALUES (
            v_usuario_record.id_usuario, 
            NULL,
            'congreso_general',
            'Diploma de Participación - Congreso de Tecnología ' || EXTRACT(YEAR FROM v_usuario_record.fecha_asistencia),
            NULL, 
            p_plantilla_congreso, 
            p_generado_por_usuario,
            'Generado automáticamente por asistencia al congreso el ' || v_usuario_record.fecha_asistencia::TEXT
        );
        
        v_total_diplomas := v_total_diplomas + 1;
        
        -- Agregar a detalles
        SELECT jsonb_build_object(
            'tipo', 'congreso_general',
            'usuario_id', v_usuario_record.id_usuario,
            'nombre', v_usuario_record.nombre_usuario || ' ' || v_usuario_record.apellido_usuario,
            'email', v_usuario_record.email_usuario,
            'fecha_asistencia', v_usuario_record.fecha_asistencia
        ) INTO v_diploma_record;
        v_detalles := v_detalles || v_diploma_record;
    END LOOP;
    
    -- Retornar resultado exitoso
    RETURN QUERY SELECT 
        TRUE as success,
        'Diplomas del congreso generados exitosamente. Total usuarios con asistencia: ' || v_total_usuarios as message,
        v_total_diplomas as total_diplomas_generados,
        v_total_usuarios as total_usuarios_con_asistencia,
        v_detalles as detalles_diplomas;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al generar diplomas del congreso: ' || SQLERRM as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as total_usuarios_con_asistencia,
            NULL::JSONB as detalles_diplomas;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_generar_diplomas_congreso(UUID, DATE, DATE, VARCHAR, BOOLEAN) IS 
'Genera diplomas de participación general al congreso para usuarios con asistencia confirmada.';

-- Ejemplos de uso:
-- SELECT * FROM sp_generar_diplomas_congreso('admin-uuid'); -- Últimos 30 días
-- SELECT * FROM sp_generar_diplomas_congreso('admin-uuid', '2025-01-01', '2025-01-31'); -- Enero 2025
-- SELECT * FROM sp_generar_diplomas_congreso('admin-uuid', NULL, NULL, NULL, FALSE); -- Incluir usuarios que ya tienen diploma
