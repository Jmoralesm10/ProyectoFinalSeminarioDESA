-- =====================================================
-- Procedimiento: sp_generar_diplomas_actividad
-- Descripción: Genera diplomas para una actividad específica
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_generar_diplomas_actividad(
    p_id_actividad INTEGER,                    -- ID de la actividad
    p_generado_por_usuario UUID,               -- ID del administrador que genera
    p_incluir_participacion BOOLEAN DEFAULT TRUE, -- Incluir diplomas de participación
    p_plantilla_participacion VARCHAR(500) DEFAULT NULL -- Plantilla para participación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_diplomas_generados INTEGER,
    diplomas_ganadores INTEGER,
    diplomas_participacion INTEGER,
    detalles_diplomas JSONB
) AS $$
DECLARE
    v_actividad_existe BOOLEAN;
    v_nombre_actividad VARCHAR(200);
    v_tipo_actividad VARCHAR(50);
    v_total_diplomas INTEGER := 0;
    v_diplomas_ganadores INTEGER := 0;
    v_diplomas_participacion INTEGER := 0;
    v_detalles JSONB := '[]'::jsonb;
    v_diploma_record JSONB;
    v_usuario_record RECORD;
    v_ganador_record RECORD;
BEGIN
    -- Validar parámetros obligatorios
    IF p_id_actividad IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'ID de actividad es obligatorio' as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as diplomas_ganadores,
            NULL::INTEGER as diplomas_participacion,
            NULL::JSONB as detalles_diplomas;
        RETURN;
    END IF;
    
    IF p_generado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'ID del usuario administrador es obligatorio' as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as diplomas_ganadores,
            NULL::INTEGER as diplomas_participacion,
            NULL::JSONB as detalles_diplomas;
        RETURN;
    END IF;
    
    -- Verificar que la actividad existe
    SELECT EXISTS(
        SELECT 1 FROM tb_actividades WHERE id_actividad = p_id_actividad
    ) INTO v_actividad_existe;
    
    IF NOT v_actividad_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'La actividad especificada no existe' as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as diplomas_ganadores,
            NULL::INTEGER as diplomas_participacion,
            NULL::JSONB as detalles_diplomas;
        RETURN;
    END IF;
    
    -- Obtener información de la actividad
    SELECT nombre_actividad, tipo_actividad 
    INTO v_nombre_actividad, v_tipo_actividad
    FROM tb_actividades 
    WHERE id_actividad = p_id_actividad;
    
    -- Generar diplomas para ganadores (si es competencia y hay resultados registrados)
    IF v_tipo_actividad = 'competencia' THEN
        FOR v_ganador_record IN
            SELECT 
                rc.id_usuario,
                rc.posicion_resultado,
                u.nombre_usuario,
                u.apellido_usuario,
                u.email_usuario,
                rc.puntuacion_resultado,
                rc.descripcion_proyecto_resultado
            FROM tb_resultados_competencia rc
            JOIN tb_usuarios u ON rc.id_usuario = u.id_usuario
            WHERE rc.id_actividad = p_id_actividad
            AND rc.posicion_resultado IN (1, 2, 3)
            ORDER BY rc.posicion_resultado
        LOOP
            -- Insertar diploma para ganador
            INSERT INTO tb_diplomas (
                id_usuario, id_actividad, tipo_diploma, nombre_diploma, 
                plantilla_path_diploma, generado_por_usuario, observaciones_diploma
            ) VALUES (
                v_ganador_record.id_usuario, p_id_actividad, 'participacion',
                'Diploma de ' || 
                CASE v_ganador_record.posicion_resultado
                    WHEN 1 THEN 'Primer Lugar'
                    WHEN 2 THEN 'Segundo Lugar'
                    WHEN 3 THEN 'Tercer Lugar'
                END || ' - ' || v_nombre_actividad,
                p_plantilla_participacion, p_generado_por_usuario,
                'Ganador posición ' || v_ganador_record.posicion_resultado || 
                CASE WHEN v_ganador_record.puntuacion_resultado IS NOT NULL 
                     THEN ' con puntuación: ' || v_ganador_record.puntuacion_resultado 
                     ELSE '' END
            )
            ON CONFLICT (id_usuario, id_actividad, tipo_diploma) 
            DO UPDATE SET 
                nombre_diploma = EXCLUDED.nombre_diploma,
                plantilla_path_diploma = EXCLUDED.plantilla_path_diploma,
                generado_por_usuario = EXCLUDED.generado_por_usuario,
                observaciones_diploma = EXCLUDED.observaciones_diploma,
                fecha_generacion_diploma = CURRENT_TIMESTAMP;
            
            v_diplomas_ganadores := v_diplomas_ganadores + 1;
            v_total_diplomas := v_total_diplomas + 1;
            
            -- Agregar a detalles
            SELECT jsonb_build_object(
                'tipo', 'ganador',
                'usuario_id', v_ganador_record.id_usuario,
                'nombre', v_ganador_record.nombre_usuario || ' ' || v_ganador_record.apellido_usuario,
                'posicion', v_ganador_record.posicion_resultado,
                'puntuacion', v_ganador_record.puntuacion_resultado
            ) INTO v_diploma_record;
            v_detalles := v_detalles || v_diploma_record;
        END LOOP;
    END IF;
    
    -- Generar diplomas de participación para el resto de asistentes
    IF p_incluir_participacion THEN
        FOR v_usuario_record IN
            SELECT DISTINCT 
                aa.id_usuario, 
                u.nombre_usuario, 
                u.apellido_usuario,
                u.email_usuario
            FROM tb_asistencia_actividad aa
            JOIN tb_usuarios u ON aa.id_usuario = u.id_usuario
            WHERE aa.id_actividad = p_id_actividad
            AND u.estado_usuario = TRUE
            -- Excluir ganadores si es competencia
            AND (
                v_tipo_actividad != 'competencia' 
                OR aa.id_usuario NOT IN (
                    SELECT rc.id_usuario 
                    FROM tb_resultados_competencia rc 
                    WHERE rc.id_actividad = p_id_actividad
                )
            )
            -- Evitar duplicados
            AND NOT EXISTS(
                SELECT 1 FROM tb_diplomas d 
                WHERE d.id_usuario = aa.id_usuario 
                AND d.id_actividad = p_id_actividad
                AND d.tipo_diploma = 'participacion'
            )
        LOOP
            INSERT INTO tb_diplomas (
                id_usuario, id_actividad, tipo_diploma, nombre_diploma, 
                plantilla_path_diploma, generado_por_usuario, observaciones_diploma
            ) VALUES (
                v_usuario_record.id_usuario, p_id_actividad, 'participacion',
                'Diploma de Participación - ' || v_nombre_actividad,
                p_plantilla_participacion, p_generado_por_usuario,
                'Generado automáticamente por asistencia confirmada a la actividad'
            )
            ON CONFLICT (id_usuario, id_actividad, tipo_diploma) 
            DO UPDATE SET 
                nombre_diploma = EXCLUDED.nombre_diploma,
                plantilla_path_diploma = EXCLUDED.plantilla_path_diploma,
                generado_por_usuario = EXCLUDED.generado_por_usuario,
                observaciones_diploma = EXCLUDED.observaciones_diploma,
                fecha_generacion_diploma = CURRENT_TIMESTAMP;
            
            v_diplomas_participacion := v_diplomas_participacion + 1;
            v_total_diplomas := v_total_diplomas + 1;
            
            SELECT jsonb_build_object(
                'tipo', 'participacion',
                'usuario_id', v_usuario_record.id_usuario,
                'nombre', v_usuario_record.nombre_usuario || ' ' || v_usuario_record.apellido_usuario
            ) INTO v_diploma_record;
            v_detalles := v_detalles || v_diploma_record;
        END LOOP;
    END IF;
    
    -- Retornar resultado exitoso
    RETURN QUERY SELECT 
        TRUE as success,
        'Diplomas generados exitosamente para la actividad: ' || v_nombre_actividad as message,
        v_total_diplomas as total_diplomas_generados,
        v_diplomas_ganadores as diplomas_ganadores,
        v_diplomas_participacion as diplomas_participacion,
        v_detalles as detalles_diplomas;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al generar diplomas: ' || SQLERRM as message,
            NULL::INTEGER as total_diplomas_generados,
            NULL::INTEGER as diplomas_ganadores,
            NULL::INTEGER as diplomas_participacion,
            NULL::JSONB as detalles_diplomas;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_generar_diplomas_actividad(INTEGER, UUID, BOOLEAN, VARCHAR) IS 
'Genera diplomas para una actividad específica. Para competencias, incluye automáticamente diplomas para ganadores registrados en tb_resultados_competencia.';

-- Ejemplos de uso:
-- SELECT * FROM sp_generar_diplomas_actividad(1, 'admin-uuid'); -- Generar todos los diplomas
-- SELECT * FROM sp_generar_diplomas_actividad(1, 'admin-uuid', FALSE); -- Solo ganadores (competencia)
-- SELECT * FROM sp_generar_diplomas_actividad(2, 'admin-uuid', TRUE, '/templates/participacion.pdf'); -- Con plantilla específica