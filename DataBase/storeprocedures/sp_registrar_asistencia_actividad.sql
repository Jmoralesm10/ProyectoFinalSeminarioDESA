-- =====================================================
-- Procedimiento: sp_registrar_asistencia_actividad
-- Descripción: Registra la asistencia de un usuario a una actividad específica
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_registrar_asistencia_actividad(
    p_codigo_qr_usuario VARCHAR(500),  -- Código QR único del usuario
    p_id_actividad INTEGER             -- ID de la actividad
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    id_actividad INTEGER,
    nombre_completo TEXT,
    nombre_actividad VARCHAR(200),
    fecha_asistencia TIMESTAMP
) AS $$
DECLARE
    v_id_usuario UUID;
    v_nombre_completo TEXT;
    v_nombre_actividad VARCHAR(200);
    v_fecha_actual TIMESTAMP;
    v_ya_asistio BOOLEAN := FALSE;
    v_actividad_existe BOOLEAN := FALSE;
    v_actividad_activa BOOLEAN := FALSE;
    v_usuario_inscrito BOOLEAN := FALSE;
    v_fecha_actividad TIMESTAMP;
BEGIN
    -- Inicializar variables
    v_fecha_actual := CURRENT_TIMESTAMP;
    
    -- Validar parámetros de entrada
    IF p_codigo_qr_usuario IS NULL OR TRIM(p_codigo_qr_usuario) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El código QR no puede estar vacío' as message,
            NULL::UUID as id_usuario,
            NULL::INTEGER as id_actividad,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    IF p_id_actividad IS NULL OR p_id_actividad <= 0 THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de actividad no es válido' as message,
            NULL::UUID as id_usuario,
            NULL::INTEGER as id_actividad,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    -- Buscar el usuario por código QR
    SELECT u.id_usuario, 
           u.nombre_usuario || ' ' || u.apellido_usuario
    INTO v_id_usuario, v_nombre_completo
    FROM tb_usuarios u
    WHERE u.codigo_qr_usuario = p_codigo_qr_usuario
    AND u.estado_usuario = TRUE;
    
    -- Validar que el usuario existe y está activo
    IF v_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado o inactivo' as message,
            NULL::UUID as id_usuario,
            NULL::INTEGER as id_actividad,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    -- Verificar que la actividad existe y está activa
    SELECT a.nombre_actividad, a.fecha_inicio_actividad, a.estado_actividad
    INTO v_nombre_actividad, v_fecha_actividad, v_actividad_activa
    FROM tb_actividades a
    WHERE a.id_actividad = p_id_actividad;
    
    IF v_nombre_actividad IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Actividad no encontrada' as message,
            v_id_usuario as id_usuario,
            p_id_actividad as id_actividad,
            v_nombre_completo as nombre_completo,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    IF NOT v_actividad_activa THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'La actividad no está activa' as message,
            v_id_usuario as id_usuario,
            p_id_actividad as id_actividad,
            v_nombre_completo as nombre_completo,
            v_nombre_actividad as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    -- Verificar que el usuario está inscrito en la actividad
    SELECT EXISTS(
        SELECT 1 FROM tb_inscripciones_actividad ia
        WHERE ia.id_usuario = v_id_usuario 
        AND ia.id_actividad = p_id_actividad
        AND ia.estado_inscripcion = 'confirmada'
    ) INTO v_usuario_inscrito;
    
    IF NOT v_usuario_inscrito THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El usuario no está inscrito en esta actividad' as message,
            v_id_usuario as id_usuario,
            p_id_actividad as id_actividad,
            v_nombre_completo as nombre_completo,
            v_nombre_actividad as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
        RETURN;
    END IF;
    
    -- Verificar si ya asistió a esta actividad
    SELECT EXISTS(
        SELECT 1 FROM tb_asistencia_actividad aa
        WHERE aa.id_usuario = v_id_usuario 
        AND aa.id_actividad = p_id_actividad
    ) INTO v_ya_asistio;
    
    -- Si ya asistió, retornar información existente
    IF v_ya_asistio THEN
        RETURN QUERY SELECT 
            TRUE as success,
            'Usuario ya registró asistencia a esta actividad' as message,
            v_id_usuario as id_usuario,
            p_id_actividad as id_actividad,
            v_nombre_completo as nombre_completo,
            v_nombre_actividad as nombre_actividad,
            aa.fecha_asistencia as fecha_asistencia
        FROM tb_asistencia_actividad aa
        WHERE aa.id_usuario = v_id_usuario 
        AND aa.id_actividad = p_id_actividad;
        RETURN;
    END IF;
    
    -- Registrar la asistencia
    INSERT INTO tb_asistencia_actividad (id_usuario, id_actividad, fecha_asistencia)
    VALUES (v_id_usuario, p_id_actividad, v_fecha_actual);
    
    -- Retornar éxito
    RETURN QUERY SELECT 
        TRUE as success,
        'Asistencia a actividad registrada exitosamente' as message,
        v_id_usuario as id_usuario,
        p_id_actividad as id_actividad,
        v_nombre_completo as nombre_completo,
        v_nombre_actividad as nombre_actividad,
        v_fecha_actual as fecha_asistencia;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al registrar asistencia: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::INTEGER as id_actividad,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::TIMESTAMP as fecha_asistencia;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_registrar_asistencia_actividad(VARCHAR, INTEGER) IS 
'Registra la asistencia de un usuario a una actividad específica mediante su código QR. 
Valida que el usuario esté inscrito, la actividad esté activa y previene registros duplicados.';

-- Ejemplo de uso:
-- SELECT * FROM sp_registrar_asistencia_actividad('QR123456789', 1);
