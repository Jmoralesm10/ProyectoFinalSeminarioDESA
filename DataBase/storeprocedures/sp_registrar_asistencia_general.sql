-- =====================================================
-- Procedimiento: sp_registrar_asistencia_general
-- Descripción: Registra la asistencia general de un usuario al congreso
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_registrar_asistencia_general(
    p_codigo_qr_usuario VARCHAR(500)  -- Código QR único del usuario
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_completo TEXT,
    fecha_asistencia DATE,
    hora_ingreso TIMESTAMP
) AS $$
DECLARE
    v_id_usuario UUID;
    v_nombre_completo TEXT;
    v_fecha_actual DATE;
    v_hora_actual TIMESTAMP;
    v_ya_asistio BOOLEAN := FALSE;
BEGIN
    -- Inicializar variables
    v_fecha_actual := CURRENT_DATE;
    v_hora_actual := CURRENT_TIMESTAMP;
    
    -- Validar que el código QR no esté vacío
    IF p_codigo_qr_usuario IS NULL OR TRIM(p_codigo_qr_usuario) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El código QR no puede estar vacío' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_ingreso;
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
            NULL::TEXT as nombre_completo,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_ingreso;
        RETURN;
    END IF;
    
    -- Verificar si ya asistió hoy
    SELECT EXISTS(
        SELECT 1 FROM tb_asistencia_general ag
        WHERE ag.id_usuario = v_id_usuario 
        AND ag.fecha_asistencia = v_fecha_actual
    ) INTO v_ya_asistio;
    
    -- Si ya asistió, retornar información existente
    IF v_ya_asistio THEN
        RETURN QUERY SELECT 
            TRUE as success,
            'Usuario ya registró asistencia hoy' as message,
            v_id_usuario as id_usuario,
            v_nombre_completo as nombre_completo,
            ag.fecha_asistencia as fecha_asistencia,
            ag.hora_ingreso as hora_ingreso
        FROM tb_asistencia_general ag
        WHERE ag.id_usuario = v_id_usuario 
        AND ag.fecha_asistencia = v_fecha_actual;
        RETURN;
    END IF;
    
    -- Registrar la asistencia
    INSERT INTO tb_asistencia_general (id_usuario, fecha_asistencia, hora_ingreso)
    VALUES (v_id_usuario, v_fecha_actual, v_hora_actual);
    
    -- Retornar éxito
    RETURN QUERY SELECT 
        TRUE as success,
        'Asistencia registrada exitosamente' as message,
        v_id_usuario as id_usuario,
        v_nombre_completo as nombre_completo,
        v_fecha_actual as fecha_asistencia,
        v_hora_actual as hora_ingreso;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al registrar asistencia: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_ingreso;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_registrar_asistencia_general(VARCHAR) IS 
'Registra la asistencia general de un usuario al congreso mediante su código QR. 
Previene registros duplicados en el mismo día y valida que el usuario esté activo.';

-- Ejemplo de uso:
-- SELECT * FROM sp_registrar_asistencia_general('QR123456789');
