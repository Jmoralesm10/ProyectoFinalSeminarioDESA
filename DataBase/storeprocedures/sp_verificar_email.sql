-- =====================================================
-- Procedimiento Almacenado: sp_verificar_email
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para verificar el email de un usuario
CREATE OR REPLACE FUNCTION sp_verificar_email(
    p_token_verificacion VARCHAR(500)     -- Token de verificación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    email_usuario VARCHAR(255)
) AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    email_usuario := '';
    
    -- Validar parámetros
    IF p_token_verificacion IS NULL OR TRIM(p_token_verificacion) = '' THEN
        message := 'Token de verificación requerido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario por token
    SELECT 
        u.id_usuario,
        u.email_usuario,
        u.email_verificado_usuario,
        u.estado_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.token_verificacion_usuario = p_token_verificacion;
    
    -- Verificar si el token existe
    IF v_usuario.id_usuario IS NULL THEN
        message := 'Token de verificación inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el email ya está verificado
    IF v_usuario.email_verificado_usuario THEN
        message := 'El email ya está verificado';
        id_usuario := v_usuario.id_usuario;
        email_usuario := v_usuario.email_usuario;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Marcar email como verificado
    UPDATE tb_usuarios 
    SET 
        email_verificado_usuario = TRUE,
        token_verificacion_usuario = NULL, -- Limpiar token usado
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = v_usuario.id_usuario;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Email verificado exitosamente';
        id_usuario := v_usuario.id_usuario;
        email_usuario := v_usuario.email_usuario;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            v_usuario.id_usuario,
            'EMAIL_VERIFICADO',
            'tb_usuarios',
            v_usuario.id_usuario::text,
            jsonb_build_object(
                'email', v_usuario.email_usuario
            )
        );
    ELSE
        message := 'Error al verificar el email';
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
COMMENT ON FUNCTION sp_verificar_email(VARCHAR) IS 
'Procedimiento para verificar el email de un usuario usando el token de verificación.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_verificar_email('token_de_verificacion_aqui');
*/
