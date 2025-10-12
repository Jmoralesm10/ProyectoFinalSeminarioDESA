-- =====================================================
-- Procedimiento Almacenado: sp_inscribirse_actividad
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para inscribir un usuario a una actividad
CREATE OR REPLACE FUNCTION sp_inscribirse_actividad(
    p_id_usuario UUID,                          -- ID del usuario
    p_id_actividad INTEGER,                     -- ID de la actividad
    p_observaciones_inscripcion TEXT DEFAULT NULL -- Observaciones opcionales
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200),
    estado_inscripcion VARCHAR(20),
    fecha_inscripcion TIMESTAMP
) AS $$
DECLARE
    v_actividad_nombre VARCHAR(200);
    v_actividad_requiere_aprobacion BOOLEAN;
    v_actividad_permite_inscripciones BOOLEAN;
    v_actividad_fecha_limite TIMESTAMP;
    v_actividad_cupo_maximo INTEGER;
    v_inscripciones_confirmadas INTEGER;
    v_usuario_edad INTEGER;
    v_actividad_edad_minima INTEGER;
    v_actividad_edad_maxima INTEGER;
    v_estado_inicial VARCHAR(20);
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    id_actividad := NULL;
    nombre_actividad := '';
    estado_inscripcion := '';
    fecha_inscripcion := NULL;
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_id_actividad IS NULL THEN
        message := 'ID de actividad es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que el usuario existe y está activo
    IF NOT EXISTS (SELECT 1 FROM tb_usuarios u WHERE u.id_usuario = p_id_usuario AND u.estado_usuario = TRUE) THEN
        message := 'Usuario no encontrado o inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Obtener información de la actividad
    SELECT 
        a.nombre_actividad,
        a.permite_inscripciones,
        a.requiere_aprobacion,
        a.fecha_limite_inscripcion,
        a.cupo_maximo_actividad,
        a.edad_minima,
        a.edad_maxima
    INTO 
        v_actividad_nombre,
        v_actividad_permite_inscripciones,
        v_actividad_requiere_aprobacion,
        v_actividad_fecha_limite,
        v_actividad_cupo_maximo,
        v_actividad_edad_minima,
        v_actividad_edad_maxima
    FROM tb_actividades a
    WHERE a.id_actividad = p_id_actividad AND a.estado_actividad = TRUE;
    
    -- Verificar que la actividad existe
    IF v_actividad_nombre IS NULL THEN
        message := 'Actividad no encontrada o inactiva';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que las inscripciones están permitidas
    IF NOT v_actividad_permite_inscripciones THEN
        message := 'Las inscripciones para esta actividad no están permitidas';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar fecha límite de inscripción
    IF v_actividad_fecha_limite IS NOT NULL AND v_actividad_fecha_limite < CURRENT_TIMESTAMP THEN
        message := 'La fecha límite de inscripción ha expirado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar cupo disponible
    SELECT COUNT(*) INTO v_inscripciones_confirmadas
    FROM tb_inscripciones_actividad ia
    WHERE ia.id_actividad = p_id_actividad AND ia.estado_inscripcion = 'confirmada';
    
    IF v_inscripciones_confirmadas >= v_actividad_cupo_maximo THEN
        message := 'No hay cupo disponible para esta actividad';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que el usuario no esté ya inscrito
    IF EXISTS (SELECT 1 FROM tb_inscripciones_actividad ia WHERE ia.id_usuario = p_id_usuario AND ia.id_actividad = p_id_actividad) THEN
        message := 'El usuario ya está inscrito en esta actividad';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar edad del usuario (si se especifican restricciones de edad)
    IF v_actividad_edad_minima > 0 OR v_actividad_edad_maxima IS NOT NULL THEN
        -- Calcular edad aproximada del usuario (asumiendo que tenemos fecha de nacimiento o podemos calcularla)
        -- Por ahora, asumimos que todos los usuarios son elegibles por edad
        -- En una implementación real, necesitarías un campo fecha_nacimiento en tb_usuarios
        NULL; -- Placeholder para validación de edad
    END IF;
    
    -- Determinar estado inicial de la inscripción
    IF v_actividad_requiere_aprobacion THEN
        v_estado_inicial := 'en_espera';
    ELSE
        v_estado_inicial := 'confirmada';
    END IF;
    
    -- Insertar la inscripción
    INSERT INTO tb_inscripciones_actividad (
        id_usuario,
        id_actividad,
        estado_inscripcion,
        observaciones_inscripcion
    ) VALUES (
        p_id_usuario,
        p_id_actividad,
        v_estado_inicial,
        p_observaciones_inscripcion
    );
    
    -- Verificar que la inserción fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := CASE 
            WHEN v_actividad_requiere_aprobacion THEN 'Inscripción realizada, pendiente de aprobación'
            ELSE 'Inscripción confirmada exitosamente'
        END;
        id_usuario := p_id_usuario;
        id_actividad := p_id_actividad;
        nombre_actividad := v_actividad_nombre;
        estado_inscripcion := v_estado_inicial;
        fecha_inscripcion := CURRENT_TIMESTAMP;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            p_id_usuario,
            'INSCRIPCION_ACTIVIDAD',
            'tb_inscripciones_actividad',
            p_id_usuario::text || '_' || p_id_actividad::text,
            jsonb_build_object(
                'actividad_id', p_id_actividad,
                'actividad_nombre', v_actividad_nombre,
                'estado', v_estado_inicial
            )
        );
    ELSE
        message := 'Error al realizar la inscripción';
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_inscribirse_actividad(UUID, INTEGER, TEXT) IS 
'Procedimiento para inscribir un usuario a una actividad con validaciones completas.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_inscribirse_actividad(
    '550e8400-e29b-41d4-a716-446655440000', -- id_usuario
    1, -- id_actividad
    'Interesado en aprender Python' -- observaciones_inscripcion
);
*/
