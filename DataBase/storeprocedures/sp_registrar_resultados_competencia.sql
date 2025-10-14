-- =====================================================
-- Procedimiento: sp_registrar_resultados_competencia
-- Descripción: Registra los resultados de una competencia (primeros 3 lugares)
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_registrar_resultados_competencia(
    p_id_actividad INTEGER,                    -- ID de la competencia
    p_registrado_por_usuario UUID,             -- ID del administrador que registra
    p_primer_lugar_usuario UUID DEFAULT NULL,  -- ID del usuario primer lugar
    p_segundo_lugar_usuario UUID DEFAULT NULL, -- ID del usuario segundo lugar
    p_tercer_lugar_usuario UUID DEFAULT NULL,  -- ID del usuario tercer lugar
    p_puntuaciones JSONB DEFAULT NULL,         -- Puntuaciones: {"primer": 95.5, "segundo": 88.0, "tercer": 82.5}
    p_descripciones_proyectos JSONB DEFAULT NULL, -- Descripciones de proyectos
    p_observaciones TEXT DEFAULT NULL          -- Observaciones generales
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_resultados_registrados INTEGER,
    detalles_resultados JSONB
) AS $$
DECLARE
    v_actividad_existe BOOLEAN;
    v_es_competencia BOOLEAN;
    v_nombre_actividad VARCHAR(200);
    v_total_registrados INTEGER := 0;
    v_detalles JSONB := '[]'::jsonb;
    v_resultado_record JSONB;
    v_puntuacion_primer DECIMAL(10,2);
    v_puntuacion_segundo DECIMAL(10,2);
    v_puntuacion_tercer DECIMAL(10,2);
    v_descripcion_primer TEXT;
    v_descripcion_segundo TEXT;
    v_descripcion_tercer TEXT;
