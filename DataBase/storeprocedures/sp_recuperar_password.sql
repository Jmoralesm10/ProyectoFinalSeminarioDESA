-- =====================================================
-- Procedimiento Almacenado: sp_recuperar_password
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para solicitar recuperación de contraseña
CREATE OR REPLACE FUNCTION sp_solicitar_recuperacion_password(
    p_email VARCHAR(255)                  -- Email del usuario
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    token_recuperacion VARCHAR(500)
) AS $$
DECLARE
    v_usuario RECORD;
    v_token VARCHAR(500);
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    token_recuperacion := '';
    
    -- Validar parámetros
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        message := 'El email es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario
    SELECT 
        u.id_usuario,
        u.email_usuario,
        u.estado_usuario,
        u.email_verificado_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.email_usuario = LOWER(TRIM(p_email));
    
    -- Verificar si el usuario existe
    IF v_usuario.id_usuario IS NULL THEN
        -- Por seguridad, no revelar si el email existe o no
        message := 'Si el email existe, se enviará un enlace de recuperación';
        success := TRUE;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el email está verificado
    IF NOT v_usuario.email_verificado_usuario THEN
        message := 'El email debe estar verificado para recuperar la contraseña';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Generar token de recuperación
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Actualizar usuario con token de recuperación
    UPDATE tb_usuarios 
    SET 
        token_recuperacion_usuario = v_token,
        fecha_expiracion_token_usuario = CURRENT_TIMESTAMP + INTERVAL '1 hour', -- Token válido por 1 hora
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = v_usuario.id_usuario;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Token de recuperación generado exitosamente';
        token_recuperacion := v_token;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            v_usuario.id_usuario,
            'SOLICITUD_RECUPERACION_PASSWORD',
            'tb_usuarios',
            v_usuario.id_usuario::text,
            jsonb_build_object(
                'email', v_usuario.email_usuario
            )
        );
    ELSE
        message := 'Error al generar token de recuperación';
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para cambiar contraseña usando token de recuperación
CREATE OR REPLACE FUNCTION sp_cambiar_password_recuperacion(
    p_token_recuperacion VARCHAR(500),    -- Token de recuperación
    p_nueva_password VARCHAR(255)         -- Nueva contraseña
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
    IF p_token_recuperacion IS NULL OR TRIM(p_token_recuperacion) = '' THEN
        message := 'Token de recuperación requerido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_nueva_password IS NULL OR TRIM(p_nueva_password) = '' THEN
        message := 'La nueva contraseña es obligatoria';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar fortaleza de la nueva contraseña
    IF LENGTH(p_nueva_password) < 8 THEN
        message := 'La nueva contraseña debe tener al menos 8 caracteres';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario por token de recuperación
    SELECT 
        u.id_usuario,
        u.email_usuario,
        u.estado_usuario,
        u.fecha_expiracion_token_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.token_recuperacion_usuario = p_token_recuperacion;
    
    -- Verificar si el token existe
    IF v_usuario.id_usuario IS NULL THEN
        message := 'Token de recuperación inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el token no ha expirado
    IF v_usuario.fecha_expiracion_token_usuario IS NULL OR v_usuario.fecha_expiracion_token_usuario < CURRENT_TIMESTAMP THEN
        message := 'El token de recuperación ha expirado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Cambiar la contraseña
    UPDATE tb_usuarios 
    SET 
        password_hash_usuario = crypt(p_nueva_password, gen_salt('bf')),
        token_recuperacion_usuario = NULL, -- Limpiar token usado
        fecha_expiracion_token_usuario = NULL,
        intentos_login_usuario = 0, -- Resetear intentos fallidos
        bloqueado_hasta_usuario = NULL,
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = v_usuario.id_usuario;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Contraseña cambiada exitosamente';
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
            'PASSWORD_CAMBIADA_RECUPERACION',
            'tb_usuarios',
            v_usuario.id_usuario::text,
            jsonb_build_object(
                'email', v_usuario.email_usuario
            )
        );
    ELSE
        message := 'Error al cambiar la contraseña';
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de los procedimientos
COMMENT ON FUNCTION sp_solicitar_recuperacion_password(VARCHAR) IS 
'Procedimiento para solicitar recuperación de contraseña. Genera un token válido por 1 hora.';

COMMENT ON FUNCTION sp_cambiar_password_recuperacion(VARCHAR, VARCHAR) IS 
'Procedimiento para cambiar contraseña usando token de recuperación.';

-- Ejemplos de uso:
/*
-- Solicitar recuperación
SELECT * FROM sp_solicitar_recuperacion_password('usuario@email.com');

-- Cambiar contraseña
SELECT * FROM sp_cambiar_password_recuperacion('token_aqui', 'nueva_contraseña123');
*/