BEGIN
    -- Validar parámetros obligatorios
    IF p_id_actividad IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'ID de actividad es obligatorio' as message,
            NULL::INTEGER as total_resultados_registrados,
            NULL::JSONB as detalles_resultados;
        RETURN;
    END IF;
    
    IF p_registrado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'ID del usuario administrador es obligatorio' as message,
            NULL::INTEGER as total_resultados_registrados,
            NULL::JSONB as detalles_resultados;
        RETURN;
    END IF;
    
    -- Verificar que la actividad existe y es una competencia
    SELECT EXISTS(
        SELECT 1 FROM tb_actividades 
        WHERE id_actividad = p_id_actividad AND tipo_actividad = 'competencia'
    ) INTO v_actividad_existe;
    
    IF NOT v_actividad_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'La actividad especificada no existe o no es una competencia' as message,
            NULL::INTEGER as total_resultados_registrados,
            NULL::JSONB as detalles_resultados;
        RETURN;
    END IF;
    
    -- Obtener nombre de la actividad
    SELECT nombre_actividad INTO v_nombre_actividad
    FROM tb_actividades 
    WHERE id_actividad = p_id_actividad;
    
    -- Extraer puntuaciones del JSON si se proporciona
    IF p_puntuaciones IS NOT NULL THEN
        v_puntuacion_primer := (p_puntuaciones->>'primer')::DECIMAL(10,2);
        v_puntuacion_segundo := (p_puntuaciones->>'segundo')::DECIMAL(10,2);
        v_puntuacion_tercer := (p_puntuaciones->>'tercer')::DECIMAL(10,2);
    END IF;
    
    -- Extraer descripciones del JSON si se proporciona
    IF p_descripciones_proyectos IS NOT NULL THEN
        v_descripcion_primer := p_descripciones_proyectos->>'primer';
        v_descripcion_segundo := p_descripciones_proyectos->>'segundo';
        v_descripcion_tercer := p_descripciones_proyectos->>'tercer';
    END IF;
    
    -- Registrar primer lugar
    IF p_primer_lugar_usuario IS NOT NULL THEN
        -- Verificar que el usuario tiene asistencia confirmada
        IF EXISTS(
            SELECT 1 FROM tb_asistencia_actividad 
            WHERE id_usuario = p_primer_lugar_usuario 
            AND id_actividad = p_id_actividad
        ) THEN
            INSERT INTO tb_resultados_competencia (
                id_actividad, id_usuario, posicion_resultado, 
                puntuacion_resultado, descripcion_proyecto_resultado, observaciones_resultado
            ) VALUES (
                p_id_actividad, p_primer_lugar_usuario, 1,
                v_puntuacion_primer, v_descripcion_primer, p_observaciones
            )
            ON CONFLICT (id_actividad, id_usuario) 
            DO UPDATE SET 
                posicion_resultado = 1,
                puntuacion_resultado = v_puntuacion_primer,
                descripcion_proyecto_resultado = v_descripcion_primer,
                observaciones_resultado = p_observaciones,
                fecha_resultado = CURRENT_TIMESTAMP;
            
            v_total_registrados := v_total_registrados + 1;
            
            -- Agregar a detalles
            SELECT jsonb_build_object(
                'posicion', 1,
                'usuario_id', p_primer_lugar_usuario,
                'puntuacion', v_puntuacion_primer,
                'descripcion', v_descripcion_primer
            ) INTO v_resultado_record;
            v_detalles := v_detalles || v_resultado_record;
        END IF;
    END IF;
    
    -- Registrar segundo lugar
    IF p_segundo_lugar_usuario IS NOT NULL THEN
        IF EXISTS(
            SELECT 1 FROM tb_asistencia_actividad 
            WHERE id_usuario = p_segundo_lugar_usuario 
            AND id_actividad = p_id_actividad
        ) THEN
            INSERT INTO tb_resultados_competencia (
                id_actividad, id_usuario, posicion_resultado, 
                puntuacion_resultado, descripcion_proyecto_resultado, observaciones_resultado
            ) VALUES (
                p_id_actividad, p_segundo_lugar_usuario, 2,
                v_puntuacion_segundo, v_descripcion_segundo, p_observaciones
            )
            ON CONFLICT (id_actividad, id_usuario) 
            DO UPDATE SET 
                posicion_resultado = 2,
                puntuacion_resultado = v_puntuacion_segundo,
                descripcion_proyecto_resultado = v_descripcion_segundo,
                observaciones_resultado = p_observaciones,
                fecha_resultado = CURRENT_TIMESTAMP;
            
            v_total_registrados := v_total_registrados + 1;
            
            SELECT jsonb_build_object(
                'posicion', 2,
                'usuario_id', p_segundo_lugar_usuario,
                'puntuacion', v_puntuacion_segundo,
                'descripcion', v_descripcion_segundo
            ) INTO v_resultado_record;
            v_detalles := v_detalles || v_resultado_record;
        END IF;
    END IF;
    
    -- Registrar tercer lugar
    IF p_tercer_lugar_usuario IS NOT NULL THEN
        IF EXISTS(
            SELECT 1 FROM tb_asistencia_actividad 
            WHERE id_usuario = p_tercer_lugar_usuario 
            AND id_actividad = p_id_actividad
        ) THEN
            INSERT INTO tb_resultados_competencia (
                id_actividad, id_usuario, posicion_resultado, 
                puntuacion_resultado, descripcion_proyecto_resultado, observaciones_resultado
            ) VALUES (
                p_id_actividad, p_tercer_lugar_usuario, 3,
                v_puntuacion_tercer, v_descripcion_tercer, p_observaciones
            )
            ON CONFLICT (id_actividad, id_usuario) 
            DO UPDATE SET 
                posicion_resultado = 3,
                puntuacion_resultado = v_puntuacion_tercer,
                descripcion_proyecto_resultado = v_descripcion_tercer,
                observaciones_resultado = p_observaciones,
                fecha_resultado = CURRENT_TIMESTAMP;
            
            v_total_registrados := v_total_registrados + 1;
            
            SELECT jsonb_build_object(
                'posicion', 3,
                'usuario_id', p_tercer_lugar_usuario,
                'puntuacion', v_puntuacion_tercer,
                'descripcion', v_descripcion_tercer
            ) INTO v_resultado_record;
            v_detalles := v_detalles || v_resultado_record;
        END IF;
    END IF;
    
    -- Retornar resultado exitoso
    RETURN QUERY SELECT 
        TRUE as success,
        'Resultados de la competencia "' || v_nombre_actividad || '" registrados exitosamente' as message,
        v_total_registrados as total_resultados_registrados,
        v_detalles as detalles_resultados;
        
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al registrar resultados de competencia: ' || SQLERRM as message,
            NULL::INTEGER as total_resultados_registrados,
            NULL::JSONB as detalles_resultados;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_registrar_resultados_competencia(INTEGER, UUID, UUID, UUID, UUID, JSONB, JSONB, TEXT) IS 
'Registra los resultados de una competencia (primeros 3 lugares) con puntuaciones y descripciones de proyectos.';

-- Ejemplos de uso:
-- SELECT * FROM sp_registrar_resultados_competencia(1, 'admin-uuid', 'user-uuid-1', 'user-uuid-2', 'user-uuid-3');
-- SELECT * FROM sp_registrar_resultados_competencia(1, 'admin-uuid', 'user-uuid-1', 'user-uuid-2', 'user-uuid-3', 
--   '{"primer": 95.5, "segundo": 88.0, "tercer": 82.5}'::jsonb);
-- SELECT * FROM sp_registrar_resultados_competencia(1, 'admin-uuid', 'user-uuid-1', 'user-uuid-2', 'user-uuid-3',
--   '{"primer": 95.5, "segundo": 88.0, "tercer": 82.5}'::jsonb, 
--   '{"primer": "Proyecto innovador", "segundo": "Solución creativa", "tercer": "Implementación sólida"}'::jsonb);
